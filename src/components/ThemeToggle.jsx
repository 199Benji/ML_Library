import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  }, [isDarkMode]);

  return (
    <div 
      onClick={() => setIsDarkMode(!isDarkMode)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '70px',
        height: '34px',
        backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0',
        borderRadius: '50px',
        padding: '0 4px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.3s ease',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <FiSun size={15} color={isDarkMode ? '#64748b' : '#0f172a'} style={{ zIndex: 1, marginLeft: '6px' }} />
      <FiMoon size={15} color={isDarkMode ? '#94a3b8' : '#64748b'} style={{ zIndex: 1, marginRight: '6px' }} />
      
      {/* Sliding Circle */}
      <div style={{
        position: 'absolute',
        top: '3px',
        left: isDarkMode ? '3px' : '39px',
        width: '28px',
        height: '28px',
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
        borderRadius: '50%',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isDarkMode ? (
          <FiMoon size={14} color="var(--accent-color)" />
        ) : (
          <FiSun size={14} color="#f59e0b" />
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;