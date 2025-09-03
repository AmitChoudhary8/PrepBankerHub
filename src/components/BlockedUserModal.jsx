import React from 'react';
import { FiX } from 'react-icons/fi';

const BlockedUserModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 modal-animate">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-red-600">Account Blocked</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <FiX size={32} className="text-red-600" />
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">
            Your account has been temporarily blocked due to activities that violate our website's terms and conditions.
          </p>
          
          <p className="text-gray-600 mb-6">
            To request unblocking, please contact us at:
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-6">
            <a 
              href="mailto:info.amitsihag@gamil.com" 
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              info.amitsihag@gmail.com
            </a>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockedUserModal;
