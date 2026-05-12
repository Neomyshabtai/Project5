import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Albums() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [search, setSearch] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  useEffect(() => {
    fetchAlbums();
  }, [userId]);

  const fetchAlbums = async () => {
    try {
      const response = await api.get(`/users/${userId}/albums`);
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
        userId: parseInt(userId),
        title: newAlbumTitle
      });
      setAlbums([...albums, response.data]);
      setNewAlbumTitle('');
    } catch (err) {
      console.error('Error creating album:', err);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Albums Directory</h2>
          <input
            type="text"
            className="form-input"
            placeholder="Search by ID or Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAlbums.map(album => (
            <Link 
              to={`/users/${userId}/albums/${album.id}/photos`} 
              key={album.id}
              className="glass-panel"
              style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', textDecoration: 'none', color: 'inherit' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <span style={{ color: '#818cf8', fontWeight: 'bold', marginRight: '1rem' }}>#{album.id}</span>
                <span style={{ fontSize: '1.2rem' }}>{album.title}</span>
              </div>
              <span style={{ color: '#94a3b8' }}>View Photos &rarr;</span>
            </Link>
          ))}
          {filteredAlbums.length === 0 && <p style={{ color: '#94a3b8' }}>No albums found.</p>}
        </div>
      </div>
    </div>
  );
}
