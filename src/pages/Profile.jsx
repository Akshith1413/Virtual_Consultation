import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChangePasswordModal from '../components/ChangePasswordModal';
import UpdateProfileModal from '../components/UpdateProfileModal';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setProfileData(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        navigate('/signin');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handlePasswordUpdate = async (currentPassword, newPassword) => {
    try {
      await axios.put('update-password', { currentPassword, newPassword }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccess('Password updated successfully');
      setError('');
      setShowPasswordModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      setSuccess('');
    }
  };

  const handleProfileUpdate = async (username, email) => {
    try {
      const response = await axios.put('update-profile', { username, email }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfileData(response.data.user);
      setSuccess('Profile updated successfully');
      setError('');
      setShowProfileModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setSuccess('');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      try {
        await axios.delete('delete-account', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        logout();
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-850 dark:to-gray-900"
    >
      <Navbar />
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg text-indigo-700 dark:text-indigo-300"
          >
            {success}
          </motion.div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Personal details and account information.</p>
          </div>
          <div className="px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{profileData.username}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">{profileData.email}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account created</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  {new Date(profileData.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Account Actions</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-blue-900/20 transition-all">
                <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Update Profile</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">Change your username or email</p>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-black bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
                >
                  Update Profile
                </button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-blue-900/20 transition-all">
                <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Change Password</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">Update your account password</p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-gray-500 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
                >
                  Change Password
                </button>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-red-900/20 transition-all">
                <h4 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Delete Account</h4>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">Permanently delete your account</p>
                <button
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-600 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-600 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordUpdate}
        />
      )}

      {/* Update Profile Modal */}
      {showProfileModal && (
        <UpdateProfileModal
          currentUsername={profileData.username}
          currentEmail={profileData.email}
          onClose={() => setShowProfileModal(false)}
          onSubmit={handleProfileUpdate}
        />
      )}
    </motion.div>
  );
};

export default Profile;
 
 
 
 
 
 

// minor tweak for clarity
