import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { FiPlus, FiLogOut, FiSearch, FiCopy, FiCheck, FiTrash2, FiCode, FiArrowLeft, FiTerminal, FiTrendingUp, FiCpu, FiLayers, FiShield, FiEye, FiEyeOff, FiLoader, FiBookOpen, FiEdit2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Clean 4-Part Form State
  const [dayNumber, setDayNumber] = useState('');
  const [category, setCategory] = useState('Preprocessing');
  const [topic, setTopic] = useState('');
  const [learnedContent, setLearnedContent] = useState('');
  const [takeaways, setTakeaways] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');

  // Confirmation & Security State with Loading & Eye Toggle
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', type: '', dataId: null });
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  const handleOpenCreate = () => {
    setEditingId(null);
    setDayNumber('');
    setTopic('');
    setLearnedContent('');
    setTakeaways('');
    setCodeSnippet('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log) => {
    setEditingId(log.id);
    setDayNumber(log.dayNumber || '');
    setCategory(log.category || 'Preprocessing');
    setTopic(log.title || '');
    setLearnedContent(log.learnedContent || '');
    setTakeaways(log.takeaways || '');
    setCodeSnippet(log.codeSnippet || '');
    setIsModalOpen(true);
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    try {
      const logData = {
        dayNumber: Number(dayNumber),
        category,
        title: topic,
        learnedContent,
        takeaways,
        codeSnippet,
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(doc(db, 'daily_logs', editingId), logData);
        showToast('Lesson updated successfully!');
      } else {
        logData.createdAt = new Date();
        await addDoc(collection(db, 'daily_logs'), logData);
        showToast('Successfully saved to your knowledge base!');
      }

      // Reset Form & Close Modal
      setEditingId(null);
      setDayNumber('');
      setTopic('');
      setLearnedContent('');
      setTakeaways('');
      setCodeSnippet('');
      setIsModalOpen(false);
      fetchLogs();
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const promptDelete = (id) => {
    setDeletePassword('');
    setShowPassword(false);
    setDeleteError('');
    setIsDeleting(false);
    setConfirmConfig({
      isOpen: true,
      title: 'Security Verification',
      message: 'Enter your admin password to confirm deletion of this lesson.',
      type: 'delete',
      dataId: id
    });
  };

  const promptLogout = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Sign Out?',
      message: 'Are you sure you want to log out of your command center?',
      type: 'logout',
      dataId: null
    });
  };

  const handleConfirmedAction = async () => {
    if (confirmConfig.type === 'logout') {
      await signOut(auth);
      navigate('/login');
    } else if (confirmConfig.type === 'delete') {
      setIsDeleting(true);
      setDeleteError('');
      try {
        const user = auth.currentUser;
        if (!user || !user.email) {
          setDeleteError('Authentication session not found.');
          setIsDeleting(false);
          return;
        }
        await signInWithEmailAndPassword(auth, user.email, deletePassword);
        await deleteDoc(doc(db, 'daily_logs', confirmConfig.dataId));
        fetchLogs();
        showToast('Entry deleted successfully.');
        setConfirmConfig({ isOpen: false, title: '', message: '', type: '', dataId: null });
      } catch (error) {
        console.error('Password verification failed:', error);
        setDeleteError('Incorrect password. Deletion cancelled.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast('Code snippet copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    if (!log) return false;
    const logCat = (log.category || '').trim().toLowerCase();
    const activeCat = (activeCategory || '').trim().toLowerCase();
    
    const matchesCategory = !activeCategory || logCat === activeCat;
    const queryText = (searchTerm || '').toLowerCase();
    
    const matchesSearch = 
      !searchTerm || 
      (log.title && log.title.toLowerCase().includes(queryText)) ||
      (log.learnedContent && log.learnedContent.toLowerCase().includes(queryText)) ||
      (log.takeaways && log.takeaways.toLowerCase().includes(queryText));
      
    return matchesCategory && matchesSearch;
  }) : [];

  return (
    <>
      <Navbar />
      
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
              zIndex: 1100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '100px 1.25rem 4rem 1.25rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '700', margin: 0 }}>Command Center</h1>
            <p style={{ opacity: 0.7, margin: '5px 0 0 0', fontSize: '0.9rem' }}>My private repository for code snippets, preprocessing rules, and machine learning guidelines.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/blog/manage')} style={{
              background: 'transparent',
              border: '1px solid var(--accent-color)',
              color: 'var(--accent-color)',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              <FiBookOpen /> Manage Blog
            </button>

            <button onClick={handleOpenCreate} style={{
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

            <button onClick={promptLogout} style={{
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

        {/* Category Grid or Category Detail View */}
        {!activeCategory ? (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.25rem', opacity: 0.9 }}>Knowledge Base Segments</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {categoryCards.map((card) => {
                const IconComponent = card.icon;
                const count = logs.filter(l => (l.category || '').trim().toLowerCase() === card.name.toLowerCase()).length;
                return (
                  <motion.div
                    key={card.name}
                    whileHover={{ y: -4 }}
                    onClick={() => setActiveCategory(card.name)}
                    style={{
                      background: 'var(--card-bg)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(100, 255, 218, 0.15)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IconComponent size={26} color="var(--accent-color)" />
                      <span style={{ background: 'rgba(100, 255, 218, 0.1)', color: 'var(--accent-color)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {count} Items
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>{card.name}</h3>
                    <p style={{ opacity: 0.75, fontSize: '0.88rem', margin: 0, lineHeight: '1.4' }}>
                      {card.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
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
                  fontSize: '0.85rem',
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

            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
              {activeCategory} Guidelines & Snippets
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filteredLogs.length === 0 ? (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '3rem', opacity: 0.6, background: 'var(--card-bg)', borderRadius: '12px', fontSize: '0.9rem' }}>
                  No guidelines or snippets saved under {activeCategory} yet. Click "Add New Entry" to create one!
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} style={{
                    background: 'var(--card-bg)',
                    padding: '1.25rem',
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleOpenEdit(log)}
                            title="Edit Entry"
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', opacity: 0.8, padding: '4px' }}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => promptDelete(log.id)}
                            title="Delete Entry"
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.8, padding: '4px' }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem' }}>{log.title}</h3>
                      
                      {log.learnedContent && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What I Learned:</span>
                          <p style={{ opacity: 0.85, fontSize: '0.88rem', margin: '2px 0 0 0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            {log.learnedContent}
                          </p>
                        </div>
                      )}

                      {log.takeaways && (
                        <div style={{ marginBottom: '1rem', background: 'rgba(100, 255, 218, 0.03)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rules / Takeaways:</span>
                          <p style={{ opacity: 0.9, fontSize: '0.88rem', margin: '2px 0 0 0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            {log.takeaways}
                          </p>
                        </div>
                      )}
                    </div>

                    {log.codeSnippet && (
                      <div style={{ position: 'relative', marginTop: 'auto' }}>
                        <div style={{
                          background: '#020617',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(100, 255, 218, 0.2)',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          overflowX: 'auto',
                          color: '#64ffda',
                          maxHeight: '160px'
                        }}>
                          <pre style={{ margin: 0 }}>{log.codeSnippet}</pre>
                        </div>
                        <button
                          onClick={() => handleCopyCode(log.codeSnippet, log.id)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(100, 255, 218, 0.1)',
                            border: '1px solid rgba(100, 255, 218, 0.3)',
                            color: 'var(--accent-color)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
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

        {/* Modal Form for Create/Edit */}
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
              padding: '1rem',
              boxSizing: 'border-box'
            }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                style={{
                  background: 'var(--card-bg)',
                  padding: '1.5rem 1.25rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(100, 255, 218, 0.2)',
                  width: '100%',
                  maxWidth: '440px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPlus color="var(--accent-color)" /> {editingId ? 'Edit ML Lesson' : 'Log New ML Lesson'}
                  </h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.7 }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveLog} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', boxSizing: 'border-box' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                      <label style={labelStyle}>Day Number</label>
                      <input type="number" placeholder="e.g. 68" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} required style={inputStyle} />
                    </div>
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                      <label style={labelStyle}>Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                        <option value="Preprocessing">Preprocessing</option>
                        <option value="EDA & Statistics">EDA & Statistics</option>
                        <option value="Model Training">Model Training</option>
                        <option value="Model Evaluation">Model Evaluation</option>
                        <option value="Full-Stack AI">Full-Stack AI</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <label style={labelStyle}>Topic Title</label>
                    <input type="text" placeholder="e.g. Polynomial Regression" value={topic} onChange={(e) => setTopic(e.target.value)} required style={inputStyle} />
                  </div>

                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <label style={labelStyle}>1. What I Learned (What is it & Why is it used?)</label>
                    <textarea rows="3" placeholder="Explain in your own words..." value={learnedContent} onChange={(e) => setLearnedContent(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>

                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <label style={labelStyle}>2. Rules / Key Takeaways (Crucial for later)</label>
                    <textarea rows="3" placeholder="Bullet points or practical rules..." value={takeaways} onChange={(e) => setTakeaways(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>

                  <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <label style={labelStyle}>3. Code Snippet (Optional)</label>
                    <textarea rows="3" placeholder="Paste python/js snippet..." value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace', background: '#020617', resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{
                      flex: 1, background: 'transparent', color: 'var(--text-color)', border: '1px solid rgba(100, 255, 218, 0.3)', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
                    }}>
                      Cancel
                    </button>
                    <button type="submit" style={{
                      flex: 1, background: 'var(--accent-color)', color: '#050b14', padding: '10px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '0.9rem'
                    }}>
                      {editingId ? 'Update Lesson' : 'Save Lesson'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Secure Password-Protected Confirmation Modal */}
        <AnimatePresence>
          {confirmConfig.isOpen && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 11, 20, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1rem', boxSizing: 'border-box'
            }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                style={{
                  background: 'var(--card-bg)', padding: '1.5rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: '#ef4444', marginBottom: '1rem' }}>
                  <FiShield size={24} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{confirmConfig.title}</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', margin: '0 0 1.25rem 0', lineHeight: '1.5' }}>
                  {confirmConfig.message}
                </p>

                {confirmConfig.type === 'delete' && (
                  <div style={{ marginBottom: '1.25rem', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter admin password..." 
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        disabled={isDeleting}
                        style={{ ...inputStyle, paddingRight: '45px', margin: 0, width: '100%', boxSizing: 'border-box' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center', padding: '4px' }}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {deleteError && (
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '5px 0 0 0' }}>{deleteError}</p>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
                  <button 
                    onClick={() => { setConfirmConfig({ isOpen: false, title: '', message: '', type: '', dataId: null }); setDeletePassword(''); }} 
                    disabled={isDeleting}
                    style={{
                      flex: 1, background: 'transparent', color: 'var(--text-color)', border: '1px solid rgba(100, 255, 218, 0.3)', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', opacity: isDeleting ? 0.5 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmedAction} 
                    disabled={isDeleting}
                    style={{
                      flex: 1, background: confirmConfig.type === 'delete' ? '#ef4444' : 'var(--accent-color)', color: confirmConfig.type === 'delete' ? '#ffffff' : '#050b14', padding: '10px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', opacity: isDeleting ? 0.7 : 1
                    }}
                  >
                    {isDeleting ? <><FiLoader className="spin" size={16} /> Verifying...</> : (confirmConfig.type === 'delete' ? 'Verify & Delete' : 'Confirm')}
                  </button>
                </div>
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
  maxWidth: '100%',
  padding: '10px 14px',
  background: 'var(--bg-color)',
  border: '1px solid rgba(100, 255, 218, 0.2)',
  borderRadius: '8px',
  color: 'var(--text-color)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  marginBottom: '4px',
  opacity: 0.8
};

export default Dashboard;