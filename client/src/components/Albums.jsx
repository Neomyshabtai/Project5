import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Albums() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [search, setSearch] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  //  שולפים את המשתמש הנוכחי כדי לוודא התחברות
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    fetchAlbums();
  }, [userId, navigate]);

  const fetchAlbums = async () => {
    try {
      const response = await api.get(`/albums?userId=${userId}`);
      setAlbums(response.data);
    } catch (err) {
      console.error('Error fetching albums:', err);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    try {
      const response = await api.post('/albums', {
        userId: Number(userId),
        title: newAlbumTitle
      });
      // מונעים Fetch כפול
      setAlbums([...albums, response.data]);
      setNewAlbumTitle('');
    } catch (err) {
      console.error('Error creating album:', err);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (window.confirm("בטוח שברצונך למחוק את האלבום? (פעולה זו תמחק גם את כל התמונות שבתוכו!)")) {
      try {
        const photosRes = await api.get(`/photos?albumId=${albumId}`);
        const photosToDelete = photosRes.data;

        for (let photo of photosToDelete) {
          await api.delete(`/photos/${photo.id}`);
        }

        await api.delete(`/albums/${albumId}`);
        
        setAlbums(albums.filter(album => album.id !== albumId));
      } catch (error) {
        console.error("Error deleting album and photos:", error);
      }
    }
  };

  // Filter by id or title
  const filteredAlbums = albums.filter((album) => {
    const term = search.toLowerCase();
    return (
      album.id.toString().includes(term) ||
      album.title.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container animate-fade-in">
      <nav className="navbar glass-panel">
        <div className="nav-brand">My Albums</div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate(`/users/${userId}/home`)}>Home</button>
        </div>
      </nav>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Create New Album</h2>
        <form onSubmit={handleCreateAlbum} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Album Title..."
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: 'auto' }}>Create</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <h2>Albums Directory</h2>
          <input
            type="text"
            className="form-input"
            placeholder="Search by ID or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '300px', marginBottom: 0 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAlbums.map(album => (
            <div 
              key={album.id}
              className="glass-panel"
              style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
            >
              <Link 
                to={`/users/${userId}/albums/${album.id}/photos`} 
                style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', alignItems: 'center' }}
              >
                <span style={{ color: '#818cf8', fontWeight: 'bold', marginRight: '1rem' }}>#{album.id}</span>
                <span style={{ fontSize: '1.2rem' }}>{album.title}</span>
              </Link>
              
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to={`/users/${userId}/albums/${album.id}/photos`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  View Photos &rarr;
                </Link>
                <button 
                  className="btn btn-danger" 
                  style={{ padding: '8px 16px', margin: 0, fontSize: '0.9rem' }} 
                  onClick={() => handleDeleteAlbum(album.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredAlbums.length === 0 && <p style={{ color: '#94a3b8' }}>No albums found.</p>}
        </div>
      </div>
    </div>
  );
}