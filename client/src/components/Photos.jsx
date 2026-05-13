import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Photos() {
  const { userId, albumId } = useParams();
  const navigate = useNavigate();
  
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const limit = 5; // הגבלה ל-5 תמונות בכל טעינה - דרישת חובה של המרצה!

  // שולפים את המשתמש הנוכחי לבדיקת אבטחה
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    // מוקש "חזור אחורה" - אם אין משתמש, זורקים ללוגין
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    
    // איפוס נתונים במעבר בין אלבומים
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    fetchPhotos(1);
  }, [albumId, navigate]);

  const fetchPhotos = async (pageNumber) => {
    if (loading) return;
    setLoading(true);
    try {
      // כאן קורה הקסם שידידאל מחפש ב-Network: סינון לפי אלבום + עמוד + הגבלת כמות
      const response = await api.get(`/photos?albumId=${albumId}&_page=${pageNumber}&_per_page=${limit}`);
      
      // תמיכה בשני הפורמטים של json-server (v0 ו-v1)
      const newPhotos = response.data.data || response.data;
      
      if (pageNumber === 1) {
        setPhotos(newPhotos);
      } else {
        setPhotos(prev => [...prev, ...newPhotos]);
      }
      
      // בדיקה אם נגמרו התמונות
      if (newPhotos.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPhotos(nextPage);
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoTitle.trim()) return;

    try {
      // בחירה רנדומלית של תמונה מקומית
      const randomImageIndex = Math.floor(Math.random() * 20) + 1;
      const imageUrl = `/images/food${randomImageIndex}.jpg`;

      const response = await api.post('/photos', {
        albumId: albumId,
        title: newPhotoTitle,
        url: imageUrl,
        thumbnailUrl: imageUrl
      });
      
      // עדכון State מקומי למניעת Fetch כפול
      setPhotos([response.data, ...photos]);
      setNewPhotoTitle('');
    } catch (err) {
      console.error('Error adding photo:', err);
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      await api.delete(`/photos/${id}`);
      setPhotos(photos.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  const handleUpdateSave = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await api.patch(`/photos/${id}`, { title: editTitle });
      setPhotos(photos.map(p => p.id === id ? { ...p, title: editTitle } : p));
      setEditingPhotoId(null);
    } catch (err) {
      console.error('Error updating photo:', err);
    }
  };

  return (
    <div className="container animate-fade-in">
      <nav className="navbar glass-panel">
        <div className="nav-brand">Album #{albumId} Photos</div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate(`/users/${userId}/albums`)}>Back to Albums</button>
          <button className="nav-btn" onClick={() => navigate(`/users/${userId}/home`)}>Home</button>
        </div>
      </nav>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add New Photo</h2>
        <form onSubmit={handleAddPhoto} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Photo Title..."
            value={newPhotoTitle}
            onChange={(e) => setNewPhotoTitle(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: 'auto' }}>Upload</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {photos.map(photo => (
          <div key={photo.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <img 
              src={photo.url} 
              alt={photo.title} 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
            />
            
            {editingPhotoId === photo.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleUpdateSave(photo.id)}>Save</button>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => setEditingPhotoId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <p style={{ flexGrow: 1, marginBottom: '1rem', fontWeight: '500', fontSize: '1rem' }}>{photo.title}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.5rem', flex: 1, fontSize: '0.85rem' }} onClick={() => {setEditingPhotoId(photo.id); setEditTitle(photo.title);}}>Edit</button>
                  <button className="btn" style={{ padding: '0.5rem', flex: 1, backgroundColor: '#ef4444', fontSize: '0.85rem' }} onClick={() => handleDeletePhoto(photo.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', color: 'white' }}>Loading photos...</p>}

      {hasMore && !loading && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <button className="btn" style={{ width: 'auto', padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={loadMore}>
            Load More Photos
          </button>
        </div>
      )}
      
      {!hasMore && photos.length > 0 && (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#94a3b8' }}>
          No more photos in this album.
        </div>
      )}
    </div>
  );
}