import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import Navbar from '../../common/Navbar';
import Footer from '../../common/Footer';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion'; // <--- Import framer-motion

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ 
        padding: '120px 1.5rem 4rem 1.5rem', 
        maxWidth: '450px', 
        margin: '0 auto',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Animated Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: 'var(--card-bg)',
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            border: '1px solid rgba(100, 255, 218, 0.1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{
              background: 'rgba(100, 255, 218, 0.1)',
              color: 'var(--accent-color)',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: '1px solid rgba(100, 255, 218, 0.3)'
            }}>
              Admin Access
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
              Welcome Back
            </h2>
            <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>
              Sign in to manage your daily command center.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', opacity: 0.9 }}>
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiMail style={{ position: 'absolute', left: '14px', opacity: 0.5 }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@90daysml.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'var(--bg-color)',
                    border: '1px solid rgba(100, 255, 218, 0.2)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem', opacity: 0.9 }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiLock style={{ position: 'absolute', left: '14px', opacity: 0.5 }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'var(--bg-color)',
                    border: '1px solid rgba(100, 255, 218, 0.2)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              style={{
                background: 'var(--accent-color)',
                color: '#050b14',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(100, 255, 218, 0.2)'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <FiArrowRight />
            </motion.button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default Login;