import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('adminToken') || null);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('adminToken', authToken);
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [authToken]);

  const handleLogout = () => {
    setAuthToken(null);
  };

  return (
    <div className="min-h-screen bg-kbz-gray-bg font-sans">
      {!authToken ? (
        <LoginScreen onLogin={(token) => setAuthToken(token)} />
      ) : (
        <DashboardScreen authToken={authToken} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
