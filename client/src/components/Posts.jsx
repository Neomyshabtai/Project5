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

  // --- States for Adding/Editing Posts ---
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostBody, setEditPostBody] = useState('');

  // --- States for Adding/Editing Comments ---
  const [newCommentBody, setNewCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState('');

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

  // --- פוסטים ---
  const handleAddPost = async (e) => {
    e.preventDefault(); // מונע ריענון של הדף
    if (newPostTitle.trim() && newPostBody.trim()) {
      try {
        const newPost = { userId: Number(userId), title: newPostTitle, body: newPostBody };
        const response = await api.post('/posts', newPost);
        if (viewMode === 'my' || viewMode === 'all') setPosts([response.data, ...posts]);
        setNewPostTitle('');
        setNewPostBody('');
      } catch (error) { console.error(error); }
    }
  };

  const handleSaveEditPost = async (postId) => {
    if (editPostTitle.trim() && editPostBody.trim()) {
      try {
        const response = await api.patch(`/posts/${postId}`, { title: editPostTitle, body: editPostBody });
        setPosts(posts.map(p => p.id === postId ? { ...p, title: response.data.title, body: response.data.body } : p));
        if (selectedPost?.id === postId) {
            setSelectedPost({ ...selectedPost, title: response.data.title, body: response.data.body });
        }
        setEditingPostId(null);
      } catch (error) { console.error(error); }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("בטוח שברצונך למחוק את הפוסט (פעולה זו תמחק גם את כל התגובות שלו)?")) {
      try {
        const commentsRes = await api.get(`/comments?postId=${postId}`);
        const commentsToDelete = commentsRes.data;

        for (let comment of commentsToDelete) {
          await api.delete(`/comments/${comment.id}`);
        }
        await api.delete(`/posts/${postId}`);

        setPosts(posts.filter(post => post.id !== postId));
        if (selectedPost?.id === postId) setSelectedPost(null);
        
      } catch (error) { 
        console.error("Error deleting post and comments:", error); 
      }
    }
  };

  // --- תגובות ---
  const fetchComments = async (postId) => {
    try {
      const response = await api.get(`/comments?postId=${postId}`);
      setComments(response.data);
      setShowComments(true);
    } catch (error) { console.error(error); }
  };

 const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (newCommentBody.trim() && currentUser) {
      try {
        const newComment = {
          postId: postId,
          name: currentUser.name,
          email: currentUser.email,
          body: newCommentBody
        };
        // ברגע שאנחנו עושים POST בלי ID, השרת מייצר אחד ייחודי אוטומטית!
        const response = await api.post('/comments', newComment);
        setComments([...comments, response.data]);
        setNewCommentBody('');
      } catch (error) { console.error(error); }
    }
  };
  const handleSaveEditComment = async (commentId) => {
    if (editCommentBody.trim()) {
      try {
        const response = await api.patch(`/comments/${commentId}`, { body: editCommentBody });
        setComments(comments.map(c => c.id === commentId ? { ...c, body: response.data.body } : c));
        setEditingCommentId(null);
      } catch (error) { console.error(error); }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("למחוק את התגובה שלך?")) {
      try {
        await api.delete(`/comments/${commentId}`);
        setComments(comments.filter(c => c.id !== commentId));
      } catch (error) { console.error(error); }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (searchCriterion === 'id') return post.id.toString().includes(searchQuery);
    return post.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container glass-panel animate-fade-in" style={{ padding: '20px', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Posts {viewMode === 'all' ? '(Global Feed)' : '(My Posts)'}</h1>

      {/* --- Toolbar --- */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </div>

      {/* --- Add New Post Form (Visible only in 'My Posts') --- */}
      {viewMode === 'my' && (
        <form onSubmit={handleAddPost} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', width: '100%', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Create New Post</h3>
          <input 
            type="text" 
            placeholder="Post Title..." 
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '12px', fontSize: '1.1rem', borderRadius: '6px', marginBottom: 0 }}
          />
          <textarea 
            placeholder="What's on your mind?..." 
            value={newPostBody}
            onChange={(e) => setNewPostBody(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '6px', minHeight: '80px', marginBottom: 0, resize: 'vertical' }}
          />
          <button type="submit" className="btn" style={{ padding: '10px 20px', fontSize: '1.1rem', margin: '10px 0 0 0', borderRadius: '6px', alignSelf: 'flex-start' }}>
            Publish Post
          </button>
        </form>
      )}

      {/* --- Posts List --- */}
      {loading ? <p>Loading...</p> : (
        <div style={{ textAlign: 'left' }}>
          {filteredPosts.map(post => (
            <div key={post.id} style={{ 
                padding: '15px', marginBottom: '15px', 
                background: selectedPost?.id === post.id ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
                borderRadius: '8px', border: selectedPost?.id === post.id ? '1px solid #60a5fa' : '1px solid transparent',
                transition: 'all 0.2s'
            }}>
              
              {/* --- עריכת פוסט או תצוגה --- */}
              {editingPostId === post.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <input 
                    type="text" 
                    value={editPostTitle} 
                    onChange={(e) => setEditPostTitle(e.target.value)} 
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '1.1rem', borderRadius: '4px', marginBottom: 0 }}
                    autoFocus
                  />
                  <textarea 
                    value={editPostBody} 
                    onChange={(e) => setEditPostBody(e.target.value)} 
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '1rem', borderRadius: '4px', minHeight: '80px', marginBottom: 0, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button onClick={() => handleSaveEditPost(post.id)} className="btn" style={{ flex: '0 0 auto', width: 'auto', minWidth: 'fit-content', padding: '6px 12px', margin: 0 }}>Save</button>
                    <button onClick={() => setEditingPostId(null)} className="btn" style={{ flex: '0 0 auto', width: 'auto', minWidth: 'fit-content', padding: '6px 12px', margin: 0, background: '#64748b' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => { setSelectedPost(selectedPost?.id === post.id ? null : post); setShowComments(false); }} style={{ cursor: 'pointer' }}>
                  <span style={{ color: '#94a3b8', marginRight: '10px', fontSize: '0.8rem' }}>
                    User #{post.userId} | Post #{post.id}
                  </span>
                  <br />
                  <strong style={{ fontSize: '1.2rem' }}>{post.title}</strong>
                </div>
              )}
              
              {/* --- תוכן הפוסט ואזור התגובות כאשר הוא נבחר --- */}
              {selectedPost?.id === post.id && editingPostId !== post.id && (
                <div className="animate-fade-in" style={{ marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px' }}>
                  <p style={{ lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{post.body}</p>
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => fetchComments(post.id)}>
                      {showComments ? 'Hide Comments' : 'Show Comments'}
                    </button>
                    {String(post.userId) === String(userId) && (
                      <>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setEditingPostId(post.id); setEditPostTitle(post.title); setEditPostBody(post.body); }}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '8px 16px' }} onClick={() => handleDeletePost(post.id)}>Delete</button>
                      </>
                    )}
                  </div>

                  {showComments && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
                      <h4 style={{ marginBottom: '15px' }}>Comments:</h4>
                      
                      {/* רשימת התגובות */}
                      {comments.map(comment => {
                        const isMyComment = currentUser && comment.email === currentUser.email;
                        return (
                          <div key={comment.id} style={{ fontSize: '0.9rem', marginBottom: '10px', padding: '12px', background: isMyComment ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <strong style={{ color: isMyComment ? '#60a5fa' : '#94a3b8' }}>{comment.email}</strong>
                              {isMyComment && editingCommentId !== comment.id && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <span onClick={() => { setEditingCommentId(comment.id); setEditCommentBody(comment.body); }} style={{ cursor: 'pointer', color: '#60a5fa', fontSize: '0.85rem' }}>Edit</span>
                                  <span onClick={() => handleDeleteComment(comment.id)} style={{ cursor: 'pointer', color: '#f87171', fontSize: '0.85rem' }}>Delete</span>
                                </div>
                              )}
                            </div>

                            {/* עריכת תגובה או תצוגה */}
                            {editingCommentId === comment.id ? (
                              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%' }}>
                                <input 
                                  type="text" 
                                  value={editCommentBody} 
                                  onChange={(e) => setEditCommentBody(e.target.value)} 
                                  className="form-input"
                                  style={{ flex: '1 1 100%', padding: '6px 10px', fontSize: '0.9rem', marginBottom: 0 }}
                                />
                                <button onClick={() => handleSaveEditComment(comment.id)} className="btn" style={{ flex: '0 0 auto', width: 'auto', padding: '6px 12px', margin: 0, fontSize: '0.85rem' }}>Save</button>
                                <button onClick={() => setEditingCommentId(null)} className="btn" style={{ flex: '0 0 auto', width: 'auto', padding: '6px 12px', margin: 0, fontSize: '0.85rem', background: '#64748b' }}>Cancel</button>
                              </div>
                            ) : (
                              <div>{comment.body}</div>
                            )}
                          </div>
                        );
                      })}

                      {/* הוספת תגובה חדשה */}
                      <form onSubmit={(e) => handleAddComment(e, selectedPost.id)} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <input 
                          type="text" 
                          placeholder="Write a comment..." 
                          value={newCommentBody}
                          onChange={(e) => setNewCommentBody(e.target.value)}
                          className="form-input"
                          style={{ flex: '1 1 100%', padding: '10px', fontSize: '0.95rem', marginBottom: 0, borderRadius: '6px' }}
                        />
                        <button type="submit" className="btn" style={{ flex: '0 0 auto', width: 'auto', padding: '10px 20px', margin: 0, borderRadius: '6px' }}>
                          Post
                        </button>
                      </form>

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