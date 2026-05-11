import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Fetch users to verify credentials
      const response = await api.get('/users');
      const users = response.data;

      // According to assignment: username = username, password = website
      const user = users.find(u => u.username === username);

      if (user && user.website === password) {
        // Successful login
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate(`/users/${user.id}/home`);
      } else {
        // Failed login
        setError('שם המשתמש או הסיסמה אינם נכונים.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('אירעה שגיאה בתקשורת מול השרת.');
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="password">Password (Website)</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '2rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
