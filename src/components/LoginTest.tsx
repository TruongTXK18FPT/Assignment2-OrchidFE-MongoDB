import React, { useState } from 'react';
import { authAPI } from '../utils/api';

const LoginTest: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [response, setResponse] = useState<any>(null);

  const testLogin = async () => {
    try {
      const result = await authAPI.login(credentials);
      console.log('Test Login Response:', result);
      setResponse(result);
    } catch (error) {
      console.error('Test Login Error:', error);
      setResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'rgba(255,255,255,0.9)',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <h4>Login Test</h4>
      <input
        type="email"
        placeholder="Email"
        value={credentials.email}
        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
        style={{ display: 'block', margin: '5px 0', width: '100%' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
        style={{ display: 'block', margin: '5px 0', width: '100%' }}
      />
      <button onClick={testLogin} style={{ margin: '5px 0' }}>Test Login</button>
      {response && (
        <div>
          <strong>Response:</strong>
          <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '5px', overflow: 'auto' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LoginTest;
