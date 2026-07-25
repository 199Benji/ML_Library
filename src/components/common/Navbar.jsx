import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      backgroundColor: 'var(--card-bg)',
      borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
      position: 'fixed', // <--- Makes it stagnant at the top
      top: 0,            // <--- Anchors it to the very top
      left: 0,
      right: 0,
      zIndex: 1000       // <--- Ensures it stays above all content
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ 
        fontFamily: 'var(--font-heading)', 
        fontSize: '1.1rem', 
        fontWeight: '700', 
        color: 'var(--accent-color)',
        textDecoration: 'none',
        whiteSpace: 'nowrap'
      }}>
        90DaysML
      </Link>

      {/* Desktop Links & Toggle */}
      <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '0.95rem' }}>Dashboard</Link>
        <Link to="/login" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '0.95rem' }}>Login</Link>
        <ThemeToggle />
      </div>

      {/* Mobile Controls */}
      <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle />
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-color)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--card-bg)',
          borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
        }}>
          <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' }}>Dashboard</Link>
          <Link to="/login" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1rem', fontWeight: '500' }}>Admin Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;