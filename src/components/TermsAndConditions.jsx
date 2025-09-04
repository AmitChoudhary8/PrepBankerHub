import React from 'react';
import { FiHome, FiArrowLeft, FiShield, FiFileText, FiUsers, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function TermsAndConditions() {
  const lastUpdated = "September 4, 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <FiArrowLeft size={20} className="mr-2" />
                Back to Home
              </Link>
            </div>
            <img 
              src="/assets/logo.png" 
              alt="PrepBankerHub" 
              className="h-12 w-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiFileText size={32} className="text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Terms and Conditions</h1>
            <p className="text-gray-600">Last updated: {lastUpdated}</p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiShield size={20} className="mr-2 text-blue-600" />
                1. Introduction and Acceptance
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to PrepBankerHub ("we", "our", or "us"). These Terms and Conditions ("Terms") 
                govern your use of our website located at PrepBankerHub.netlify.app and all related 
                services provided by us.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using our website, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these Terms, please do not 
                use our services.
              </p>
            </section>

            {/* Content Disclaimer */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiFileText size={20} className="mr-2 text-blue-600" />
                2. Content and Intellectual Property
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-medium">Important Notice:</p>
                <p className="text-yellow-700">
                  All content available on our website, including PDFs, study materials, current affairs 
                  magazines, practice sets, and other educational resources, is freely available on the 
                  internet from various sources. We do not own or claim ownership of this content.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We serve as an aggregator platform, collecting and organizing publicly available educational content in one convenient location</li>
                <li>All original copyrights remain with their respective owners</li>
                <li>We do not claim any ownership rights over the educational materials provided</li>
                <li>If you are a copyright owner and believe your content has been used inappropriately, please contact us immediately</li>
                <li>We will promptly remove any content upon valid copyright claims</li>
              </ul>
            </section>

            {/* User Data and Privacy */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiUsers size={20} className="mr-2 text-blue-600" />
                3. User Data and Marketing
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 font-medium">Data Usage Policy:</p>
                <p className="text-blue-700">
                  By creating an account and using our services, you consent to our use of your 
                  personal information for promotional and marketing purposes.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We may use your email address and contact information for promotional communications</li>
                <li>Your data may be used to send updates about new study materials, exam notifications, and educational content</li>
                <li>We may contact you regarding new features, services, and improvements to our platform</li>
                <li>You can opt-out of promotional communications at any time by contacting us</li>
                <li>We will never sell your personal information to third parties</li>
                <li>Your data is securely stored and protected according to industry standards</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                4. User Responsibilities
              </h2>
              <p className="text-gray-700 mb-4">As a user of our platform, you agree to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and truthful information during registration</li>
                <li>Use the platform solely for educational and personal learning purposes</li>
                <li>Not share your account credentials with others</li>
                <li>Not attempt to hack, disrupt, or damage our systems</li>
                <li>Not use the platform for any illegal or unauthorized purposes</li>
                <li>Respect the intellectual property rights of content creators</li>
                <li>Not redistribute or commercially use the materials without permission</li>
              </ul>
            </section>

            {/* Service Availability */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                5. Service Availability and Modifications
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We strive to maintain 24/7 availability but cannot guarantee uninterrupted service</li>
                <li>We reserve the right to modify, suspend, or discontinue any part of our service</li>
                <li>We may update content, features, and functionality without prior notice</li>
                <li>Maintenance and updates may temporarily affect service availability</li>
                <li>We are not liable for any inconvenience caused by service interruptions</li>
              </ul>
            </section>

            {/* Account Termination */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                6. Account Management and Termination
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                <li>Users can delete their accounts at any time by contacting support</li>
                <li>Terminated accounts will lose access to all platform features</li>
                <li>We may retain certain data for legal and operational purposes</li>
                <li>Repeated violations may result in permanent account bans</li>
              </ul>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                7. Disclaimers and Limitations
              </h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800 font-medium">Important Disclaimer:</p>
                <p className="text-red-700">
                  Our platform is provided "as is" without warranties of any kind. We do not guarantee 
                  the accuracy, completeness, or reliability of any content.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We are not responsible for exam results or career outcomes</li>
                <li>Study materials are supplementary and should be used with other resources</li>
                <li>We do not guarantee that our content is error-free or up-to-date</li>
                <li>Users should verify information from official sources</li>
                <li>We are not liable for any direct or indirect damages from platform use</li>
              </ul>
            </section>

            {/* Updates to Terms */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                8. Updates to Terms and Conditions
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We may update these Terms at any time without prior notice</li>
                <li>Updated Terms will be posted on this page with a new "Last Updated" date</li>
                <li>Continued use of our platform constitutes acceptance of updated Terms</li>
                <li>Major changes may be communicated via email or platform notifications</li>
                <li>Users are encouraged to review Terms periodically</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiMail size={20} className="mr-2 text-blue-600" />
                9. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Website:</strong> PrepBankerHub.netlify.app</li>
                  <li><strong>Platform:</strong> PrepBankerHub</li>
                  <li><strong>Purpose:</strong> Banking Exam Preparation Platform</li>
                  <li><strong>Support:</strong> Available through the platform</li>
                </ul>
              </div>
            </section>

            {/* Agreement */}
            <section className="border-t pt-6">
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-green-800 font-medium">Agreement Acknowledgment:</p>
                <p className="text-green-700">
                  By using PrepBankerHub, you acknowledge that you have read, understood, and agree 
                  to be bound by these Terms and Conditions. These terms constitute a legal agreement 
                  between you and PrepBankerHub.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center">
            <Link 
              to="/" 
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiHome size={20} className="mr-2" />
              Return to PrepBankerHub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
