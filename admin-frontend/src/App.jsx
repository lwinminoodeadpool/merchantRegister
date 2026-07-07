import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('adminToken') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('adminRole') || null);
  const [userId, setUserId] = useState(localStorage.getItem('adminId') || null);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('adminToken', authToken);
      localStorage.setItem('adminRole', userRole);
      localStorage.setItem('adminId', userId);
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminId');
    }
  }, [authToken, userRole, userId]);

  const handleLogout = () => {
    setAuthToken(null);
    setUserRole(null);
    setUserId(null);
  };

  return (
    <div className="min-h-screen bg-vibrant-gradient font-sans">
      {!authToken ? (
        <LoginScreen onLogin={(token, role, id) => { setAuthToken(token); setUserRole(role); setUserId(id); }} />
      ) : (
        <DashboardScreen authToken={authToken} userRole={userRole} userId={userId} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
