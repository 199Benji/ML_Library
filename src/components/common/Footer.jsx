import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '2rem 1rem',
      borderTop: '1px solid rgba(100, 255, 218, 0.1)',
      marginTop: '4rem',
      color: 'var(--text-color)',
      opacity: 0.7,
      fontSize: '0.85rem'
    }}>
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} <strong>90DaysOfLearningML</strong>..
      </p>
    </footer>
  );
};

export default Footer;