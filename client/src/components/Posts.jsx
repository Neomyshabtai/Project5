import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

function Posts() {
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('my'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriterion, setSearchCriterion] = useState('title');
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    fetchPosts();
  }, [userId, viewMode]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = viewMode === 'my' ? `/posts?userId=${userId}` : '/posts';
      const response = await api.get(url);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async () => {
    const title = prompt("הזיני כותרת לפוסט החדש:");
    const body = prompt("הזיני את תוכן הפוסט:");
    if (title && body) {
      try {
        const newPost = { userId: Number(userId), title, body };
        const response = await api.post('/posts', newPost);
        if (viewMode === 'my' || viewMode === 'all') setPosts([response.data, ...posts]);
        alert("הפוסט נוסף בהצלחה!");
      } catch (error) { console.error(error); }
    }
  };

  const handleUpdatePost = async (post) => {
    const newBody = prompt("עדכני את תוכן הפוסט:", post.body);
    if (newBody && newBody !== post.body) {
      try {
        const response = await api.patch(`/posts/${post.id}`, { body: newBody });
        setPosts(posts.map(p => p.id === post.id ? { ...p, body: response.data.body } : p));
        setSelectedPost({ ...selectedPost, body: response.data.body });
      } catch (error) { console.error(error); }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("בטוח שברצונך למחוק את הפוסט?")) {
      try {
        await api.delete(`/posts/${postId}`);
        setPosts(posts.filter(post => post.id !== postId));
        if (selectedPost?.id === postId) setSelectedPost(null);
      } catch (error) { console.error(error); }
    }
  };

  // --- ניהול תגובות (Comments) ---

  const fetchComments = async (postId) => {
    try {
      const response = await api.get(`/comments?postId=${postId}`);
      setComments(response.data);
      setShowComments(true);
    } catch (error) { console.error(error); }
  };

  const handleAddComment = async (postId) => {
    const commentText = prompt("הזיני את התגובה שלך:");
    if (commentText && currentUser) {
      try {
        const allCommentsRes = await api.get('/comments');
        const maxId = allCommentsRes.data.length > 0 
          ? Math.max(...allCommentsRes.data.map(c => Number(c.id))) 
          : 0;

        const newComment = {
          postId: postId,
          id: (maxId + 1).toString(),
          name: currentUser.name,
          email: currentUser.email,
          body: commentText
        };
        const response = await api.post('/comments', newComment);
        setComments([...comments, response.data]);
      } catch (error) { console.error(error); }
    }
  };

  // פונקציית מחיקת תגובה שחזרה לקוד
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("למחוק את התגובה שלך?")) {
      try {
        await api.delete(`/comments/${commentId}`);
        setComments(comments.filter(c => c.id !== commentId));
      } catch (error) { console.error(error); }
    }
  };

  // פונקציית עדכון תגובה שחזרה לקוד
  const handleUpdateComment = async (comment) => {
    const newBody = prompt("עדכני את התגובה שלך:", comment.body);
    if (newBody && newBody !== comment.body) {
      try {
        const response = await api.patch(`/comments/${comment.id}`, { body: newBody });
        setComments(comments.map(c => c.id === comment.id ? { ...c, body: response.data.body } : p));
      } catch (error) { console.error(error); }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (searchCriterion === 'id') return post.id.toString().includes(searchQuery);
    return post.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container glass-panel animate-fade-in" style={{ padding: '20px', color: 'white', maxWidth: '900px' }}>
      <h1>Posts {viewMode === 'all' ? '(Global Feed)' : '(My Posts)'}</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`btn ${viewMode === 'my' ? '' : 'btn-secondary'}`} onClick={() => setViewMode('my')}>My Posts</button>
          <button className={`btn ${viewMode === 'all' ? '' : 'btn-secondary'}`} onClick={() => setViewMode('all')}>All Posts</button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={searchCriterion} onChange={(e) => setSearchCriterion(e.target.value)} className="form-input" style={{ width: 'auto', marginBottom: 0 }}>
            <option value="title">Search by Title</option>
            <option value="id">Search by ID</option>
          </select>
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-input" style={{ marginBottom: 0 }} />
        </div>
        
        {viewMode === 'my' && <button className="btn" onClick={handleAddPost}>+ New Post</button>}
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ textAlign: 'left' }}>
          {filteredPosts.map(post => (
            <div key={post.id} style={{ 
                padding: '15px', marginBottom: '10px', 
                background: selectedPost?.id === post.id ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
                borderRadius: '8px', border: selectedPost?.id === post.id ? '1px solid #60a5fa' : '1px solid transparent'
            }}>
              <div onClick={() => { setSelectedPost(selectedPost?.id === post.id ? null : post); setShowComments(false); }} style={{ cursor: 'pointer' }}>
                <span style={{ color: '#94a3b8', marginRight: '10px', fontSize: '0.8rem' }}>
                  User #{post.userId} | Post #{post.id}
                </span>
                <br />
                <strong style={{ fontSize: '1.1rem' }}>{post.title}</strong>
              </div>
              
              {selectedPost?.id === post.id && (
                <div className="animate-fade-in" style={{ marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px' }}>
                  <p style={{ lineHeight: '1.6' }}>{post.body}</p>
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => fetchComments(post.id)}>
                      {showComments ? 'Hide Comments' : 'Show Comments'}
                    </button>
                    {post.userId === Number(userId) && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleUpdatePost(post)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                      </>
                    )}
                  </div>

                  {showComments && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4>Comments:</h4>
                        <button className="btn btn-secondary" style={{ padding: '5px 15px', fontSize: '0.85rem' }} onClick={() => handleAddComment(selectedPost.id)}>
                          + Add Comment
                        </button>
                      </div>
                      {comments.map(comment => {
                        // בדיקה האם זו תגובה שלך
                        const isMyComment = currentUser && comment.email === currentUser.email;
                        return (
                          <div key={comment.id} style={{ fontSize: '0.9rem', marginBottom: '10px', padding: '10px', background: isMyComment ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong style={{ color: isMyComment ? '#60a5fa' : '#94a3b8' }}>{comment.email}</strong>
                              
                              {/* לחצני עריכה ומחיקה יופיעו רק לתגובות שלך */}
                              {isMyComment && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <span onClick={() => handleUpdateComment(comment)} style={{ cursor: 'pointer', color: '#60a5fa', fontSize: '0.8rem' }}>Edit</span>
                                  <span onClick={() => handleDeleteComment(comment.id)} style={{ cursor: 'pointer', color: '#f87171', fontSize: '0.8rem' }}>Delete</span>
                                </div>
                              )}
                            </div>
                            <div style={{ marginTop: '5px' }}>{comment.body}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <br /><Link to={`/users/${userId}/home`} className="btn">Back to Home</Link>
    </div>
  );
}

export default Posts;