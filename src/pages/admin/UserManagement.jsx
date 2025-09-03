import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiDownload, 
  FiSearch, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiUser, 
  FiShield, 
  FiXCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';
import supabase from '../../utils/supabase';
import toast from 'react-hot-toast';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [blockEmail, setBlockEmail] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus === 'blocked') {
        query = query.eq('is_blocked', true);
      } else if (filterStatus === 'active') {
        query = query.eq('is_blocked', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setUsers(data || []);
      console.log('Fetched users:', data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_number?.includes(searchTerm) ||
    user.exam_preparing_for?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Block/Unblock User by Email
  const handleBlockUser = async () => {
    if (!blockEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setBlockLoading(true);
    try {
      // First, check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, full_name, is_blocked')
        .eq('email', blockEmail.toLowerCase())
        .single();

      if (fetchError || !existingUser) {
        toast.error('User not found with this email address');
        return;
      }

      // Toggle block status
      const newBlockStatus = !existingUser.is_blocked;
      
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: newBlockStatus })
        .eq('email', blockEmail.toLowerCase());

      if (error) throw error;

      toast.success(`User ${newBlockStatus ? 'blocked' : 'unblocked'} successfully`);
      setBlockEmail('');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast.error('Failed to update user status');
    } finally {
      setBlockLoading(false);
    }
  };

  // Additional handler for button block/unblock from table
  const handleBlockUserWithEmail = async (email) => {
    if (!email) {
      toast.error('Invalid email address');
      return;
    }

    setBlockLoading(true);
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, is_blocked')
        .eq('email', email.toLowerCase())
        .single();

      if (fetchError || !existingUser) {
        toast.error('User not found');
        return;
      }

      const newBlockStatus = !existingUser.is_blocked;

      const { error } = await supabase
        .from('users')
        .update({ is_blocked: newBlockStatus })
        .eq('email', email.toLowerCase());

      if (error) throw error;

      toast.success(`User ${newBlockStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user block status:', error);
      toast.error('Failed to update user status');
    } finally {
      setBlockLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Get all users for export
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvHeaders = [
        'ID',
        'Full Name', 
        'Email',
        'Mobile Number',
        'Exam Preparing For',
        'Registration Date',
        'Status',
        'Email Verified',
        'Last Sign In'
      ];

      const csvData = allUsers.map(user => [
        user.id,
        user.full_name || '',
        user.email || '',
        user.mobile_number || '',
        user.exam_preparing_for || '',
        new Date(user.created_at).toLocaleDateString(),
        user.is_blocked ? 'Blocked' : 'Active',
        user.email_confirmed_at ? 'Yes' : 'No',
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
      ]);

      // Create CSV content
      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${allUsers.length} users to CSV`);
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (user) => {
    if (user.is_blocked) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FiXCircle size={12} className="mr-1" />
          Blocked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FiCheckCircle size={12} className="mr-1" />
        Active
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiUsers className="mr-3 text-blue-600" />
            User Management
          </h2>
          <p className="text-gray-600 mt-1">Manage all registered users, export data, and control access</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={exportToCSV}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <FiDownload size={16} />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <FiRefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiUsers size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiCheckCircle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(user => !user.is_blocked).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FiXCircle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Blocked Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(user => user.is_blocked).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Block User Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiShield className="mr-2 text-orange-600" />
          Block/Unblock User
        </h3>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex-1">
            <input
              type="email"
              value={blockEmail}
              onChange={(e) => setBlockEmail(e.target.value)}
              placeholder="Enter user email to block/unblock"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleBlockUser}
            disabled={blockLoading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <FiAlertCircle size={16} />
            <span>{blockLoading ? 'Processing...' : 'Toggle Block'}</span>
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          Enter the email address of the user you want to block or unblock. The system will automatically toggle their current status.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, or exam..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="blocked">Blocked Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Users List ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiUsers size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <FiMail size={14} className="mr-2 text-gray-400" />
                          {user.email || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <FiPhone size={14} className="mr-2 text-gray-400" />
                          {user.mobile_number || 'N/A'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.exam_preparing_for || 'N/A'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FiCalendar size={14} className="mr-2 text-gray-400" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleBlockUserWithEmail(user.email)}
                        disabled={blockLoading}
                        className={`px-3 py-1 rounded-lg text-white font-semibold transition-colors duration-200 disabled:opacity-50 ${
                          user.is_blocked 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                        title={user.is_blocked ? 'Unblock User' : 'Block User'}
                      >
                        {user.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
