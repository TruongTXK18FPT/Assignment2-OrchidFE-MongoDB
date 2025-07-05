import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import type { LoginRequest, RegisterRequest, User } from '../types/orchid';
import backgroundImage from '../assets/Background.jpeg';
import logoOrchid from '../assets/LogoOrchid.jpeg';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    accountName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

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

    try {
      if (formType === 'login') {
        const loginData: LoginRequest = {
          email: formData.email,
          password: formData.password
        };
        
        const response = await authAPI.login(loginData);
        if (response.result) {
          const userData: User = {
            accountId: response.result.accountId,
            accountName: response.result.accountName,
            email: response.result.email,
            roleId: response.result.roleId,
            roleName: response.result.roleName,
            token: response.result.token
          };
          
          login(userData);
          toast.success(`Welcome back, ${userData.accountName}!`);
          
          // Redirect based on role
          const roleId = userData.roleId;
          const isAdminRole = roleId === 'SUPERADMIN' || roleId === 'ADMIN' ||
                             userData.roleName?.toLowerCase() === 'admin' || 
                             userData.roleName?.toLowerCase() === 'superadmin';
          
          if (isAdminRole) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } else if (formType === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          toast.error('Passwords do not match');
          return;
        }
        
        const registerData: RegisterRequest = {
          accountName: formData.accountName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };
        
        const response = await authAPI.register(registerData);
        if (response.result) {
          setFormType('login');
          setError('');
          toast.success('Registration successful! Please login with your credentials.');
          // Clear the form data
          setFormData({
            accountName: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ?? 'An error occurred';
      setError(errorMessage);
      
      if (formType === 'login') {
        toast.error(`Login failed: ${errorMessage}`);
      } else {
        toast.error(`Registration failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Please wait...';
    if (formType === 'login') return 'Login';
    return 'Register';
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
    <div className="login-page">
      <div className="login-bg-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
      
      <motion.div
        className="login-form-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img className="login-logo" src={logoOrchid} alt="Orchid Shop Logo" />
        
        <AnimatePresence mode="wait">
          <motion.form
            className="login-form"
            key={formType}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSubmit}
          >
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  color: '#ff4444', 
                  textAlign: 'center', 
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  backgroundColor: '#ffebee',
                  borderRadius: '4px'
                }}
              >
                {error}
              </motion.div>
            )}

            {formType === 'register' && (
              <div className="login-input-group">
                <div className="login-input-icon"><FaUser /></div>
                <motion.input 
                  className="login-form-input"
                  type="text" 
                  name="accountName"
                  placeholder="Full Name"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  whileFocus="focus"
                  variants={inputVariants}
                  required
                />
              </div>
            )}

            <div className="login-input-group">
              <div className="login-input-icon"><FaEnvelope /></div>
              <motion.input 
                className="login-form-input"
                type="email" 
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                whileFocus="focus"
                variants={inputVariants}
                required
              />
            </div>

            <div className="login-input-group">
              <div className="login-input-icon"><FaLock /></div>
              <motion.input 
                className="login-form-input"
                type="password" 
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                whileFocus="focus"
                variants={inputVariants}
                required
              />
            </div>
            
            {formType === 'register' && (
              <div className="login-input-group">
                <div className="login-input-icon"><FaLock /></div>
                <motion.input 
                  className="login-form-input"
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  whileFocus="focus"
                  variants={inputVariants}
                  required
                />
              </div>
            )}

            <motion.button
              className="btn-login"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              disabled={loading}
            >
              {getButtonText()}
            </motion.button>

            {formType === 'login' && (
              <>
                <motion.p
                  className="login-link"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setFormType('register')}
                >
                  Don't have an account? Register
                </motion.p>
                <motion.p
                  className="login-link"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </motion.p>
              </>
            )}

            {formType !== 'login' && (
              <motion.p
                className="login-link"
                whileHover={{ scale: 1.05 }}
                onClick={() => setFormType('login')}
              >
                Back to Login
              </motion.p>
            )}
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;