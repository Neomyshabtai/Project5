import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Photos() {
  const { userId, albumId } = useParams();
  const navigate = useNavigate();
  
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const limit = 5; // Load 5 photos at a time

  useEffect(() => {
    fetchPhotos(1);
  }, [albumId]);

  const fetchPhotos = async (pageNumber) => {
    try {
      const response = await api.get(`/albums/${albumId}/photos?_page=${pageNumber}&_limit=${limit}`);
      const newPhotos = response.data;
      
      if (pageNumber === 1) {
        setPhotos(newPhotos);
      } else {
        setPhotos(prev => [...prev, ...newPhotos]);
      }
      
      // If we got fewer photos than the limit, there are no more photos to load
      if (newPhotos.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
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
      // Pick a random image from our 20 local images for the new photo
      const randomImageIndex = Math.floor(Math.random() * 20) + 1;
      const imageUrl = `/images/food${randomImageIndex}.jpg`;

      const response = await api.post('/photos', {
        albumId: parseInt(albumId),
        title: newPhotoTitle,
        url: imageUrl,
        thumbnailUrl: imageUrl
      });
      
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

  const handleUpdateStart = (photo) => {
    setEditingPhotoId(photo.id);
    setEditTitle(photo.title);
  };

  const handleUpdateSave = async (id) => {
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
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.5rem' }} onClick={() => handleUpdateSave(photo.id)}>Save</button>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setEditingPhotoId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <p style={{ flexGrow: 1, marginBottom: '1rem', fontWeight: '500' }}>{photo.title}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.5rem', flex: 1 }} onClick={() => handleUpdateStart(photo)}>Edit</button>
                  <button className="btn" style={{ padding: '0.5rem', flex: 1, backgroundColor: '#ef4444' }} onClick={() => handleDeletePhoto(photo.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
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
      
      {photos.length === 0 && !hasMore && (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#94a3b8' }}>
          This album is empty.
        </div>
      )}
    </div>
  );
}
