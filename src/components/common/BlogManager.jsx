import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FiPlus, FiTrash2, FiEdit2, FiShield, FiEye, FiEyeOff, FiLoader, FiUploadCloud, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return 'Just now';
};

const BlogManager = ({ showToast }) => {
  const [posts, setPosts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const CLOUDINARY_CLOUD_NAME = 'nmr00exl'; 
  const CLOUDINARY_UPLOAD_PRESET = 'Ml Blog';

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      if (data.secure_url) {
        setCoverImageUrl(data.secure_url);
        showToast('Image uploaded successfully!');
      } else {
        showToast('Image upload failed.');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      showToast('Error uploading image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSummary('');
    setCoverImageUrl('');
    setContent('');
    setTags('');
    setIsCreating(true);
    setViewingPost(null);
  };

  const handleOpenEdit = (post, e) => {
    if (e) e.stopPropagation();
    setEditingId(post.id);
    setTitle(post.title || '');
    setSummary(post.summary || '');
    setCoverImageUrl(post.coverImageUrl || '');
    setContent(post.content || '');
    setTags(Array.isArray(post.tags) ? post.tags.join(', ') : '');
    setIsCreating(true);
    setViewingPost(null);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const postData = {
        title,
        summary,
        coverImageUrl: coverImageUrl || '',
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(doc(db, 'blog_posts', editingId), postData);
        showToast('Blog post updated successfully!');
      } else {
        postData.createdAt = new Date();
        await addDoc(collection(db, 'blog_posts'), postData);
        showToast('Blog post published successfully!');
      }

      setEditingId(null);
      setTitle('');
      setSummary('');
      setCoverImageUrl('');
      setContent('');
      setTags('');
      setIsCreating(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving blog post:', error);
      showToast('Error saving post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmedDelete = async () => {
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
      await deleteDoc(doc(db, 'blog_posts', confirmDeleteId));
      fetchPosts();
      showToast('Blog post deleted.');
      setConfirmDeleteId(null);
      setDeletePassword('');
    } catch (error) {
      console.error('Deletion failed:', error);
      setDeleteError('Incorrect password. Deletion cancelled.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ marginTop: '4rem', borderTop: '1px solid rgba(100, 255, 218, 0.15)', paddingTop: '2.5rem', width: '100%', boxSizing: 'border-box' }}>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin-loader { animation: spin 1s linear infinite; }
      `}</style>

      {viewingPost ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button 
            onClick={() => setViewingPost(null)}
            style={{ background: 'transparent', border: '1px solid rgba(100, 255, 218, 0.3)', color: 'var(--accent-color)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiArrowLeft /> Back to Posts
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '600' }}>
            {getTimeAgo(viewingPost.createdAt)}
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: '700', margin: '10px 0 1rem 0' }}>{viewingPost.title}</h1>
          <p style={{ opacity: 0.85, fontSize: '1.05rem', fontStyle: 'italic', margin: '0 0 1.5rem 0', borderLeft: '3px solid var(--accent-color)', paddingLeft: '1rem' }}>
            {viewingPost.summary}
          </p>
          
          {viewingPost.coverImageUrl && (
            <div style={{ width: '100%', maxHeight: '450px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', background: '#020617', display: 'flex', justifyContent: 'center' }}>
              <img src={viewingPost.coverImageUrl} alt={viewingPost.title} style={{ width: '100%', height: '100%', maxHeight: '450px', objectFit: 'contain' }} />
            </div>
          )}

          <div style={{ lineHeight: '1.8', fontSize: '1rem', opacity: 0.9, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {viewingPost.content}
          </div>
        </motion.div>
      ) : (
        <>
          {/* Aligned Header Section */}
          <div style={{ maxWidth: '1100px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0 0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Public Blog & Milestones</h2>
              <p style={{ opacity: 0.7, margin: '4px 0 0 0', fontSize: '0.88rem' }}>Upload images, draft, and push updates seamlessly.</p>
            </div>
            
            <button 
              onClick={() => isCreating ? setIsCreating(false) : handleOpenCreate()}
              style={{
                background: 'transparent',
                border: '1px solid var(--accent-color)',
                color: 'var(--accent-color)',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
                fontSize: '0.88rem',
                whiteSpace: 'nowrap'
              }}
            >
              <FiPlus /> {isCreating ? 'Close Editor' : 'New Blog Post'}
            </button>
          </div>

          {isCreating && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--card-bg)',
                padding: '1.5rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(100, 255, 218, 0.2)',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                maxWidth: '1100px',
                margin: '0 auto 2rem auto',
                boxSizing: 'border-box'
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
                {editingId ? 'Edit Milestone Post' : 'Draft New Milestone Post'}
              </h3>
              
              <form onSubmit={handleSavePost} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={labelStyle}>Post Title</label>
                  <input type="text" placeholder="e.g. Hitting Day 70 of #90DaysOfLearningML" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Short Hook / Subtitle (Catchy summary)</label>
                  <input type="text" placeholder="Brief hook for readers..." value={summary} onChange={(e) => setSummary(e.target.value)} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Cover Image (Upload from phone/PC)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{
                      background: 'rgba(100, 255, 218, 0.1)',
                      border: '1px dashed var(--accent-color)',
                      color: 'var(--accent-color)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      flex: 1
                    }}>
                      {isUploadingImage ? <FiLoader size={18} className="spin-loader" /> : <FiUploadCloud size={18} />}
                      {isUploadingImage ? 'Uploading to Cloudinary...' : 'Choose Image File'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploadingImage} />
                    </label>
                    {coverImageUrl && !isUploadingImage && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }}>✓ Image Uploaded</span>
                    )}
                  </div>
                  {coverImageUrl && (
                    <div style={{ marginTop: '8px', height: '80px', width: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(100,255,218,0.2)' }}>
                      <img src={coverImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Full Article Content (Markdown / Text)</label>
                  <textarea rows="6" placeholder="Write your milestone reflections here..." value={content} onChange={(e) => setContent(e.target.value)} required style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                <div>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input type="text" placeholder="ml, python, career" value={tags} onChange={(e) => setTags(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsCreating(false)} style={{ flex: 1, background: 'transparent', color: 'var(--text-color)', border: '1px solid rgba(100, 255, 218, 0.3)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUploadingImage || isSubmitting} 
                    style={{ 
                      flex: 1, 
                      background: 'var(--accent-color)', 
                      color: '#050b14', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontWeight: '600', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: (isUploadingImage || isSubmitting) ? 0.6 : 1 
                    }}
                  >
                    {isSubmitting && <FiLoader size={16} className="spin-loader" />}
                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Post' : 'Publish Post')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Centered Grid Layout matching Content Max-Width */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 350px))', justifyContent: 'center', gap: '1.25rem', maxWidth: '1100px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {posts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', opacity: 0.6, fontSize: '0.9rem', padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '10px', textAlign: 'center' }}>
                No blog posts published yet. Click "New Blog Post" to share your first milestone!
              </div>
            ) : (
              posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => setViewingPost(post)}
                  style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid rgba(100, 255, 218, 0.15)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', cursor: 'pointer', width: '100%', maxWidth: '350px', margin: '0 auto', boxSizing: 'border-box' }}
                >
                  {post.coverImageUrl && (
                    <div style={{ height: '140px', width: '100%', overflow: 'hidden', background: '#020617' }}>
                      <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6, color: 'var(--accent-color)', fontWeight: '600' }}>
                          {getTimeAgo(post.createdAt)}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={(e) => handleOpenEdit(post, e)} title="Edit Post" style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', opacity: 0.8 }}>
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(post.id); }} title="Delete Post" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.8 }}>
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', wordBreak: 'break-word' }}>{post.title}</h3>
                      <p style={{ opacity: 0.8, fontSize: '0.85rem', margin: 0, lineHeight: '1.4', wordBreak: 'break-word' }}>{post.summary}</p>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {post.tags.map(t => (
                          <span key={t} style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Password Verification Modal for Deletion */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 11, 20, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1rem', boxSizing: 'border-box' }}>
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} style={{ background: 'var(--card-bg)', padding: '1.5rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', boxSizing: 'border-box' }}>
              <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: '#ef4444', marginBottom: '1rem' }}>
                <FiShield size={24} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Security Verification</h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem', margin: '0 0 1.25rem 0' }}>Enter your admin password to confirm deletion of this post.</p>
              
              <div style={{ marginBottom: '1.25rem', textAlign: 'left', position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter admin password..." 
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={isDeleting}
                  style={{ ...inputStyle, paddingRight: '45px', margin: 0, width: '100%', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', opacity: 0.7 }}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
                {deleteError && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '5px 0 0 0' }}>{deleteError}</p>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
                <button onClick={() => { setConfirmDeleteId(null); setDeletePassword(''); }} disabled={isDeleting} style={{ flex: 1, background: 'transparent', color: 'var(--text-color)', border: '1px solid rgba(100, 255, 218, 0.3)', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleConfirmedDelete} disabled={isDeleting} style={{ flex: 1, background: '#ef4444', color: '#ffffff', padding: '10px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                  {isDeleting ? <><FiLoader size={16} className="spin-loader" /> Verifying...</> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
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

export default BlogManager;