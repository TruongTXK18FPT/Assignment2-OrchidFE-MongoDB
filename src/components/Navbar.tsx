import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, User, Menu, X, Sparkles, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import logoOrchid from '../assets/LogoOrchid.jpeg';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      logout(); // Logout locally even if API call fails
      navigate('/');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200
      }
    }
  };

  const logoVariants = {
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 0.6
      }
    }
  };

  const sparkleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const navItems: Array<{
    name: string;
    icon: any;
    path: string;
    onClick?: () => void;
  }> = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Shop', icon: ShoppingBag, path: '/shop' },
    ...(isAuthenticated 
      ? [
          { name: 'Profile', icon: User, path: '/profile' },
          ...(isAdmin ? [{ name: 'Admin', icon: Settings, path: '/admin' }] : []),
          { name: 'Logout', icon: LogOut, path: '#', onClick: handleLogout }
        ]
      : [{ name: 'Login', icon: User, path: '/login' }]
    )
  ];

  return (
    <motion.nav 
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="nav-container">
        <motion.div 
          className="nav-logo"
          variants={itemVariants}
        >
          <Link to="/" className="logo-link">
            <motion.div
              className="logo-container"
              variants={logoVariants}
              whileHover="hover"
            >
              <img src={logoOrchid} alt="Orchid Shop Logo" />
              <motion.div
                className="sparkle"
                variants={sparkleVariants}
                animate="animate"
              >
                <Sparkles className="sparkle-icon" />
              </motion.div>
            </motion.div>
            
            <motion.div
              className="logo-text-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="logo-text">Orchid Shop</span>
              <span className="logo-subtitle">Premium Collection</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {item.onClick ? (
                  <button 
                    onClick={item.onClick}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    data-logout={item.name === 'Logout' ? 'true' : undefined}
                  >
                    <motion.div
                      className="nav-icon"
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent />
                    </motion.div>
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <Link 
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <motion.div
                      className="nav-icon"
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent />
                    </motion.div>
                    <span>{item.name}</span>
                    
                    {isActive && (
                      <motion.div
                        className="active-indicator"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="mobile-menu-btn"
          variants={itemVariants}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item.onClick ? (
                    <button
                      onClick={() => {
                        item.onClick?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                      data-logout={item.name === 'Logout' ? 'true' : undefined}
                    >
                      <IconComponent />
                      <span>{item.name}</span>
                    </button>
                  ) : (
                    <Link 
                      to={item.path}
                      className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 