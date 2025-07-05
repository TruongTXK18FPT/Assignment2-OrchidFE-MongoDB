import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import type { Orchid } from '../types/orchid';
import { orchidAPI } from '../utils/api';
import { parseNumber } from '../utils/numberUtils';
import OrchidCard from '../components/OrchidCard';
import Logo from '../components/Logo';
import Cart from '../components/Cart';
import '../styles/Shop.css';

const ITEMS_PER_PAGE = 10;

const Shop: React.FC = () => {
  const [orchids, setOrchids] = useState<Orchid[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ orchid: Orchid; quantity: string }[]>([]);
  const [filterNatural, setFilterNatural] = useState<'all' | 'natural' | 'hybrid'>('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });

  useEffect(() => {
    const fetchOrchids = async () => {
      try {
        setLoading(true);
        const data = await orchidAPI.getAllOrchids();
        setOrchids(data);
        toast.success(`Loaded ${data.length} orchids successfully!`);
      } catch (error) {
        console.error('Error fetching orchids:', error);
        toast.error('Failed to load orchids. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrchids();
  }, []);

  const handleAddToCart = (orchid: Orchid) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.orchid.orchidId === orchid.orchidId);
      if (existingItem) {
        return prevItems.map(item =>
          item.orchid.orchidId === orchid.orchidId
            ? { ...item, quantity: (parseNumber(item.quantity) + 1).toString() }
            : item
        );
      }
      return [...prevItems, { orchid, quantity: '1' }];
    });
    toast.success(`Added ${orchid.orchidName} to cart!`);
  };

  const handleUpdateQuantity = (orchidId: string, change: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.orchid.orchidId === orchidId
          ? { ...item, quantity: Math.max(1, parseNumber(item.quantity) + change).toString() }
          : item
      )
    );
  };

  const handleRemoveItem = (orchidId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.orchid.orchidId !== orchidId));
  };

  const filteredAndSortedOrchids = orchids
    .filter(orchid => {
      // Text search filter
      const matchesSearch = orchid.orchidName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orchid.orchidDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Natural/Hybrid filter
      const matchesNaturalFilter = filterNatural === 'all' || 
        (filterNatural === 'natural' && orchid.isNatural) ||
        (filterNatural === 'hybrid' && !orchid.isNatural);
      
      // Price range filter
      const orchidPrice = parseNumber(orchid.price);
      const matchesPriceRange = orchidPrice >= priceRange.min && orchidPrice <= priceRange.max;
      
      return matchesSearch && matchesNaturalFilter && matchesPriceRange;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.orchidName.localeCompare(b.orchidName)
          : b.orchidName.localeCompare(a.orchidName);
      } else {
        const priceA = parseNumber(a.price);
        const priceB = parseNumber(b.price);
        return sortOrder === 'asc'
          ? priceA - priceB
          : priceB - priceA;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedOrchids.length / ITEMS_PER_PAGE);
  const paginatedOrchids = filteredAndSortedOrchids.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      className="shop-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header">
        <div className="header-content">
          <Logo />
          <div className="welcome-section">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="welcome-title"
            >
              Welcome to Orchid Shop
            </motion.h1>
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="welcome-subtitle"
            >
              Discover the Beauty of Nature's Most Elegant Flowers
            </motion.h2>
          </div>
          <motion.div 
            className="cart-container"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
          >
            <span className="cart-icon">🛒</span>
            {cartItems.length > 0 && (
              <motion.span 
                className="cart-count"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {cartItems.reduce((sum, item) => sum + parseNumber(item.quantity), 0)}
              </motion.span>
            )}
          </motion.div>
        </div>
      </div>

      <div className="search-sort-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search orchids by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select 
            className="filter-select"
            value={filterNatural}
            onChange={(e) => {
              setFilterNatural(e.target.value as 'all' | 'natural' | 'hybrid');
              setCurrentPage(1);
            }}
          >
            <option value="all">All Types</option>
            <option value="natural">Natural Only</option>
            <option value="hybrid">Hybrid Only</option>
          </select>

          <div className="price-range-filter">
            <span className="price-label">Price Range (VND):</span>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => {
                  setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }));
                  setCurrentPage(1);
                }}
                className="price-input"
                aria-label="Minimum price"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => {
                  setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 10000000 }));
                  setCurrentPage(1);
                }}
                className="price-input"
                aria-label="Maximum price"
              />
            </div>
          </div>

          <motion.button
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setFilterNatural('all');
              setPriceRange({ min: 0, max: 10000000 });
              setCurrentPage(1);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Filters
          </motion.button>
        </div>

        <div className="sort-controls">
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
          </select>
          <motion.button
            className="sort-button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </motion.button>
        </div>
      </div>

      {loading ? (
        <motion.div
          className="loading"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          🌸
        </motion.div>
      ) : (
        <>
          <div className="results-info">
            <p>
              Showing {paginatedOrchids.length} of {filteredAndSortedOrchids.length} orchids
              {searchTerm && ` for "${searchTerm}"`}
              {filterNatural !== 'all' && ` (${filterNatural} only)`}
            </p>
          </div>

          <motion.div 
            className="orchids-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {paginatedOrchids.map((orchid) => (
                <OrchidCard 
                  key={orchid.orchidId} 
                  orchid={orchid} 
                  onAddToCart={() => handleAddToCart(orchid)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-button ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="page-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </motion.div>
  );
};

export default Shop;
