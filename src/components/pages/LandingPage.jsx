import React from 'react';
import { Link } from 'react-router-dom';
import { FiTerminal, FiTrendingUp, FiCpu, FiArrowRight } from 'react-icons/fi';
import Footer from '../common/Footer';
import Navbar from '../common/Navbar';

const LandingPage = () => {
  return (
    <>
      <Navbar />
      {/* Added paddingTop to clear the fixed navbar height */}
      <div style={{ padding: '90px 1.5rem 1.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <section style={{
          textAlign: 'center',
          padding: '3rem 0 4rem 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <span style={{
            background: 'rgba(100, 255, 218, 0.1)',
            color: 'var(--accent-color)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            letterSpacing: '0.5px',
            border: '1px solid rgba(100, 255, 218, 0.3)'
          }}>
            Public Machine Learning Journey
          </span>

          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            fontWeight: '700',
            lineHeight: '1.15',
            maxWidth: '750px',
            margin: 0
          }}>
            Mastering Machine Learning, One Day at a Time.
          </h1>

          <p style={{
            color: 'var(--text-color)',
            opacity: 0.85,
            fontSize: '1.05rem',
            fontWeight: '400',
            lineHeight: '1.6',
            maxWidth: '580px',
            margin: 0
          }}>
            Welcome to my personal command center. Documenting 90 days of deep-dives into data science, regression models, full-stack integration, and real-world AI applications.
          </p>

          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/dashboard" style={{
              background: 'var(--accent-color)',
              color: '#050b14',
              padding: '12px 26px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(100, 255, 218, 0.2)',
              transition: 'transform 0.2s ease'
            }}>
              Enter Dashboard <FiArrowRight />
            </Link>
          </div>
        </section>

        {/* Feature / Topics Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '4rem'
        }}>
          
          <div style={cardStyle}>
            <FiTerminal size={28} color="var(--accent-color)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>Core Algorithms</h3>
            <p style={{ opacity: 0.75, fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
              Building and evaluating Linear Regression, classification logic, and data handling from scratch.
            </p>
          </div>

          <div style={cardStyle}>
            <FiTrendingUp size={28} color="var(--accent-color)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>Model Evaluation</h3>
            <p style={{ opacity: 0.75, fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
              Analyzing MSE, RMSE, R² scores, and checking residual distributions for statistical accuracy.
            </p>
          </div>

          <div style={cardStyle}>
            <FiCpu size={28} color="var(--accent-color)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>Full-Stack AI</h3>
            <p style={{ opacity: 0.75, fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
              Bridging powerful Python data science scripts with modern React and Firebase architectures.
            </p>
          </div>

        </section>
      </div>
      <Footer />
    </>
  );
};

const cardStyle = {
  background: 'var(--card-bg)',
  padding: '1.8rem',
  borderRadius: '12px',
  border: '1px solid rgba(100, 255, 218, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
};

export default LandingPage;