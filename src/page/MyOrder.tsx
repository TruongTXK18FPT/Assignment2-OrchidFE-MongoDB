import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaEye } from 'react-icons/fa';
import { orderAPI } from '../utils/api';
import { formatPrice } from '../utils/formatters';
import type { OrderDTO } from '../types/orchid';
import '../styles/MyOrder.css';

const MyOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.accountId) {
        toast.error('Please login to view your orders');
        navigate('/login');
        return;
      }
      
      const data = await orderAPI.getOrdersByAccount(user.accountId);
      setOrders(data);
      toast.success(`Loaded ${data.length} orders successfully!`);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'processing':
        return <FaBox className="status-icon processing" />;
      case 'shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#9b59b6';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus.toLowerCase() === selectedStatus.toLowerCase());

  const handleViewTransaction = (orderId: number) => {
    navigate(`/transaction/${orderId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          🌸
        </motion.div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="my-orders-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="my-orders-header">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="orders-title"
        >
          <FaBox className="orders-title-icon" />
          My Orders
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Track and manage your orchid orders
        </motion.p>
      </div>

      <div className="orders-filters">
        <motion.div 
          className="filter-tabs"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <motion.button
              key={status}
              className={`filter-tab ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="order-count">
                {status === 'all' 
                  ? orders.length 
                  : orders.filter(order => order.orderStatus.toLowerCase() === status).length
                }
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {filteredOrders.length === 0 ? (
          <motion.div
            className="no-orders"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="no-orders-icon">🌺</div>
            <h3>No orders found</h3>
            <p>
              {selectedStatus === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${selectedStatus} orders found.`
              }
            </p>
            <motion.button
              className="shop-now-btn"
              onClick={() => navigate('/shop')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="orders-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                className="order-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
              >
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.orderStatus)}
                    <span 
                      className="status-text"
                      style={{ color: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-summary">
                  <div className="order-total">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-amount">{formatPrice(order.totalAmount)} VND</span>
                  </div>
                  
                  {order.orderDetails && order.orderDetails.length > 0 && (
                    <div className="order-items-preview">
                      <p className="items-count">
                        {order.orderDetails.length} item{order.orderDetails.length > 1 ? 's' : ''}
                      </p>
                      <div className="items-images">
                        {order.orderDetails.slice(0, 3).map((detail, idx) => (
                          <img
                            key={idx}
                            src={detail.orchidUrl || '/placeholder-orchid.jpg'}
                            alt={detail.orchidName || 'Orchid'}
                            className="item-thumbnail"
                          />
                        ))}
                        {order.orderDetails.length > 3 && (
                          <div className="more-items">
                            +{order.orderDetails.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <motion.button
                    className="view-details-btn"
                    onClick={() => handleViewTransaction(order.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEye /> View Details
                  </motion.button>
                  
                  {order.orderStatus.toLowerCase() === 'delivered' && (
                    <motion.button
                      className="reorder-btn"
                      onClick={() => {
                        // Navigate to shop with the items from this order
                        toast.info('Reorder feature coming soon!');
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reorder
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyOrder;
