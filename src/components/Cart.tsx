import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Orchid, CartItemDTO } from '../types/orchid';
import { formatPrice } from '../utils/formatters';
import { parseNumber } from '../utils/numberUtils';

// Union type to handle both old and new cart structures
type CartItemUnion = CartItemDTO | { orchid: Orchid; quantity: string };

interface CartProps {
  items: CartItemUnion[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (orchidId: string, change: number) => void;
  onRemoveItem: (orchidId: string) => void;
}

// Type guard to check if item is CartItemDTO
const isCartItemDTO = (item: CartItemUnion): item is CartItemDTO => {
  return 'orchidId' in item && 'orchidName' in item;
};

const Cart: React.FC<CartProps> = ({ 
  items, 
  isOpen, 
  onClose, 
  onUpdateQuantity,
  onRemoveItem 
}) => {
  const navigate = useNavigate();
  
  // Calculate total based on item type
  const total = items.reduce((sum, item) => {
    if (isCartItemDTO(item)) {
      return sum + parseNumber(item.subtotal);
    } else {
      return sum + (parseNumber(item.orchid.price) * parseNumber(item.quantity));
    }
  }, 0);

  const handleCheckout = () => {
    onClose();
    // Convert any item type to OrderItem format for the Order page
    const orderItems = items.map(item => {
      if (isCartItemDTO(item)) {
        return {
          orchid: {
            orchidId: item.orchidId,
            orchidName: item.orchidName,
            orchidDescription: '',
            price: item.price,
            orchidUrl: item.orchidUrl,
            isNatural: false,
            categoryId: undefined,
            categoryName: undefined
          } as Orchid,
          quantity: item.quantity
        };
      } else {
        return {
          orchid: item.orchid,
          quantity: item.quantity
        };
      }
    });
    
    console.log('Cart - Navigating to order with items:', orderItems);
    console.log('Cart - Original items:', items);
    navigate('/order', { state: { items: orderItems, fromCart: true } });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="cart-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="cart-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="cart-header">
            <h2>Your Cart 🛒</h2>
            <button className="cart-close" onClick={onClose}>×</button>
          </div>

          <div className="cart-items">
            {items.length === 0 ? (
              <motion.div
                className="cart-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="cart-empty-icon">🌺</span>
                <p>Your cart is empty</p>
                <button className="continue-shopping" onClick={onClose}>
                  Continue Shopping
                </button>
              </motion.div>
            ) : (
              <AnimatePresence>
                {items.map((item) => {
                  // Extract values based on item type
                  const orchidId = isCartItemDTO(item) ? item.orchidId : item.orchid.orchidId;
                  const orchidName = isCartItemDTO(item) ? item.orchidName : item.orchid.orchidName;
                  const orchidUrl = isCartItemDTO(item) ? item.orchidUrl : item.orchid.orchidUrl;
                  const price = isCartItemDTO(item) ? item.price : item.orchid.price;
                  const quantity = item.quantity;

                  return (
                    <motion.div
                      key={`cart-item-${orchidId}`}
                      className="cart-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <img src={orchidUrl} alt={orchidName} className="cart-item-image" />
                      <div className="cart-item-details">
                        <h3>{orchidName}</h3>
                        <p className="cart-item-price">{formatPrice(parseNumber(price))} VND</p>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => onUpdateQuantity(orchidId, -1)}
                            disabled={parseNumber(quantity) <= 1}
                          >
                            -
                          </button>
                          <span>{quantity}</span>
                          <button onClick={() => onUpdateQuantity(orchidId, 1)}>
                            +
                          </button>
                        </div>
                        <button 
                          className="remove-item"
                          onClick={() => onRemoveItem(orchidId)}
                        >
                          🗑️
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {items.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">{formatPrice(total)} VND</span>
              </div>
              <motion.button
                className="checkout-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Cart; 