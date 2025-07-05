import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('authToken');

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug Info</h4>
      <div><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
      <div><strong>isAdmin:</strong> {isAdmin ? 'true' : 'false'}</div>
      <div><strong>isSuperAdmin:</strong> {isSuperAdmin ? 'true' : 'false'}</div>
      <div><strong>User:</strong></div>
      <pre style={{ fontSize: '10px', margin: '5px 0' }}>
        {user ? JSON.stringify(user, null, 2) : 'null'}
      </pre>
      <div><strong>localStorage user:</strong></div>
      <pre style={{ fontSize: '10px', margin: '5px 0' }}>
        {storedUser || 'null'}
      </pre>
      <div><strong>localStorage token exists:</strong> {storedToken ? 'yes' : 'no'}</div>
    </div>
  );
};

export default AuthDebug;
