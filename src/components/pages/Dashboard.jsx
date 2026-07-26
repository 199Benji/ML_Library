import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { FiPlus, FiLogOut, FiSearch, FiCopy, FiCheck, FiTrash2, FiCode, FiArrowLeft, FiTerminal, FiTrendingUp, FiCpu, FiLayers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Preprocessing');
  const [content, setContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [dayNumber, setDayNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); // null means showing card grid
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  const categoryCards = [
    { name: 'Preprocessing', icon: FiTerminal, desc: 'Missing value treatment, scalers, and data formatting scripts.' },
    { name: 'EDA & Statistics', icon: FiTrendingUp, desc: 'Distribution checks, summary statistics, and correlation logs.' },
    { name: 'Model Training', icon: FiCpu, desc: 'Regression, classification algorithms, and fitting rules.' },
    { name: 'Model Evaluation', icon: FiLayers, desc: 'MSE, RMSE, R² scores, and residual analyses.' },
    { name: 'Full-Stack AI', icon: FiCode, desc: 'Firebase, React integration, and API connection logic.' }
  ];

  // Fetch logs from Firestore
  const fetchLogs = async () => {
    try {
      const q = query(collection(db, 'daily_logs'), orderBy('dayNumber', 'desc'));
      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Handle adding a new log/snippet
  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'daily_logs'), {
        title,
        category,
        content,
        codeSnippet,
        dayNumber: Number(dayNumber),
        createdAt: new Date()
      });
      setTitle('');
      setContent('');
      setCodeSnippet('');
      setDayNumber('');
      setIsModalOpen(false);
      fetchLogs();
      showToast('Successfully added to your knowledge base!');
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  // Delete a log entry with custom toast instead of window.confirm
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'daily_logs', id));
      fetchLogs();
      showToast('Entry deleted successfully.');
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  // Copy code snippet to clipboard
  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast('Code snippet copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // Filter logs for the active category view
  const filteredLogs = logs.filter(log => {
    const matchesCategory = !activeCategory || log.category === activeCategory;
    const matchesSearch = 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.codeSnippet && log.codeSnippet.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />
      
      {/* Custom Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--accent-color)',
              color: '#050b14',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.9rem',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '100px 1.5rem 4rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.2rem)', fontWeight: '700', margin: 0 }}>Command Center</h1>
            <p style={{ opacity: 0.7, margin: '5px 0 0 0', fontSize: '0.95rem' }}>Your private repository for code snippets, preprocessing rules, and machine learning guidelines.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsModalOpen(true)} style={{
              background: 'var(--accent-color)',
              color: '#050b14',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              <FiPlus /> Add New Entry
            </button>
            <button onClick={handleLogout} style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* View Mode: Category Grid Cards (Landing Page style) or Specific Category View */}
        {!activeCategory ? (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.25rem', opacity: 0.9 }}>Knowledge Base Segments</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {categoryCards.map((card) => {
                const IconComponent = card.icon;
                const count = logs.filter(l => l.category === card.name).length;
                return (
                  <motion.div
                    key={card.name}
                    whileHover={{ y: -5 }}
                    onClick={() => setActiveCategory(card.name)}
                    style={{
                      background: 'var(--card-bg)',
                      padding: '1.8rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(100, 255, 218, 0.15)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IconComponent size={28} color="var(--accent-color)" />
                      <span style={{ background: 'rgba(100, 255, 218, 0.1)', color: 'var(--accent-color)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {count} Saved Items
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>{card.name}</h3>
                    <p style={{ opacity: 0.75, fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                      {card.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {/* Back button and Search Bar for active category */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <button 
                onClick={() => { setActiveCategory(null); setSearchTerm(''); }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(100, 255, 218, 0.3)',
                  color: 'var(--accent-color)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                <FiArrowLeft /> Back to Segments
              </button>

              <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder={`Search ${activeCategory}...`} 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                />
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
              {activeCategory} Guidelines & Snippets
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredLogs.length === 0 ? (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '4rem', opacity: 0.6, background: 'var(--card-bg)', borderRadius: '12px' }}>
                  No guidelines or snippets saved under {activeCategory} yet. Click "Add New Entry" to create one!
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} style={{
                    background: 'var(--card-bg)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(100, 255, 218, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ background: 'rgba(100, 255, 218, 0.1)', color: 'var(--accent-color)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                          Day {log.dayNumber}
                        </span>
                        <button 
                          onClick={() => handleDelete(log.id)}
                          title="Delete Entry"
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.8 }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem' }}>{log.title}</h3>
                      <p style={{ opacity: 0.8, fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {log.content}
                      </p>
                    </div>

                    {log.codeSnippet && (
                      <div style={{ position: 'relative', marginTop: 'auto' }}>
                        <div style={{
                          background: '#020617',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(100, 255, 218, 0.2)',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          overflowX: 'auto',
                          color: '#64ffda',
                          maxHeight: '180px'
                        }}>
                          <pre style={{ margin: 0 }}>{log.codeSnippet}</pre>
                        </div>
                        <button
                          onClick={() => handleCopyCode(log.codeSnippet, log.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(100, 255, 218, 0.1)',
                            border: '1px solid rgba(100, 255, 218, 0.3)',
                            color: 'var(--accent-color)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {copiedId === log.id ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal Form Popup for Adding Entries */}
        <AnimatePresence>
          {isModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(5, 11, 20, 0.85)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  background: 'var(--card-bg)',
                  padding: '2rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(100, 255, 218, 0.2)',
                  width: '100%',
                  maxWidth: '550px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPlus color="var(--accent-color)" /> Save New Guideline or Snippet
                  </h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddLog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Day Number</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 62" 
                        value={dayNumber} 
                        onChange={(e) => setDayNumber(e.target.value)} 
                        required 
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Segment / Category</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        style={inputStyle}
                      >
                        <option value="Preprocessing">Preprocessing</option>
                        <option value="EDA & Statistics">EDA & Statistics</option>
                        <option value="Model Training">Model Training</option>
                        <option value="Model Evaluation">Model Evaluation</option>
                        <option value="Full-Stack AI">Full-Stack AI</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Topic Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Standard Scaler & missing value handling" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Key Guidelines & Notes</label>
                    <textarea 
                      rows="3" 
                      placeholder="Write down rules, observations, or decision criteria..." 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      required 
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiCode color="var(--accent-color)" /> Reusable Code Snippet (Optional)
                    </label>
                    <textarea 
                      rows="4" 
                      placeholder="Paste python/js snippet here..." 
                      value={codeSnippet} 
                      onChange={(e) => setCodeSnippet(e.target.value)} 
                      style={{ ...inputStyle, fontFamily: 'monospace', background: '#020617', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{
                      flex: 1,
                      background: 'transparent',
                      color: 'var(--text-color)',
                      border: '1px solid rgba(100, 255, 218, 0.3)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Cancel
                    </button>
                    <button type="submit" style={{
                      flex: 1,
                      background: 'var(--accent-color)',
                      color: '#050b14',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      Save Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
      <Footer />
    </>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg-color)',
  border: '1px solid rgba(100, 255, 218, 0.2)',
  borderRadius: '8px',
  color: 'var(--text-color)',
  fontSize: '0.95rem',
  outline: 'none'
};

export default Dashboard;