import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Orchid } from '../types/orchid';
import { formatPrice } from '../utils/formatters';
import { parseNumber } from '../utils/numberUtils';
import OrchidModal from './OrchidModal';

interface OrchidCardProps {
  orchid: Orchid;
  onAddToCart: () => void;
}

const OrchidCard: React.FC<OrchidCardProps> = ({ orchid, onAddToCart }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        className="orchid-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ 
          scale: 1.03,
          boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
          y: -5
        }}
      >
        <motion.div className="image-container">
          <motion.img
            src={orchid.orchidUrl}
            alt={orchid.orchidName}
            className="orchid-image"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <motion.div 
            className="price-tag"
            initial={{ rotate: -15 }}
            whileHover={{ 
              rotate: 0,
              scale: 1.1,
            }}
          >
            {formatPrice(parseNumber(orchid.price))} VND
          </motion.div>
        </motion.div>
        <motion.div 
          className="orchid-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3>{orchid.orchidName}</h3>
          <p className="description-preview">
            {orchid.orchidDescription.length > 100 
              ? `${orchid.orchidDescription.substring(0, 100)}...` 
              : orchid.orchidDescription}
          </p>
          <div className="card-buttons">
            <motion.button
              className="view-details-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
            >
              View Details 🔍
            </motion.button>
            <motion.button
              className="add-to-cart-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddToCart}
            >
              Add to Cart 🛒
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <OrchidModal
        orchid={orchid}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default OrchidCard; 