import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = () => {
  // Logic to check for your access cookie.
  // Note: Since 'HttpOnly' cookies cannot be read by JS, 
  // you usually check for the presence of a separate 'isLoggedIn' 
  // flag cookie or rely on a 401 response from your API.
  const isAuthenticated = document.cookie.includes('isLoggedIn=true'); 

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;