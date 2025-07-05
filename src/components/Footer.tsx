import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaTwitter, FaFacebookF, FaInstagram, FaPinterestP } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  const mapLocation = {
    lat: 10.8751312,
    lng: 106.8007233
  };

  const orchidFacts = [
    "Orchids are one of the oldest families of flowering plants, with over 25,000 species",
    "Some orchid blooms can last for several months",
    "Orchids have evolved to grow in almost every environment on Earth",
    "Vanilla comes from a species of orchid",
    "Many orchids are epiphytes, growing on other plants without being parasitic"
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">About Our Orchid Shop</h3>
          <p className="footer-description">
            Welcome to our premium orchid sanctuary, where beauty meets nature. We specialize in cultivating and caring for the most exquisite orchid varieties, bringing the elegance of these stunning flowers to your space.
          </p>
          <ul className="contact-info">
            <motion.li 
              className="contact-item"
              whileHover={{ x: 5 }}
            >
              <span className="contact-icon">
                <FaMapMarkerAlt />
              </span>
              Luu Huu Phuoc, Tan Lap, Di An, Binh Duong
            </motion.li>
            <motion.li 
              className="contact-item"
              whileHover={{ x: 5 }}
            >
              <span className="contact-icon">
                <FaPhone />
              </span>
              0931430662
            </motion.li>
            <motion.li 
              className="contact-item"
              whileHover={{ x: 5 }}
            >
              <span className="contact-icon">
                <FaEnvelope />
              </span>
              contact@orchidshop.com
            </motion.li>
          </ul>
          <div className="social-links">
            <motion.a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              whileHover={{ y: -5 }}
            >
              <i><FaTwitter /></i>
            </motion.a>
            <motion.a 
              href="https://www.facebook.com/tung.tung.tung.sahur110524/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              whileHover={{ y: -5 }}
            >
              <i><FaFacebookF /></i>
            </motion.a>
            <motion.a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              whileHover={{ y: -5 }}
            >
              <i><FaInstagram /></i>
            </motion.a>
            <motion.a 
              href="https://pinterest.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              whileHover={{ y: -5 }}
            >
              <i><FaPinterestP /></i>
            </motion.a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Visit Our Store</h3>
          <div className="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.410213026006!2d106.79853427486534!3d10.875131157358319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a6b19d6763%3A0x143c54525028b2e!2zTMawdSBI4buvdSBQaMaw4bubYywgVMOibiBM4bqtcCwgRMSpIEFuLCBCw6xuaCBExrDGoW5n!5e0!3m2!1svi!2s!4v1709644547473!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Orchid Facts</h3>
          <ul className="orchid-facts">
            {orchidFacts.map((fact, index) => (
              <motion.li 
                key={index} 
                className="fact-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {fact}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Orchid Shop. All rights reserved. | Designed with 🌺 by <a href="https://github.com/TruongTXK18FPT" target="_blank" rel="noopener noreferrer">Tran Xuan Truong</a></p>
      </div>
    </footer>
  );
};

export default Footer;
