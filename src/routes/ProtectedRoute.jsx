import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const ProtectedRoute = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ color: 'var(--text-color)', textAlign: 'center', marginTop: '20vh', fontSize: '1.1rem' }}>
        Verifying security clearance...
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;