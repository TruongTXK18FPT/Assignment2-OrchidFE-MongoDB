import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaEye, FaEyeSlash, FaLock, FaInfoCircle, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminAPI } from '../../utils/api';
import { canDeleteUser, canEditUserRole, canEditUser } from '../../utils/permissions';
import type { AccountDTO, CreateAccountRequest, UpdateAccountRequest, Role } from '../../types/orchid';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<AccountDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<AccountDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  
  // Get user permissions - calculate once when component mounts
  const canEditRoles = canEditUserRole();
  
  // Form state
  const [formData, setFormData] = useState({
    accountName: '',
    email: '',
    password: '',
    roleId: '' // Will be set when roles are loaded
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    if (isFetching) return; // Prevent multiple simultaneous requests
    
    try {
      setIsFetching(true);
      setLoading(true);
      const data = await adminAPI.getAllAccounts();
      setEmployees(data);
      console.log(`Loaded ${data.length} accounts successfully!`);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const roles = await adminAPI.getAllRoles();
      setAvailableRoles(roles);
      
      // Set default role to the first admin-like role found, or first role
      const adminRole = roles.find(role => 
        role.roleName.toLowerCase().includes('admin') && 
        !role.roleName.toLowerCase().includes('super')
      );
      const defaultRole = adminRole || roles[0];
      
      if (defaultRole && !formData.roleId) {
        setFormData(prev => ({ ...prev, roleId: defaultRole.roleId }));
      }
      
      console.log(`Loaded ${roles.length} roles successfully!`);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles. Please try again.');
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

  const handleEdit = (employee: AccountDTO) => {
    // Check if current user can edit this account
    if (!canEditUser(employee.roleId)) {
      toast.error('You do not have permission to edit this account.');
      return;
    }
    
    setCurrentEmployee(employee);
    setFormData({
      accountName: employee.accountName,
      email: employee.email,
      password: '',
      roleId: employee.roleId
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentEmployee(null);
    setFormData({
      accountName: '',
      email: '',
      password: '',
      roleId: getDefaultRoleId() // Default to Admin role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountName.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!currentEmployee && !formData.password.trim()) {
      toast.error('Password is required for new accounts');
      return;
    }

    // Additional permission check for editing existing accounts
    if (currentEmployee && !canEditUser(currentEmployee.roleId)) {
      toast.error('You do not have permission to edit this account.');
      return;
    }

    try {
      if (currentEmployee) {
        // Update existing employee
        const updateData: UpdateAccountRequest = {
          accountName: formData.accountName,
          email: formData.email,
          // Only include roleId if user has permission to edit roles
          ...(canEditRoles && { roleId: formData.roleId }),
          ...(formData.password.trim() && { password: formData.password })
        };
        
        const updatedEmployee = await adminAPI.updateAccount(currentEmployee.accountId, updateData);
        setEmployees(employees.map(emp => 
          emp.accountId === currentEmployee.accountId ? updatedEmployee : emp
        ));
        toast.success('Account updated successfully!');
      } else {
        // Create new employee
        const createData: CreateAccountRequest = {
          accountName: formData.accountName,
          email: formData.email,
          password: formData.password,
          // Use the actual role ID from the selected role
          roleId: canEditRoles ? formData.roleId : getDefaultRoleId()
        };
        
        console.log('Creating account with data:', createData);
        
        const newEmployee = await adminAPI.createAccount(createData);
        setEmployees([...employees, newEmployee]);
        toast.success('Account created successfully!');
      }
      
      setIsModalOpen(false);
      setFormData({ accountName: '', email: '', password: '', roleId: getDefaultRoleId() });
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error(currentEmployee ? 'Failed to update account' : 'Failed to create account');
    }
  };

  const handleDelete = async (id: string) => {
    const employeeToDelete = employees.find(emp => emp.accountId === id);
    if (!employeeToDelete) return;

    // Check if current user can delete this account
    if (!canDeleteUser(employeeToDelete.roleId)) {
      toast.error('You do not have permission to delete this account.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await adminAPI.deleteAccount(id);
        setEmployees(employees.filter(emp => emp.accountId !== id));
        toast.success('Account deleted successfully!');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account. Please try again.');
      }
    }
  };

  const getDefaultRoleId = (): string => {
    // Return a default admin role ID
    const adminRole = availableRoles.find(role => 
      role.roleName.toLowerCase().includes('admin') && 
      !role.roleName.toLowerCase().includes('super')
    );
    return adminRole?.roleId || availableRoles[0]?.roleId || '';
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
        <h2>Account Management</h2>
        <motion.button
          className="add-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
        >
          <FaPlus /> Add Account
        </motion.button>
      </div>

      {!canEditRoles && (
        <div className="permission-message">
          <FaInfoCircle />
          <span>Note: Only Super Admin can edit user roles, edit/delete Super Admin accounts, and delete any accounts.</span>
        </div>
      )}

      <motion.table
        className="management-table"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <motion.tr
              key={employee.accountId}
              variants={rowVariants}
              whileHover={{ backgroundColor: 'rgba(155, 77, 255, 0.05)' }}
              className={employee.roleId === 'SUPERADMIN' && !canEditUser(employee.roleId) ? 'protected-account' : ''}
            >
              <td>{employee.accountName}</td>
              <td>{employee.email}</td>
              <td>
                <div className="role-display-table">
                  <span style={{ textTransform: 'capitalize' }}>{employee.roleName}</span>
                  {employee.roleId === 'SUPERADMIN' && <FaCrown className="superadmin-icon" title="Super Admin" />}
                </div>
              </td>
              <td className="action-buttons">
                {canEditUser(employee.roleId) ? (
                  <motion.button
                    className="edit-button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(employee)}
                  >
                    <FaEdit />
                  </motion.button>
                ) : (
                  <motion.button
                    className="edit-button disabled"
                    disabled
                    title="You cannot edit this account"
                  >
                    <FaLock />
                  </motion.button>
                )}
                {canDeleteUser(employee.roleId) ? (
                  <motion.button
                    className="delete-button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(employee.accountId)}
                  >
                    <FaTrash />
                  </motion.button>
                ) : (
                  <motion.button
                    className="delete-button disabled"
                    disabled
                    title="You cannot delete this account"
                  >
                    <FaLock />
                  </motion.button>
                )}
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
              <h3>{currentEmployee ? 'Edit Account' : 'Add Account'}</h3>
              <form onSubmit={handleSubmit} className="employee-form">
                <div className="form-group">
                  <label htmlFor="accountName">Name *</label>
                  <input
                    type="text"
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Enter account name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Password {currentEmployee ? '(leave blank to keep current)' : '*'}
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={currentEmployee ? 'Enter new password' : 'Enter password'}
                      required={!currentEmployee}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="roleId">Role *</label>
                  {canEditRoles ? (
                    <select
                      id="roleId"
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                      required
                    >
                      {availableRoles.map(role => (
                        <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="role-display">
                      <input
                        type="text"
                        value={availableRoles.find(r => r.roleId === formData.roleId)?.roleName ?? 'Admin'}
                        disabled
                        className="disabled-input"
                      />
                      <FaLock className="lock-icon" title="Only Super Admin can edit roles" />
                    </div>
                  )}
                </div>

                <div className="modal-buttons">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormData({ accountName: '', email: '', password: '', roleId: getDefaultRoleId() });
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
                    {currentEmployee ? 'Update' : 'Create'} Account
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

export default EmployeeManagement;