import { Routes, Route } from 'react-router-dom';
import Login from '../components/pages/auth/Login';
import Register from '../components/pages/auth/Register';
import LandingPage from '../components/pages/LandingPage';
import Dashboard from '../components/pages/Dashboard'; 
import ProtectedRoute from '../routes/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Route */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
};

export default AppRoutes;