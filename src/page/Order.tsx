import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBox } from 'react-icons/fa';
import type { Orchid, CreateOrderFromCartRequest, CartItemDTO } from '../types/orchid';
import { formatPrice } from '../utils/formatters';
import { parseNumber } from '../utils/numberUtils';
import { cartAPI, orderAPI } from '../utils/api';
import '../styles/Order.css';

interface OrderItem {
  orchid: Orchid;
  quantity: string;
}

interface LocationState {
  items: OrderItem[];
  fromCart?: boolean;
}

const Order: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, fromCart } = (location.state as LocationState) || { items: [], fromCart: false };
  const [orderItems, setOrderItems] = useState<OrderItem[]>(items);
  const [loading, setLoading] = useState(false);

  // Load cart data if coming from cart
  useEffect(() => {
    const loadCartData = async () => {
      console.log('Order page - fromCart:', fromCart, 'items length:', items.length);
      
      if (fromCart && items.length === 0) {
        // Only try to load from API if no items were passed and we're coming from cart
        console.log('Loading cart data from API...');
        try {
          const cart = await cartAPI.getCart();
          console.log('Cart data from API:', cart);
          // Convert cart items to order items - handle the new structure
          if (cart.items && Array.isArray(cart.items)) {
            const convertedItems: OrderItem[] = cart.items.map(item => ({
              orchid: {
                orchidId: item.orchidId,
                orchidName: item.orchidName,
                orchidDescription: '', // Not available in cart item
                price: item.price,
                orchidUrl: item.orchidUrl,
                isNatural: false, // Default value since not in cart
                categoryId: undefined,
                categoryName: undefined
              },
              quantity: item.quantity
            }));
            setOrderItems(convertedItems);
            console.log('Converted cart items to order items:', convertedItems);
          } else {
            console.warn('Cart items is not an array or is undefined:', cart);
            setOrderItems([]);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          toast.error('Failed to load cart data');
          setOrderItems([]);
        }
      } else if (items.length > 0) {
        // Use the items that were passed from the Cart component
        console.log('Using items passed from Cart component:', items);
        setOrderItems(items);
      } else {
        console.log('No items to load, using initial items from location state');
      }
    };

    loadCartData();
  }, [fromCart, items]);

  const subtotal = orderItems.reduce((sum, item) => {
    return sum + (parseNumber(item.orchid.price) * parseNumber(item.quantity));
  }, 0);
  const shipping = 50000; // Fixed shipping cost
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      // Get user info
      const user = JSON.parse(localStorage.getItem('user') ?? '{}');
      const token = localStorage.getItem('authToken');
      
      console.log('Place order - User:', user);
      console.log('Place order - Token exists:', !!token);
      
      if (!user.accountId || !token) {
        toast.error('Please log in to place an order');
        navigate('/login');
        return;
      }

      // Convert order items to cart items for the API
      const cartItems: CartItemDTO[] = orderItems.map(item => ({
        orchidId: item.orchid.orchidId,
        orchidName: item.orchid.orchidName,
        price: item.orchid.price,
        quantity: item.quantity,
        subtotal: (parseNumber(item.orchid.price) * parseNumber(item.quantity)).toString(),
        orchidUrl: item.orchid.orchidUrl
      }));

      // Create order request for the /api/orders endpoint
      const orderRequest: CreateOrderFromCartRequest = {
        items: cartItems
      };

      console.log('Order request for /api/orders:', orderRequest);

      // Create the order using the customer order endpoint
      const createdOrder = await orderAPI.createOrder(orderRequest);
      console.log('Order created successfully:', createdOrder);
      
      // Clear cart if order came from cart
      if (fromCart) {
        try {
          await cartAPI.clearCart();
          console.log('Cart cleared successfully');
        } catch (cartError) {
          console.warn('Failed to clear cart:', cartError);
          // Don't fail the order if cart clearing fails
        }
      }
      
      // Show appropriate success message
      if (parseNumber(createdOrder.id) > 1000000) {
        // This is a temporary order (timestamp ID)
        toast.success('Order placed successfully! Your order has been saved temporarily. Please contact admin to process your order.');
      } else {
        toast.success('Order placed successfully! Your order will be processed soon.');
      }
      
      // Redirect to transaction page to show the order details
      setTimeout(() => {
        navigate(`/transaction/${createdOrder.id}`);
      }, 2000);
    } catch (error: any) {
      console.error('Order submission error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to place orders.');
      } else if (error.response?.data?.message) {
        toast.error(`Failed to place order: ${error.response.data.message}`);
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderItems.length === 0) {
    return (
      <div className="order-container">
        <div className="order-content">
          <div className="empty-order">
            <h2>No items to order</h2>
            <p>Please add items to your cart first.</p>
            <button onClick={() => navigate('/shop')} className="checkout-button">
              Go to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-container">
      <motion.div 
        className="order-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="order-steps">
          <div className="form-section">
            <h3 className="form-title">
              <FaBox /> Order Review
            </h3>
            <div className="review-details">
              <div className="review-section">
                <h4>Order Items</h4>
                {orderItems.map((item) => (
                  <div key={item.orchid.orchidId} className="review-item">
                    <div className="item-details">
                      <img src={item.orchid.orchidUrl} alt={item.orchid.orchidName} className="item-image-small" />
                      <div>
                        <h5>{item.orchid.orchidName}</h5>
                        <p>Quantity: {item.quantity}</p>
                        <p>Unit Price: {formatPrice(parseNumber(item.orchid.price))} VND</p>
                      </div>
                    </div>
                    <div className="item-price">
                      {formatPrice(parseNumber(item.orchid.price) * parseNumber(item.quantity))} VND
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="review-section">
                <h4>Delivery Information</h4>
                <p><strong>Shipping Method:</strong> Standard Delivery</p>
                <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                <p><strong>Note:</strong> Your orchids will be carefully packaged and shipped to ensure they arrive in perfect condition.</p>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <motion.button
                className="checkout-button"
                onClick={handlePlaceOrder}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{ width: '100%' }}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-items">
            {orderItems.map((item) => (
              <motion.div
                key={item.orchid.orchidId}
                className="summary-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="item-details">
                  <img src={item.orchid.orchidUrl} alt={item.orchid.orchidName} className="item-image" />
                  <div className="item-info">
                    <h4>{item.orchid.orchidName}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="item-price">
                  {formatPrice(parseNumber(item.orchid.price) * parseNumber(item.quantity))} VND
                </div>
              </motion.div>
            ))}
          </div>
          <div className="summary-total">
            <div className="total-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)} VND</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>{formatPrice(shipping)} VND</span>
            </div>
            <div className="total-row final">
              <span>Total</span>
              <span>{formatPrice(total)} VND</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Order;
