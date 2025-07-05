import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import OrchidManagement from '../components/admin/OrchidManagement';
import OrderManagement from '../components/admin/OrderManagement';
import '../styles/Admin.css';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'orchids' | 'orders'>('employees');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const tabVariants = {
    inactive: { 
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#666'
    },
    active: { 
      backgroundColor: '#9b4dff',
      color: '#fff',
      scale: 1.05,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  return (
    <motion.div 
      className="admin-container"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your employees, orchids, and orders</p>
      </div>

      <div className="admin-tabs">
        <motion.button
          className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
          variants={tabVariants}
          animate={activeTab === 'employees' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Account Management
        </motion.button>
        <motion.button
          className={`tab-button ${activeTab === 'orchids' ? 'active' : ''}`}
          onClick={() => setActiveTab('orchids')}
          variants={tabVariants}
          animate={activeTab === 'orchids' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Orchid Management
        </motion.button>
        <motion.button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          variants={tabVariants}
          animate={activeTab === 'orders' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Order Management
        </motion.button>
      </div>

      <div className="admin-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'employees' ? (
              <EmployeeManagement />
            ) : activeTab === 'orchids' ? (
              <OrchidManagement />
            ) : (
              <OrderManagement />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Admin;
