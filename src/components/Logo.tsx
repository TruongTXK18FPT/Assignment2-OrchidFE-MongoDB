import React from 'react';
import { motion } from 'framer-motion';

const Logo: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className="logo-container"
    >
      <motion.img 
        src="/src/assets/LogoOrchid.jpeg"
        alt="Orchid Shop Logo"
        className="logo-image"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
    </motion.div>
  );
};

export default Logo; 