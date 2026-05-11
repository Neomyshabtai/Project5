import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Step 1 data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState('');

  // Step 2 data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordVerify) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }

    try {
      // Check if username already exists
      const response = await api.get(`/users?username=${username}`);
      if (response.data.length > 0) {
        setError('שם המשתמש כבר קיים במערכת.');
        return;
      }
      
      // Username is free, proceed to step 2
      setStep(2);
    } catch (err) {
      console.error('Registration error:', err);
      setError('אירעה שגיאה בבדיקת שם המשתמש.');
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Create new user object. Note: password is saved as 'website' as per instructions
      const newUser = {
        name,
        username,
        email,
        website: password,
        address: {},
        company: {}
      };

      const response = await api.post('/users', newUser);
      const createdUser = response.data;

      // Save to localStorage and redirect
      localStorage.setItem('currentUser', JSON.stringify(createdUser));
      navigate(`/users/${createdUser.id}/home`);
    } catch (err) {
      console.error('Final registration error:', err);
      setError('אירעה שגיאה ביצירת המשתמש.');
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Step 1: Account Details' : 'Step 2: Personal Information'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit}>
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
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="passwordVerify">Verify Password</label>
              <input
                type="password"
                id="passwordVerify"
                className="form-input"
                value={passwordVerify}
                onChange={(e) => setPasswordVerify(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="animate-fade-in">
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button type="submit" className="btn">
                Complete Setup
              </button>
            </div>
          </form>
        )}

        <p style={{ marginTop: '2rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
