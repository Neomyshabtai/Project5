import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

function Todos() {
  const { userId } = useParams();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- States for Search, Filter, and Sort ---
  const [searchCriterion, setSearchCriterion] = useState('title'); // 'id' or 'title'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'uncompleted'
  const [sortBy, setSortBy] = useState('id'); // 'id', 'title', 'completed', 'random'

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get(`/todos?userId=${userId}`);
        setTodos(response.data);
      } catch (error) {
        console.error("שגיאה במשיכת המטלות:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [userId]);

  // --- Logic for Filtering and Sorting ---
  
  // 1. מתחילים מהרשימה המקורית
  let processedTodos = [...todos];

  // 2. חיפוש (לפי ID או כותרת)
  if (searchQuery) {
    processedTodos = processedTodos.filter(todo => {
      if (searchCriterion === 'id') {
        return todo.id.toString().includes(searchQuery);
      } else {
        return todo.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
    });
  }

  // 3. סינון לפי סטטוס ביצוע
  if (filterStatus === 'completed') {
    processedTodos = processedTodos.filter(todo => todo.completed === true);
  } else if (filterStatus === 'uncompleted') {
    processedTodos = processedTodos.filter(todo => todo.completed === false);
  }

  // 4. מיון
  processedTodos.sort((a, b) => {
    if (sortBy === 'id') {
      return a.id - b.id;
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'completed') {
      // ממיין כך שהושלמו יופיעו קודם, ואז אלו שלא הושלמו
      return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1; 
    } else if (sortBy === 'random') {
      return 0.5 - Math.random(); // מיון אקראי
    }
    return 0;
  });

  return (
    <div className="container glass-panel animate-fade-in" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Todos (User ID: {userId})</h1>
      
      {/* --- Toolbar: Search, Filter, Sort --- */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        flexWrap: 'wrap', 
        marginBottom: '20px', 
        background: 'rgba(255,255,255,0.1)', 
        padding: '15px', 
        borderRadius: '8px',
        alignItems: 'center'
      }}>
        
        {/* Search */}
        <div style={{ display: 'flex', gap: '5px', flex: '1 1 auto' }}>
          <select value={searchCriterion} onChange={(e) => setSearchCriterion(e.target.value)} className="form-input" style={{ width: 'auto', marginBottom: 0 }}>
            <option value="title">Search by Title</option>
            <option value="id">Search by ID</option>
          </select>
          <input 
            type="text" 
            placeholder="Type to search..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ marginBottom: 0 }}
          />
        </div>

        {/* Filter */}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-input" style={{ width: 'auto', marginBottom: 0 }}>
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="uncompleted">Uncompleted</option>
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input" style={{ width: 'auto', marginBottom: 0 }}>
          <option value="id">Sort by ID</option>
          <option value="title">Sort by Title</option>
          <option value="completed">Sort by Status</option>
          <option value="random">Random Order</option>
        </select>

      </div>

      {/* --- Task List --- */}
      {loading ? (
        <p>טוען נתונים מהשרת...</p>
      ) : processedTodos.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {processedTodos.map(todo => (
            <li key={todo.id} style={{ 
              marginBottom: '10px', 
              background: 'rgba(0,0,0,0.2)', 
              padding: '12px', 
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease-in-out'
            }}>
              <input type="checkbox" checked={todo.completed} readOnly style={{ transform: 'scale(1.2)' }} />
              <span style={{ marginLeft: '15px', fontSize: '1.1rem', textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1 }}>
                <span style={{ color: '#94a3b8', marginRight: '8px' }}>#{todo.id}</span> 
                {todo.title}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>לא נמצאו מטלות התואמות לחיפוש שלך.</p>
      )}
      
      <br />
      <Link to={`/users/${userId}/home`} className="btn" style={{ display: 'inline-block', marginTop: '20px' }}>Back to Home</Link>
    </div>
  );
}

export default Todos;