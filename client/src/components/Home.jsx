import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    
    // בדיקה בסיסית: האם יש מישהו מחובר?
    if (!storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    // בדיקת אבטחה: האם ה-ID ב-URL תואם למשתמש בזיכרון?
    // משתמשים ב- == כדי להשוות מספר למחרוזת בלי בעיות טיפוסים
    if (parsedUser.id != userId) {
      navigate(`/users/${parsedUser.id}/home`, { replace: true });
      return;
    }

    setUser(parsedUser);
  }, [userId, navigate]);

  // אם המשתמש עוד לא נטען ב-State, נציג טעינה קלה אבל לא נשבור את המבנה
  if (!user) {
    return <div className="container" style={{color: 'white', textAlign: 'center', paddingTop: '50px'}}>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="container animate-fade-in">
      <nav className="navbar glass-panel">
        <div className="nav-brand">
          Welcome, {user.name} 👋
        </div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => setShowInfo(true)}>Info</button>
          <Link to={`/users/${userId}/todos`} className="nav-btn">Todos</Link>
          <Link to={`/users/${userId}/posts`} className="nav-btn">Posts</Link>
          <Link to={`/users/${userId}/albums`} className="nav-btn">Albums</Link>
          <button className="nav-btn logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#818cf8' }}>
          Your Personal Dashboard
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Welcome to your central hub. From here you can manage your tasks, share your thoughts through posts, and organize your photo albums. 
          Use the navigation bar above to explore the different sections.
        </p>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content glass-panel animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowInfo(false)}>&times;</button>
            <h2 style={{ color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              Personal Information
            </h2>
            <div className="info-grid">
              <div className="info-label">Name:</div>
              <div>{user.name}</div>
              <div className="info-label">Username:</div>
              <div>{user.username}</div>
              <div className="info-label">Email:</div>
              <div>{user.email}</div>
              <div className="info-label">Phone:</div>
              <div>{user.phone || 'N/A'}</div>
              <div className="info-label">Website:</div>
              <div>{user.website}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}