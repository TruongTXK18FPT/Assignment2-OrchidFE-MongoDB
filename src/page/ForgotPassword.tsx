import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';
import type { ForgotPasswordRequest, ResetPasswordRequest } from '../types/orchid';
import backgroundImage from '../assets/Background.jpeg';
import logoOrchid from '../assets/LogoOrchid.jpeg';
import '../styles/ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isResetMode = !!token;
  
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    if (isResetMode) {
      // Reset password logic
      if (formData.newPassword !== formData.confirmPassword) {
        const errorMsg = 'Passwords do not match';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        const errorMsg = 'Password must be at least 6 characters long';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      if (!token) {
        const errorMsg = 'Invalid reset token';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      const resetData: ResetPasswordRequest = {
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      };

      await authAPI.resetPassword(resetData);
      const successMsg = 'Password reset successfully! You can now login with your new password.';
      setSuccess(successMsg);
      toast.success(successMsg);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      // Forgot password
      const forgotData: ForgotPasswordRequest = {
        email: formData.email
      };

      const response = await authAPI.forgotPassword(forgotData);
      console.log('Token received:', response.result);

      // Show email sent confirmation instead of redirecting
      setEmailSent(true);
      setSuccess('');
      setError('');
      toast.success(`Password reset instructions sent to ${formData.email}`);

      // Log the reset URL for testing purposes
      if (response.result) {
        const resetUrl = `${window.location.origin}/forgot-password?token=${response.result}`;
        console.log('Reset URL for testing:', resetUrl);
        console.log('You can copy this URL to test the reset flow');
      }
    }
  } catch (err: any) {
    console.error('API Error:', err);
    const errorMessage = err.response?.data?.message ?? err.message ?? 'An error occurred';
    setError(errorMessage);
    
    if (isResetMode) {
      toast.error(`Password reset failed: ${errorMessage}`);
    } else {
      toast.error(`Failed to send reset email: ${errorMessage}`);
    }
  } finally {
    setLoading(false);
  }
};

  const getButtonText = () => {
    if (loading) return 'Please wait...';
    return isResetMode ? 'Reset Password' : 'Send Reset Link';
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const inputVariants = {
    focus: { scale: 1.02 },
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-bg-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
      
      <motion.div
        className="forgot-password-form-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img className="forgot-password-logo" src={logoOrchid} alt="Orchid Shop Logo" />
        
        <motion.form
          className="forgot-password-form"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
        >
          <div className="forgot-password-header">
            <h2>{isResetMode ? 'Reset Your Password' : 'Forgot Password?'}</h2>
            <p>
              {isResetMode 
                ? 'Please enter your new password below. Make sure it\'s strong and secure.'
                : 'No worries! Enter your email address and we\'ll send you a link to reset your password.'
              }
            </p>
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="success-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {success}
            </motion.div>
          )}

          {!isResetMode && emailSent ? (
  // Email sent confirmation
  <motion.div
    className="email-sent-confirmation"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="email-sent-icon">
      <FaEnvelope />
    </div>
    <h3>Check Your Email</h3>
    <p>
      We've sent password reset instructions to <strong>{formData.email}</strong>
    </p>
    <p>
      Please check your email and click the reset link to set a new password.
    </p>
    <p>
      If you don't see the email within a few minutes, check your spam folder.
    </p>
    
    {/* For testing purposes - show the reset link */}
    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
      <small style={{ color: '#666' }}>
        For testing: Check browser console for the reset URL
      </small>
    </div>

    <motion.button
      className="btn-resend-email"
      type="button"
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={() => {
        setEmailSent(false);
        setFormData(prev => ({ ...prev, email: '' }));
      }}
      disabled={loading}
    >
      Try Different Email
    </motion.button>
  </motion.div>
          ) : (
            <>
              {!isResetMode ? (
                <div className="forgot-password-input-group">
                  <div className="forgot-password-input-icon"><FaEnvelope /></div>
                  <motion.input 
                    className="forgot-password-form-input"
                    type="email" 
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    whileFocus="focus"
                    variants={inputVariants}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="forgot-password-input-group">
                    <div className="forgot-password-input-icon"><FaLock /></div>
                    <motion.input 
                      className="forgot-password-form-input"
                      type="password" 
                      name="newPassword"
                      placeholder="New Password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      whileFocus="focus"
                      variants={inputVariants}
                      required
                    />
                  </div>

                  <div className="forgot-password-input-group">
                    <div className="forgot-password-input-icon"><FaLock /></div>
                    <motion.input 
                      className="forgot-password-form-input"
                      type="password" 
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      whileFocus="focus"
                      variants={inputVariants}
                      required
                    />
                  </div>
                </>
              )}

              <motion.button
                className="btn-forgot-password"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                disabled={loading}
              >
                {getButtonText()}
              </motion.button>
            </>
          )}

          <Link to="/login" className="back-to-login">
            <FaArrowLeft />
            Back to Login
          </Link>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
