import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminAPI } from '../../utils/api';
import { parseNumber } from '../../utils/numberUtils';
import type { OrchidDTO, CreateOrchidRequest, UpdateOrchidRequest, Category } from '../../types/orchid';
import { formatPrice } from '../../utils/formatters';

const OrchidManagement: React.FC = () => {
  const [orchids, setOrchids] = useState<OrchidDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrchid, setCurrentOrchid] = useState<OrchidDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    orchidName: '',
    isNatural: true,
    categoryId: '1',
    orchidDescription: '',
    price: '0',
    orchidUrl: ''
  });

  useEffect(() => {
    fetchOrchids();
    fetchCategories();
  }, []);

  const fetchOrchids = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllOrchids();
      setOrchids(data);
      toast.success(`Loaded ${data.length} orchids successfully!`);
    } catch (error) {
      console.error('Error fetching orchids:', error);
      toast.error('Failed to load orchids. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleEdit = (orchid: OrchidDTO) => {
    setCurrentOrchid(orchid);
    setFormData({
      orchidName: orchid.orchidName,
      isNatural: orchid.isNatural,
      categoryId: orchid.categoryId ?? '1',
      orchidDescription: orchid.orchidDescription,
      price: orchid.price,
      orchidUrl: orchid.orchidUrl
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentOrchid(null);
    setFormData({
      orchidName: '',
      isNatural: true,
      categoryId: '1',
      orchidDescription: '',
      price: '0',
      orchidUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orchidName.trim() || !formData.orchidDescription.trim() || parseNumber(formData.price) <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (currentOrchid) {
        // Update existing orchid
        const updateData: UpdateOrchidRequest = {
          orchidName: formData.orchidName,
          isNatural: formData.isNatural,
          categoryId: formData.categoryId,
          orchidDescription: formData.orchidDescription,
          price: formData.price,
          orchidUrl: formData.orchidUrl
        };
        
        const updatedOrchid = await adminAPI.updateOrchid(currentOrchid.orchidId, updateData);
        setOrchids(orchids.map(orchid => 
          orchid.orchidId === currentOrchid.orchidId ? updatedOrchid : orchid
        ));
        toast.success('Orchid updated successfully!');
      } else {
        // Create new orchid
        const createData: CreateOrchidRequest = {
          orchidName: formData.orchidName,
          isNatural: formData.isNatural,
          categoryId: formData.categoryId,
          orchidDescription: formData.orchidDescription,
          price: formData.price,
          orchidUrl: formData.orchidUrl
        };
        
        const newOrchid = await adminAPI.createOrchid(createData);
        setOrchids([...orchids, newOrchid]);
        toast.success('Orchid created successfully!');
      }
      
      setIsModalOpen(false);
      setFormData({
        orchidName: '',
        isNatural: true,
        categoryId: '1',
        orchidDescription: '',
        price: '0',
        orchidUrl: ''
      });
    } catch (error) {
      console.error('Error saving orchid:', error);
      toast.error(currentOrchid ? 'Failed to update orchid' : 'Failed to create orchid');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI.deleteOrchid(id);
      setOrchids(orchids.filter(orchid => orchid.orchidId !== id));
      toast.success('Orchid deleted successfully!');
    } catch (error) {
      console.error('Error deleting orchid:', error);
      toast.error('Failed to delete orchid. Please try again.');
    }
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
        <h2>Orchid Management</h2>
        <motion.button
          className="add-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
        >
          <FaPlus /> Add Orchid
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
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orchids.map((orchid) => (
            <motion.tr
              key={orchid.orchidId}
              variants={rowVariants}
              whileHover={{ backgroundColor: 'rgba(155, 77, 255, 0.05)' }}
            >
              <td>
                <img 
                  src={orchid.orchidUrl} 
                  alt={orchid.orchidName} 
                  className="orchid-thumbnail"
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </td>
              <td>{orchid.orchidName}</td>
              <td>
                <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {orchid.orchidDescription}
                </div>
              </td>
              <td>{formatPrice(parseNumber(orchid.price))} VND</td>
              <td className="action-buttons">
                <motion.button
                  className="edit-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(orchid)}
                >
                  <FaEdit />
                </motion.button>
                <motion.button
                  className="delete-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(orchid.orchidId)}
                >
                  <FaTrash />
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <h3>{currentOrchid ? 'Edit Orchid' : 'Add Orchid'}</h3>
              <form onSubmit={handleSubmit} className="orchid-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="orchidName">Name *</label>
                    <input
                      type="text"
                      id="orchidName"
                      value={formData.orchidName}
                      onChange={(e) => setFormData({ ...formData, orchidName: e.target.value })}
                      placeholder="Enter orchid name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Price *</label>
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="categoryId">Category</label>
                    <select
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      {categories.map((category) => (
                        <option key={category.categoryId} value={category.categoryId}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="isNatural">Type</label>
                    <select
                      id="isNatural"
                      value={formData.isNatural.toString()}
                      onChange={(e) => setFormData({ ...formData, isNatural: e.target.value === 'true' })}
                    >
                      <option value="true">Natural</option>
                      <option value="false">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="orchidUrl">Image URL</label>
                  <input
                    type="url"
                    id="orchidUrl"
                    value={formData.orchidUrl}
                    onChange={(e) => setFormData({ ...formData, orchidUrl: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="orchidDescription">Description *</label>
                  <textarea
                    id="orchidDescription"
                    value={formData.orchidDescription}
                    onChange={(e) => setFormData({ ...formData, orchidDescription: e.target.value })}
                    placeholder="Enter orchid description"
                    rows={4}
                    required
                  />
                </div>

                <div className="modal-buttons">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormData({
                        orchidName: '',
                        isNatural: true,
                        categoryId: '1',
                        orchidDescription: '',
                        price: '0',
                        orchidUrl: ''
                      });
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="save-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentOrchid ? 'Update' : 'Create'} Orchid
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrchidManagement; 