import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ExoticOrchid from '../assets/ExoticOrchid.jpeg';
import PremiumSection from '../assets/PremiumSection.jpeg';
import SpecialOffer from '../assets/Special Offer.jpeg';
import PhalaenopsisOrchid from '../assets/PhalaenopsisOrchid.jpg';
import CattleyaOrchid from '../assets/CattleyaOrchid.jpg';
import DendrobiumOrchid from '../assets/Dendrobium Orchid.jpeg';
import Footer from '../components/Footer';
import '../styles/Home.css';

const slides = [
  {
    url: ExoticOrchid,
    title: 'Exotic Orchids',
    description: 'Discover our rare collection of exotic orchids, carefully curated from around the world. Each flower tells a unique story of beauty and elegance.'
  },
  {
    url: PremiumSection,
    title: 'Premium Selection',
    description: 'Hand-picked premium orchids for your home, featuring the most stunning varieties. Transform your space with natural beauty.'
  },
  {
    url: SpecialOffer,
    title: 'Special Offers',
    description: 'Explore our special collection with amazing deals. Find the perfect orchid to start or expand your collection at unbeatable prices.'
  }
];

const featuredItems = [
  {
    title: "Phalaenopsis Orchid",
    description: "Known as the Moth Orchid, this elegant flower brings grace and sophistication to any space.",
    image: PhalaenopsisOrchid
  },
  {
    title: "Cattleya Orchid",
    description: "The queen of orchids, featuring large, fragrant blooms in stunning colors and patterns.",
    image: CattleyaOrchid
  },
  {
    title: "Dendrobium Orchid",
    description: "Beautiful cascading flowers that create a dramatic display of color and beauty.",
    image: DendrobiumOrchid
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredRef = useRef(null);
  const isInView = useInView(featuredRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>
      <div className="home-container">
        <section className="hero-section">
          <div className="slider-container">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className={`slide ${currentSlide === index ? 'active' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentSlide === index ? 1 : 0,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ display: currentSlide === index ? 'block' : 'none' }}
              >
                <img src={slide.url} alt={slide.title} className="slide-image" />
                <div className="slide-overlay">
                  <motion.div 
                    className="slide-content"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  >
                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    >
                      {slide.description}
                    </motion.p>
                    <motion.button
                      className="btn-shop-now"
                      onClick={() => navigate('/shop')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.8 }}
                    >
                      Shop Now
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
            <motion.button 
              className="slider-nav prev" 
              onClick={prevSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ❮
            </motion.button>
            <motion.button 
              className="slider-nav next" 
              onClick={nextSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ❯
            </motion.button>
            <div className="slider-dots">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  className={`dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="featured-section" ref={featuredRef}>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Featured Collections
          </motion.h2>
          <div className="featured-grid">
            {featuredItems.map((item, index) => (
              <motion.div
                key={index}
                className={`featured-card ${isInView ? 'visible' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
                whileHover={{ scale: 1.02, y: -15 }}
              >
                <div 
                  className="card-image" 
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="card-content">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
                  >
                    {item.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.8 }}
                  >
                    {item.description}
                  </motion.p>
                  <motion.button
                    className="btn-buy-now"
                    onClick={() => navigate('/shop')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 1 }}
                  >
                    Buy Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
