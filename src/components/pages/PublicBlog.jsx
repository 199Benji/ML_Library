import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { motion } from 'framer-motion';

const PublicBlog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTag, setSelectedTag] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching public blog posts:', error);
      }
    };
    fetchPublicPosts();
  }, []);

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

  // Extract all unique tags from posts
  const allTags = ['All', ...new Set(posts.flatMap(post => post.tags || []))];

  // Filter posts based on selected tag
  const filteredPosts = selectedTag === 'All' 
    ? posts 
    : posts.filter(post => post.tags && post.tags.includes(selectedTag));

  return (
    <>
      <Navbar />
      
      <div style={{ padding: '100px 1.25rem 4rem 1.25rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        {selectedPost ? (
          /* Full Article Reader View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => setSelectedPost(null)}
              style={{ background: 'transparent', border: '1px solid rgba(100, 255, 218, 0.3)', color: 'var(--accent-color)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.85rem' }}
            >
              ← Back to All Milestones
            </button>

            <span style={{ fontSize: '0.8rem', margin: '0.8rem', color: 'var(--accent-color)', fontWeight: '600' }}>
              {getTimeAgo(selectedPost.createdAt)}
            </span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: '700', margin: '10px 0 1rem 0' }}>{selectedPost.title}</h1>
            <p style={{ opacity: 0.85, fontSize: '1.05rem', fontStyle: 'italic', margin: '0 0 1.5rem 0', borderLeft: '3px solid var(--accent-color)', paddingLeft: '1rem' }}>
              {selectedPost.summary}
            </p>
            
            {selectedPost.coverImageUrl && (
              <div style={{ width: '100%', maxHeight: '450px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', background: '#020617', display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={selectedPost.coverImageUrl} 
                  alt={selectedPost.title} 
                  style={{ width: '100%', height: '100%', maxHeight: '450px', objectFit: 'contain' }} 
                />
              </div>
            )}

            <div style={{ lineHeight: '1.8', fontSize: '1rem', opacity: 0.9, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {selectedPost.content}
            </div>
          </motion.div>
        ) : (
          /* Public Blog Grid View with Tag Filter & Picture Cards */
          <div>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: '700', margin: 0 }}>Learning Milestones & Blog</h1>
              <p style={{ opacity: 0.7, margin: '8px 0 0 0', fontSize: '0.95rem' }}>Follow along with my daily progress, notes, and building journey.</p>
            </div>

            {/* Tag Filter Bar */}
            {allTags.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      background: selectedTag === tag ? 'var(--accent-color)' : 'rgba(100, 255, 218, 0.05)',
                      color: selectedTag === tag ? '#050b14' : 'var(--accent-color)',
                      border: '1px solid rgba(100, 255, 218, 0.3)',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 350px))', justifyContent: 'center', gap: '1.5rem', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
              {filteredPosts.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', opacity: 0.6, background: 'var(--card-bg)', borderRadius: '12px' }}>
                  No posts found matching #{selectedTag}.
                </div>
              ) : (
                filteredPosts.map(post => (
                  <motion.div 
                    key={post.id}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedPost(post)}
                    style={{ background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid rgba(100, 255, 218, 0.15)', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '350px', boxSizing: 'border-box' }}
                  >
                    {post.coverImageUrl && (
                      <div style={{ height: '180px', width: '100%', overflow: 'hidden', background: '#020617' }}>
                        <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: '600' }}>
                          {getTimeAgo(post.createdAt)}
                        </span>
                        <h3 style={{ margin: '6px 0 8px 0', fontSize: '1.2rem', fontWeight: '600' }}>{post.title}</h3>
                        <p style={{ opacity: 0.8, fontSize: '0.88rem', margin: 0, lineHeight: '1.4' }}>{post.summary}</p>
                      </div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                          {post.tags.map(t => (
                            <span key={t} style={{ background: 'rgba(100, 255, 218, 0.1)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' }}>#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </>
  );
};

export default PublicBlog;