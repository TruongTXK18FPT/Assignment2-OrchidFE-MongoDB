import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaTrash, FaPlus, FaBan } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminAPI, orderAPI } from '../../utils/api';
import type { OrderDTO, CreateOrderRequest, CreateOrderDetailRequest, AccountDTO, Orchid } from '../../types/orchid';
import { formatPrice } from '../../utils/formatters';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderDTO | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AccountDTO[]>([]);
  const [orchids, setOrchids] = useState<Orchid[]>([]);
  const [backendConnected, setBackendConnected] = useState(true);
  const [newOrder, setNewOrder] = useState<CreateOrderRequest>({
    accountId: 0,
    orderDate: new Date().toISOString().split('T')[0],
    orderStatus: 'pending',
    totalAmount: 0,
    orderDetails: []
  });

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchOrchids();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllOrders();
      
      // Also get temporary orders from localStorage
      const tempOrders = JSON.parse(localStorage.getItem('tempOrders') ?? '[]');
      
      // Combine server orders and temp orders
      const allOrders = [...data, ...tempOrders];
      
      setOrders(allOrders);
      setBackendConnected(true);
      const tempOrdersText = tempOrders.length > 0 ? `(${tempOrders.length} temporary orders)` : '';
      toast.success(`Loaded ${allOrders.length} orders successfully! ${tempOrdersText}`);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      
      // Get temporary orders from localStorage
      const tempOrders = JSON.parse(localStorage.getItem('tempOrders') ?? '[]');
      
      // Check if it's a connection/CORS error
      if (error.code === 'ERR_NETWORK' || 
          error.message?.includes('CORS') || 
          error.message?.includes('ERR_CONNECTION_REFUSED') ||
          error.name === 'NetworkError') {
        
        setBackendConnected(false);
        if (tempOrders.length > 0) {
          setOrders(tempOrders);
          toast.warning(
            `Backend server is unavailable. Showing ${tempOrders.length} temporary orders only. Please check if the server is running on localhost:8080.`,
            { autoClose: 7000 }
          );
        } else {
          setOrders([]);
          toast.error(
            'Cannot connect to backend server. Please ensure the server is running on localhost:8080 and CORS is properly configured.',
            { autoClose: 7000 }
          );
        }
      } else {
        // Other API errors
        setBackendConnected(false);
        if (tempOrders.length > 0) {
          setOrders(tempOrders);
          toast.warning(`Server error: ${error.response?.data?.message ?? error.message}. Showing ${tempOrders.length} temporary orders only.`);
        } else {
          setOrders([]);
          toast.error(`Failed to load orders: ${error.response?.data?.message ?? error.message ?? 'Unknown error'}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getAllAccounts();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Don't show error toast for this, as it's not critical
    }
  };

  const fetchOrchids = async () => {
    try {
      const data = await adminAPI.getAllOrchids();
      setOrchids(data);
    } catch (error) {
      console.error('Error fetching orchids:', error);
      // Don't show error toast for this, as it's not critical
    }
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'processing': return '#2196f3';
      case 'shipped': return '#9c27b0';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const handleView = (order: OrderDTO) => {
    setCurrentOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    try {
      // Check if this is a temporary order (has timestamp ID)
      if (id > 1000000) {
        // Remove from localStorage
        const tempOrders = JSON.parse(localStorage.getItem('tempOrders') ?? '[]');
        const updatedTempOrders = tempOrders.filter((order: OrderDTO) => order.id !== id);
        localStorage.setItem('tempOrders', JSON.stringify(updatedTempOrders));
        
        // Update local state
        setOrders(orders.filter(order => order.id !== id));
        toast.success('Temporary order deleted successfully!');
      } else {
        // Delete real order through API
        await adminAPI.deleteOrder(id);
        setOrders(orders.filter(order => order.id !== id));
        toast.success('Order deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order. Please try again.');
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      // Check if this is a temporary order (has timestamp ID)
      if (orderId > 1000000) {
        // Update temporary order in localStorage
        const tempOrders = JSON.parse(localStorage.getItem('tempOrders') ?? '[]');
        const updatedTempOrders = tempOrders.map((order: OrderDTO) => 
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        );
        localStorage.setItem('tempOrders', JSON.stringify(updatedTempOrders));
        
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        ));
        
        toast.success('Temporary order status updated! This order needs to be processed through the backend.');
        return;
      }

      // For real orders, try to update through API with better error handling
      try {
        const updatedOrder = await orderAPI.updateOrderStatus(orderId, newStatus);
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        toast.success('Order status updated successfully!');
      } catch (apiError: any) {
        console.warn('API update failed:', apiError);
        
        // Check if it's a CORS or connection error
        if (apiError.code === 'ERR_NETWORK' || 
            apiError.message?.includes('CORS') || 
            apiError.message?.includes('ERR_CONNECTION_REFUSED') ||
            apiError.name === 'NetworkError') {
          
          // Update locally and inform user about backend issues
          setOrders(orders.map(order => 
            order.id === orderId ? { ...order, orderStatus: newStatus } : order
          ));
          
          toast.warning(
            `Order status updated locally to "${newStatus}". Backend server is unavailable - changes will need to be synced when server is restored.`,
            { autoClose: 5000 }
          );
        } else {
          // Other API errors
          toast.error(`Failed to update order status: ${apiError.response?.data?.message ?? apiError.message ?? 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status. Please try again.');
    }
  };

  const handleAdd = async () => {
    try {
      if (!newOrder.accountId || newOrder.orderDetails.length === 0) {
        toast.error('Please fill in all required fields and add at least one order detail');
        return;
      }

      // Validate that all order details have valid orchids and prices
      const invalidDetails = newOrder.orderDetails.filter(detail => 
        !detail.orchidId || detail.price <= 0
      );
      
      if (invalidDetails.length > 0) {
        toast.error('Please select valid orchids for all order items');
        return;
      }

      // Create the order request matching the backend structure
      const orderDTO: OrderDTO = {
        id: 0, // Will be generated by backend
        accountId: newOrder.accountId,
        orderDate: newOrder.orderDate,
        orderStatus: newOrder.orderStatus,
        totalAmount: newOrder.totalAmount,
        orderDetails: newOrder.orderDetails.map(detail => ({
          id: 0, // Will be generated by backend
          orchidId: detail.orchidId,
          quantity: detail.quantity,
          price: detail.price,
          orderId: 0, // Will be set by backend
          subtotal: detail.price * detail.quantity
        }))
      };

      console.log('Creating order with OrderDTO:', orderDTO);

      try {
        const createdOrder = await adminAPI.createOrder(orderDTO);
        console.log('Created order:', createdOrder);
        setOrders([...orders, createdOrder]);
        toast.success('Order created successfully!');
      } catch (apiError: any) {
        // If API fails (CORS or other issues), create a temporary order
        console.warn('API create order failed, creating temporary order:', apiError);
        
        const tempOrder: OrderDTO = {
          id: Date.now(), // Use timestamp as temporary ID
          accountId: newOrder.accountId,
          accountName: users.find(u => parseInt(u.accountId) === newOrder.accountId)?.accountName,
          orderDate: newOrder.orderDate,
          orderStatus: newOrder.orderStatus,
          totalAmount: newOrder.totalAmount,
          orderDetails: newOrder.orderDetails.map(detail => ({
            id: Date.now() + Math.random(), // Temporary ID
            orchidId: detail.orchidId,
            orchidName: orchids.find(o => o.orchidId === detail.orchidId)?.orchidName,
            orchidUrl: orchids.find(o => o.orchidId === detail.orchidId)?.orchidUrl,
            price: detail.price,
            quantity: detail.quantity,
            orderId: Date.now(),
            subtotal: detail.price * detail.quantity
          }))
        };
        
        // Save to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('tempOrders') ?? '[]');
        existingOrders.push(tempOrder);
        localStorage.setItem('tempOrders', JSON.stringify(existingOrders));
        
        setOrders([...orders, tempOrder]);
        toast.warning('Order created as temporary order. Backend connection failed.');
      }
      
      setIsAddModalOpen(false);
      setNewOrder({
        accountId: 0,
        orderDate: new Date().toISOString().split('T')[0],
        orderStatus: 'pending',
        totalAmount: 0,
        orderDetails: []
      });
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Failed to add order. Please try again.');
    }
  };

  const addOrderDetail = () => {
    const newDetail: CreateOrderDetailRequest = {
      orchidId: 0,
      quantity: 1,
      price: 0
    };
    setNewOrder({
      ...newOrder,
      orderDetails: [...newOrder.orderDetails, newDetail]
    });
  };

  const updateOrderDetail = (index: number, field: keyof CreateOrderDetailRequest, value: number) => {
    const updatedDetails = newOrder.orderDetails.map((detail, i) => 
      i === index ? { ...detail, [field]: value } : detail
    );
    const totalAmount = updatedDetails.reduce((sum, detail) => sum + (detail.price * detail.quantity), 0);
    setNewOrder({
      ...newOrder,
      orderDetails: updatedDetails,
      totalAmount
    });
  };

  const removeOrderDetail = (index: number) => {
    const updatedDetails = newOrder.orderDetails.filter((_, i) => i !== index);
    const totalAmount = updatedDetails.reduce((sum, detail) => sum + (detail.price * detail.quantity), 0);
    setNewOrder({
      ...newOrder,
      orderDetails: updatedDetails,
      totalAmount
    });
  };

  const convertTempOrderToReal = async (tempOrder: OrderDTO) => {
    try {
      // Create the order through admin API
      const orderDTO: OrderDTO = {
        id: 0, // Will be generated by backend
        accountId: tempOrder.accountId,
        orderDate: tempOrder.orderDate,
        orderStatus: tempOrder.orderStatus,
        totalAmount: tempOrder.totalAmount,
        orderDetails: tempOrder.orderDetails.map((detail: any) => ({
          id: 0, // Will be generated by backend
          orchidId: detail.orchidId,
          quantity: detail.quantity,
          price: detail.price,
          orderId: 0, // Will be set by backend
          subtotal: detail.price * detail.quantity
        }))
      };
      
      const createdOrder = await adminAPI.createOrder(orderDTO);
      console.log('Created order:', createdOrder);
      
      // Remove from temporary orders
      const tempOrders = JSON.parse(localStorage.getItem('tempOrders') ?? '[]');
      const updatedTempOrders = tempOrders.filter((order: OrderDTO) => order.id !== tempOrder.id);
      localStorage.setItem('tempOrders', JSON.stringify(updatedTempOrders));
      
      // Refresh orders list
      fetchOrders();
      
      toast.success('Temporary order converted to real order successfully!');
    } catch (error) {
      console.error('Error converting temporary order:', error);
      toast.error('Failed to convert temporary order. Please try again.');
    }
  };

  const handleCancelOrder = async (order: OrderDTO) => {
    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.orderStatus.toLowerCase())) {
      toast.error('Only pending or processing orders can be cancelled.');
      return;
    }

    // Show custom confirmation modal
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      // Check if this is a temporary order
      if (orderToCancel.id > 1000000) {
        // Handle temporary order cancellation
        const tempOrders = JSON.parse(localStorage.getItem('tempOrders') ?? '[]');
        const updatedTempOrders = tempOrders.map((tempOrder: OrderDTO) => 
          tempOrder.id === orderToCancel.id 
            ? { ...tempOrder, orderStatus: 'cancelled' } 
            : tempOrder
        );
        localStorage.setItem('tempOrders', JSON.stringify(updatedTempOrders));
        
        // Update local state
        setOrders(orders.map(o => 
          o.id === orderToCancel.id ? { ...o, orderStatus: 'cancelled' } : o
        ));
        
        toast.success('Temporary order cancelled successfully!');
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        return;
      }

      // Try to cancel through API
      try {
        const cancelledOrder = await orderAPI.cancelOrder(orderToCancel.id);
        setOrders(orders.map(o => 
          o.id === orderToCancel.id ? cancelledOrder : o
        ));
        toast.success('Order cancelled successfully!');
      } catch (apiError: any) {
        console.warn('API cancel failed:', apiError);
        
        // Check if it's a CORS or connection error
        if (apiError.code === 'ERR_NETWORK' || 
            apiError.message?.includes('CORS') || 
            apiError.message?.includes('ERR_CONNECTION_REFUSED') ||
            apiError.name === 'NetworkError') {
          
          // Update locally and inform user about backend issues
          setOrders(orders.map(o => 
            o.id === orderToCancel.id ? { ...o, orderStatus: 'cancelled' } : o
          ));
          
          toast.warning(
            'Order cancelled locally. Backend server is unavailable - changes will need to be synced when server is restored.',
            { autoClose: 5000 }
          );
        } else {
          // Other API errors
          toast.error(`Failed to cancel order: ${apiError.response?.data?.message ?? apiError.message ?? 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    }
    
    setIsCancelModalOpen(false);
    setOrderToCancel(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-left">
          <h2>Order Management</h2>
          <div className={`connection-status ${backendConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {backendConnected ? 'Backend Connected' : 'Backend Offline'}
          </div>
        </div>
        <motion.button
          className="add-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <FaPlus /> Add Order
        </motion.button>
      </div>

      <motion.table
        className="management-table"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <motion.tr
              key={order.id}
              variants={rowVariants}
              whileHover={{ backgroundColor: 'rgba(155, 77, 255, 0.05)' }}
            >
              <td>
                #{order.id} 
                {order.id > 1000000 && (
                  <span style={{ 
                    backgroundColor: '#ff9800', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    marginLeft: '8px' 
                  }}>
                    TEMP
                  </span>
                )}
              </td>
              <td>{order.accountName ?? `Account ID: ${order.accountId}`}</td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>{formatPrice(order.totalAmount)} VND</td>
              <td>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  style={{
                    backgroundColor: getStatusColor(order.orderStatus),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="action-buttons">
                <motion.button
                  className="view-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleView(order)}
                >
                  <FaEye />
                </motion.button>
                
                {['pending', 'processing'].includes(order.orderStatus.toLowerCase()) && (
                  <motion.button
                    className="cancel-order-button"
                    style={{ 
                      backgroundColor: '#ff9800', 
                      color: 'white', 
                      padding: '6px 8px', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginLeft: '8px'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCancelOrder(order)}
                    title="Cancel Order"
                  >
                    <FaBan />
                  </motion.button>
                )}
                
                {order.id > 1000000 && (
                  <motion.button
                    className="convert-button"
                    style={{ 
                      backgroundColor: '#4caf50', 
                      color: 'white', 
                      padding: '6px 12px', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginLeft: '8px'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => convertTempOrderToReal(order)}
                  >
                    Convert
                  </motion.button>
                )}
                <motion.button
                  className="delete-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(order.id)}
                >
                  <FaTrash />
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>

      <AnimatePresence>
        {isModalOpen && currentOrder && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal order-details-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <h3>Order Details</h3>
              <div className="order-details">
                <div className="customer-info">
                  <h4>Customer Information</h4>
                  <p><strong>Account ID:</strong> {currentOrder.accountId}</p>
                  <p><strong>Account Name:</strong> {currentOrder.accountName ?? 'N/A'}</p>
                </div>
                <div className="order-items">
                  <h4>Order Items</h4>
                  {currentOrder.orderDetails?.map((detail) => (
                    <div key={detail.id} className="order-item">
                      <div className="item-details">
                        <p><strong>Orchid ID:</strong> {detail.orchidId}</p>
                        {detail.orchidName && <p><strong>Orchid Name:</strong> {detail.orchidName}</p>}
                        <p><strong>Quantity:</strong> {detail.quantity}</p>
                        <p><strong>Unit Price:</strong> {formatPrice(detail.price)} VND</p>
                        <p><strong>Subtotal:</strong> {formatPrice(detail.subtotal ?? (detail.price * detail.quantity))} VND</p>
                      </div>
                    </div>
                  )) ?? <p>No order details available</p>}
                </div>
                <div className="order-summary">
                  <h4>Order Summary</h4>
                  <p><strong>Total Amount:</strong> {formatPrice(currentOrder.totalAmount)} VND</p>
                  <p><strong>Order Date:</strong> {new Date(currentOrder.orderDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {currentOrder.orderStatus}</p>
                </div>
              </div>
              <div className="modal-buttons">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal add-order-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <h3>Add New Order</h3>
              <div className="add-order-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="accountId">Customer:</label>
                    <select
                      id="accountId"
                      value={newOrder.accountId || ''}
                      onChange={(e) => setNewOrder({...newOrder, accountId: parseInt(e.target.value) || 0})}
                    >
                      <option value="">Select a customer</option>
                      {users.map((user) => (
                        <option key={user.accountId} value={user.accountId}>
                          {user.accountName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="orderDate">Order Date:</label>
                    <input
                      type="date"
                      id="orderDate"
                      value={newOrder.orderDate}
                      onChange={(e) => setNewOrder({...newOrder, orderDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="orderStatus">Status:</label>
                  <select
                    id="orderStatus"
                    value={newOrder.orderStatus}
                    onChange={(e) => setNewOrder({...newOrder, orderStatus: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="order-details-section">
                  <div className="section-header">
                    <h4>Order Details</h4>
                    <button type="button" className="add-item-button" onClick={addOrderDetail}>
                      <FaPlus /> Add Item
                    </button>
                  </div>
                  
                  {newOrder.orderDetails.map((detail, index) => (
                    <div key={index} className="order-detail-item">
                      <div className="order-detail-row">
                        <div className="form-group orchid-select">
                          <label>Orchid:</label>
                          <select
                            value={detail.orchidId || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                // Clear orchid selection
                                updateOrderDetail(index, 'orchidId', 0);
                                updateOrderDetail(index, 'price', 0);
                              } else {
                                const orchidId = parseInt(value);
                                const selectedOrchid = orchids.find(o => o.orchidId === orchidId);
                                updateOrderDetail(index, 'orchidId', orchidId);
                                if (selectedOrchid) {
                                  updateOrderDetail(index, 'price', selectedOrchid.price);
                                }
                              }
                            }}
                          >
                            <option value="">Select an orchid</option>
                            {orchids.map((orchid) => (
                              <option key={orchid.orchidId} value={orchid.orchidId}>
                                {orchid.orchidName} - {formatPrice(orchid.price)} VND
                              </option>
                            ))}
                          </select>
                          {detail.orchidId > 0 && (
                            <div className="selected-orchid-info">
                              <small>
                                Selected: {orchids.find(o => o.orchidId === detail.orchidId)?.orchidName ?? 'Unknown'}
                              </small>
                            </div>
                          )}
                        </div>
                        <div className="form-group quantity-input">
                          <label>Quantity:</label>
                          <input
                            type="number"
                            value={detail.quantity}
                            onChange={(e) => updateOrderDetail(index, 'quantity', parseInt(e.target.value) || 1)}
                            min="1"
                            max="99"
                          />
                        </div>
                        <div className="form-group price-input">
                          <label>Price (VND):</label>
                          <input
                            type="text"
                            value={detail.price ? formatPrice(detail.price) : ''}
                            placeholder="Auto-filled"
                            readOnly
                            style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                          />
                        </div>
                        <div className="remove-button-container">
                          <button
                            type="button"
                            className="remove-detail-button"
                            onClick={() => removeOrderDetail(index)}
                            title="Remove item"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="subtotal">
                        Subtotal: {formatPrice(detail.price * detail.quantity)} VND
                      </div>
                    </div>
                  ))}
                </div>

                <div className="total-amount">
                  <strong>Total Amount: {formatPrice(newOrder.totalAmount)} VND</strong>
                </div>
              </div>
              
              <div className="modal-buttons">
                <motion.button
                  className="cancel-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewOrder({
                      accountId: 0,
                      orderDate: new Date().toISOString().split('T')[0],
                      orderStatus: 'pending',
                      totalAmount: 0,
                      orderDetails: []
                    });
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="add-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAdd}
                  disabled={!newOrder.accountId || newOrder.orderDetails.length === 0 || 
                           newOrder.orderDetails.some(detail => !detail.orchidId || detail.price <= 0)}
                >
                  Add Order
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {isCancelModalOpen && orderToCancel && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsCancelModalOpen(false);
              setOrderToCancel(null);
            }}
          >
            <motion.div
              className="cancel-modal"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cancel-modal-header">
                <FaBan className="cancel-icon" />
                <h3>Cancel Order</h3>
              </div>
              
              <div className="cancel-modal-content">
                <p>Are you sure you want to cancel order <strong>#{orderToCancel.id}</strong>?</p>
                <div className="order-info">
                  <p><strong>Customer:</strong> {orderToCancel.accountName ?? `Account ID: ${orderToCancel.accountId}`}</p>
                  <p><strong>Total Amount:</strong> {formatPrice(orderToCancel.totalAmount)} VND</p>
                  <p><strong>Status:</strong> {orderToCancel.orderStatus}</p>
                </div>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              
              <div className="cancel-modal-buttons">
                <motion.button
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setOrderToCancel(null);
                  }}
                >
                  Keep Order
                </motion.button>
                <motion.button
                  className="btn-danger"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmCancelOrder}
                >
                  Cancel Order
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;