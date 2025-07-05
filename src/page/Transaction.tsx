import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaCalendar, FaCreditCard, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import { orderAPI } from '../utils/api';
import { formatPrice } from '../utils/formatters';
import { parseNumber } from '../utils/numberUtils';
import type { OrderDTO } from '../types/orchid';
import '../styles/Transaction.css';

const Transaction: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.accountId) {
        toast.error('Please login to view order details');
        navigate('/login');
        return;
      }

      if (!orderId) {
        toast.error('Order ID not provided');
        navigate('/my-orders');
        return;
      }

      console.log('Fetching order details for ID:', orderId);

      // Method 1: Try to get all orders and find the specific one
      try {
        const orders = await orderAPI.getOrdersByAccount(user.accountId.toString());
        console.log('All orders for user:', orders);
        
        const foundOrder = orders.find(order => order.id.toString() === orderId);
        
        if (foundOrder) {
          console.log('Found order in user orders:', foundOrder);
          
          // Method 2: Try to fetch more detailed order information from the new API endpoint
          // But only if it's not a temporary order (temporary orders have numeric IDs > 1000000000000)
          // MongoDB ObjectIds are 24 character hex strings, temporary IDs are large numbers as strings
          const isTemporaryOrder = foundOrder.id.length > 10 && !isNaN(Number(foundOrder.id)) && Number(foundOrder.id) > 1000000000000;
          const isMongoObjectId = foundOrder.id.length === 24 && /^[0-9a-fA-F]{24}$/.test(foundOrder.id);
          
          if (!isTemporaryOrder && isMongoObjectId) {
            try {
              console.log('Attempting to fetch detailed order information for MongoDB order...');
              const orderDetails = await orderAPI.getOrderDetails(foundOrder.id);
              console.log('Fetched detailed order details:', orderDetails);
              
              // Update the order with the detailed information if available
              if (orderDetails && Array.isArray(orderDetails) && orderDetails.length > 0) {
                foundOrder.orderDetails = orderDetails;
                console.log('Updated order with details:', foundOrder);
              }
            } catch (detailError) {
              console.warn('Could not fetch detailed order information from server:', detailError);
              // Continue with the existing order data
            }
          } else {
            console.log('Skipping order details fetch for temporary order or invalid order ID format');
          }
          
          setOrder(foundOrder);
          return;
        }
      } catch (orderError) {
        console.error('Error fetching orders:', orderError);
      }

      // Method 3: If order not found in user orders, try temporary orders
      console.log('Order not found in server orders, checking temporary orders...');
      const tempOrders = JSON.parse(localStorage.getItem('tempOrders') || '[]');
      const tempOrder = tempOrders.find((order: any) => order.id.toString() === orderId);
      
      if (tempOrder) {
        console.log('Found temporary order:', tempOrder);
        setOrder(tempOrder);
        return;
      }

      // Order not found anywhere
      console.log('Order not found anywhere');
      toast.error('Order not found');
      navigate('/my-orders');
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details. Please try again.');
      navigate('/my-orders');
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

  const getStatusProgress = (status: string) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(status.toLowerCase());
    return currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0;
  };

  const handleCancelOrder = async () => {
    if (!order || !orderId) return;

    // Validate order status - prevent cancelling shipped/delivered orders
    const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled'];
    if (nonCancellableStatuses.includes(order.orderStatus.toLowerCase())) {
      toast.error(
        `Cannot cancel order with status "${order.orderStatus}". Only pending or processing orders can be cancelled.`,
        { autoClose: 4000 }
      );
      return;
    }

    // Show custom confirmation modal
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!order) return;

    try {
      setCancellingOrder(true);
      setShowCancelModal(false);
      
      // Check if this is a temporary order
      if (parseNumber(order.id) > 1000000) {
        // Handle temporary order cancellation
        const tempOrders = JSON.parse(localStorage.getItem('tempOrders') || '[]');
        const updatedTempOrders = tempOrders.map((tempOrder: OrderDTO) => 
          tempOrder.id === order.id 
            ? { ...tempOrder, orderStatus: 'cancelled' } 
            : tempOrder
        );
        localStorage.setItem('tempOrders', JSON.stringify(updatedTempOrders));
        
        // Update local state
        setOrder({ ...order, orderStatus: 'cancelled' });
        toast.success('Order cancelled successfully!');
        return;
      }

      // Try to cancel through API
      try {
        const cancelledOrder = await orderAPI.cancelOrder(order.id);
        setOrder(cancelledOrder);
        toast.success('Order cancelled successfully!');
      } catch (apiError: any) {
        console.warn('API cancel failed:', apiError);
        
        // Check if it's a CORS or connection error
        if (apiError.code === 'ERR_NETWORK' || 
            apiError.message?.includes('CORS') || 
            apiError.message?.includes('ERR_CONNECTION_REFUSED') ||
            apiError.name === 'NetworkError') {
          
          // Update locally and inform user about backend issues
          setOrder({ ...order, orderStatus: 'cancelled' });
          toast.warning(
            'Order cancelled locally. Backend server is unavailable - changes will need to be synced when server is restored.',
            { autoClose: 5000 }
          );
        } else {
          // Other API errors
          toast.error(`Failed to cancel order: ${apiError.response?.data?.message || apiError.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrder(false);
    }
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
        <p>Loading transaction details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="transaction-container">
        <div className="transaction-not-found">
          <h2>Transaction Not Found</h2>
          <p>The transaction you're looking for doesn't exist or you don't have permission to view it.</p>
          <motion.button
            className="back-btn"
            onClick={() => navigate('/my-orders')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft /> Back to Orders
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="transaction-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="transaction-header">
        <motion.button
          className="back-btn"
          onClick={() => navigate('/my-orders')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <FaArrowLeft /> Back to Orders
        </motion.button>
        
        <motion.div 
          className="transaction-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>Transaction Details</h1>
          <p>Order #{order.id}</p>
        </motion.div>
      </div>

      <div className="transaction-content">
        <div className="transaction-main">
          {/* Order Status Section */}
          <motion.div 
            className="status-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="status-header">
              <div className="status-info">
                {getStatusIcon(order.orderStatus)}
                <div>
                  <h3 style={{ color: getStatusColor(order.orderStatus) }}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </h3>
                  <p>Order Status</p>
                </div>
              </div>
              <div className="order-date">
                <FaCalendar />
                <span>
                  {new Date(order.orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            {/* Status Progress Bar */}
            <div className="status-progress">
              <div className="progress-bar">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${getStatusProgress(order.orderStatus)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                />
              </div>
              <div className="progress-steps">
                {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, index) => (
                  <div 
                    key={step}
                    className={`progress-step ${
                      ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.orderStatus.toLowerCase()) >= index 
                        ? 'completed' 
                        : ''
                    }`}
                  >
                    <div className="step-circle" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Items Section */}
          <motion.div 
            className="items-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Order Items</h3>
            <div className="items-list">
              {order.orderDetails && order.orderDetails.length > 0 ? (
                order.orderDetails.map((detail, index) => (
                  <motion.div
                    key={detail.id || index}
                    className="item-card"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="item-image">
                      <img 
                        src={detail.orchidUrl || '/placeholder-orchid.jpg'} 
                        alt={detail.orchidName || 'Orchid'}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-orchid.jpg';
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h4>{detail.orchidName || 'Unknown Orchid'}</h4>
                      <div className="item-info">
                        <span className="item-id">Product ID: {detail.orchidId}</span>
                      </div>
                    </div>
                    <div className="item-pricing">
                      <div className="quantity">
                        <span>Qty: {detail.quantity}</span>
                      </div>
                      <div className="price">
                        <span className="unit-price">{formatPrice(parseNumber(detail.price))} VND each</span>
                        <span className="total-price">
                          {formatPrice(parseNumber(detail.subtotal ?? '0') || (parseNumber(detail.price) * parseNumber(detail.quantity)))} VND
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="no-items">No order details available</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Order Summary Sidebar */}
        <motion.div 
          className="transaction-sidebar"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Payment Summary */}
          <div className="summary-card">
            <h3>
              <FaCreditCard /> Payment Summary
            </h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(parseNumber(order.totalAmount) - 50000)} VND</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{formatPrice(50000)} VND</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(parseNumber(order.totalAmount))} VND</span>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="summary-card">
            <h3>
              <FaUser /> Order Information
            </h3>
            <div className="summary-details">
              <div className="info-row">
                <FaUser className="info-icon" />
                <div>
                  <span className="info-label">Account</span>
                  <span className="info-value">{order.accountName || `Account ID: ${order.accountId}`}</span>
                </div>
              </div>
              <div className="info-row">
                <FaBox className="info-icon" />
                <div>
                  <span className="info-label">Order ID</span>
                  <span className="info-value">#{order.id}</span>
                </div>
              </div>
              <div className="info-row">
                <FaCalendar className="info-icon" />
                <div>
                  <span className="info-label">Order Date</span>
                  <span className="info-value">
                    {new Date(order.orderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="order-actions">
            {order.orderStatus.toLowerCase() === 'delivered' && (
              <motion.button
                className="action-btn reorder"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.info('Reorder feature coming soon!')}
              >
                Reorder Items
              </motion.button>
            )}
            
            {['pending', 'processing'].includes(order.orderStatus.toLowerCase()) && (
              <motion.button
                className="action-btn cancel"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
              >
                {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
              </motion.button>
            )}
            
            <motion.button
              className="action-btn contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.info('Contact support feature coming soon!')}
            >
              Contact Support
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCancelModal(false)}
        >
          <motion.div 
            className="cancel-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Cancel Order</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCancelModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-icon">
                <FaExclamationTriangle />
              </div>
              <p>
                Are you sure you want to cancel order <strong>#{order?.id}</strong>?
              </p>
              <p className="modal-warning">
                This action cannot be undone. All items in this order will be cancelled.
              </p>
            </div>
            
            <div className="modal-actions">
              <motion.button
                className="modal-btn secondary"
                onClick={() => setShowCancelModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Keep Order
              </motion.button>
              <motion.button
                className="modal-btn danger"
                onClick={confirmCancelOrder}
                disabled={cancellingOrder}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Transaction;
