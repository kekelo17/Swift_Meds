// components/AuthDebug.jsx
import React from 'react';
import { usePharmacyAuth } from '../../../Back-end/hooks/usePharmacyAuth.js';

const AuthDebug = () => {
  const { user, loading, error } = usePharmacyAuth();

  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('authToken');

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>Auth Debug Info:</h4>
      <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
      <div><strong>Error:</strong> {error || 'None'}</div>
      <div><strong>User Object:</strong> {user ? 'Exists' : 'Null'}</div>
      {user && (
        <div>
          <div><strong>User Role:</strong> {user.role}</div>
          <div><strong>User Name:</strong> {user.full_name}</div>
          <div><strong>User ID:</strong> {user.id}</div>
        </div>
      )}
      <div><strong>Stored User:</strong> {storedUser ? 'Exists' : 'None'}</div>
      <div><strong>Stored Token:</strong> {storedToken ? 'Exists' : 'None'}</div>
      <div><strong>Current Path:</strong> {window.location.pathname}</div>
      
      <button 
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        style={{
          background: 'red',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          marginTop: '10px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Clear All & Reload
      </button>
    </div>
  );
};

export default AuthDebug;