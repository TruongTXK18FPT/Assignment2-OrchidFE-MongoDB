import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Edit, Save, X, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';
import type { AccountDTO } from '../types/orchid';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<AccountDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    accountName: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      if (response.result) {
        setProfileData(response.result);
        setEditData({
          accountName: response.result.accountName,
          email: response.result.email
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData) return;
    
    try {
      setLoading(true);
      const updateData = {
        accountName: editData.accountName
      };
      
      const response = await authAPI.updateProfile(updateData);
      if (response.result) {
        setProfileData(response.result);
        setIsEditing(false);
        setError('');
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ?? 'Failed to update profile';
      setError(errorMessage);
      toast.error(`Profile update failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setEditData({
        accountName: profileData.accountName,
        email: profileData.email
      });
    }
  };

  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case 1: return '#ff6b6b'; // superadmin - red
      case 2: return '#4ecdc4'; // admin - teal
      case 3: return '#45b7d1'; // student - blue
      default: return '#95a5a6'; // default - gray
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>{error}</p>
          <button onClick={fetchProfile}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <motion.div
        className="profile-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="profile-header" variants={itemVariants}>
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-title">
            <h1>My Profile</h1>
            <p>Manage your account information</p>
          </div>
          <motion.button
            className={`edit-btn ${isEditing ? 'editing' : ''}`}
            onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? <X size={20} /> : <Edit size={20} />}
          </motion.button>
        </motion.div>

        <motion.div className="profile-content" variants={itemVariants}>
          <div className="profile-card">
            <div className="profile-field">
              <div className="field-icon">
                <User size={20} />
              </div>
              <div className="field-content">
                <div className="field-label">Full Name</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.accountName}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      accountName: e.target.value
                    }))}
                    className="profile-input"
                    aria-label="Full Name"
                  />
                ) : (
                  <span className="field-value">{profileData?.accountName}</span>
                )}
              </div>
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <Mail size={20} />
              </div>
              <div className="field-content">
                <div className="field-label">Email Address</div>
                <span className="field-value">{profileData?.email}</span>
              </div>
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <Shield size={20} />
              </div>
              <div className="field-content">
                <div className="field-label">Role</div>
                <span 
                  className="role-badge"
                  style={{ backgroundColor: getRoleColor(Number(profileData?.roleId) || 0) }}
                >
                  {profileData?.roleName}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <motion.div 
            className="profile-quick-actions"
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <motion.button
                className="quick-action-btn orders-btn"
                onClick={() => navigate('/my-orders')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag size={24} />
                <div className="action-text">
                  <span className="action-title">My Orders</span>
                  <span className="action-desc">View your order history</span>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {error && (
            <motion.div
              className="profile-error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {isEditing && (
            <motion.div
              className="profile-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className="save-btn"
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
              <motion.button
                className="cancel-btn"
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
                Cancel
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
