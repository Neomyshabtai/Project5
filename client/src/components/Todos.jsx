import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Todos() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- States for Search, Filter, and Sort ---
  const [searchCriterion, setSearchCriterion] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('id');

  // --- States for CRUD Operations ---
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // שומר הנתיב: בדיקה אם יש משתמש מחובר
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // 1. Fetch Todos (Read) + Route Guard
  useEffect(() => {
    // מוקש "חזור אחורה" מטופל כאן
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

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
  }, [userId, navigate]);

  // 2. Add Todo (Create)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const response = await api.post('/todos', {
        userId: Number(userId),
        title: newTodoTitle,
        completed: false
      });
      // עדכון State מקומי למניעת Fetch כפול
      setTodos([...todos, response.data]); 
      setNewTodoTitle('');
    } catch (error) {
      console.error("שגיאה בהוספת מטלה:", error);
    }
  };

  // 3. Toggle Status (Update Status)
  const handleToggleCompleted = async (todoId, currentStatus) => {
    try {
      const response = await api.patch(`/todos/${todoId}`, {
        completed: !currentStatus
      });
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, completed: response.data.completed } : todo
      ));
    } catch (error) {
      console.error("שגיאה בעדכון הסטטוס:", error);
    }
  };

  // 4. Update Content (Update Title)
  const handleSaveEdit = async (todoId) => {
    if (!editTitle.trim()) return;
    try {
      const response = await api.patch(`/todos/${todoId}`, {
        title: editTitle
      });
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, title: response.data.title } : todo
      ));
      setEditingId(null);
    } catch (error) {
      console.error("שגיאה בעדכון התוכן:", error);
    }
  };

  // 5. Delete Todo (Delete)
  const handleDeleteTodo = async (todoId) => {
    if (window.confirm("למחוק את המטלה?")) {
      try {
        await api.delete(`/todos/${todoId}`);
        setTodos(todos.filter(todo => todo.id !== todoId));
      } catch (error) {
        console.error("שגיאה במחיקת מטלה:", error);
      }
    }
  };

  // --- Logic for Filtering and Sorting ---
  let processedTodos = [...todos];

  if (searchQuery) {
    processedTodos = processedTodos.filter(todo => {
      if (searchCriterion === 'id') {
        return todo.id.toString().includes(searchQuery);
      } else {
        return todo.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
    });
  }

  if (filterStatus === 'completed') {
    processedTodos = processedTodos.filter(todo => todo.completed === true);
  } else if (filterStatus === 'uncompleted') {
    processedTodos = processedTodos.filter(todo => todo.completed === false);
  }

  processedTodos.sort((a, b) => {
    if (sortBy === 'id') return a.id - b.id;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'completed') return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1; 
    if (sortBy === 'random') return 0.5 - Math.random();
    return 0;
  });

  return (
    <div className="container glass-panel animate-fade-in" style={{ padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Todos (User ID: {userId})</h1>
      
      <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '15px', marginBottom: '30px', width: '100%' }}>
        <input 
          type="text" 
          placeholder="Type a new task here..." 
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="form-input"
          style={{ flex: '1', padding: '15px', fontSize: '1.2rem', marginBottom: 0, borderRadius: '8px' }}
        />
        <button type="submit" className="btn" style={{ flex: '0 0 auto', width: 'auto', padding: '0 20px', fontSize: '1.1rem', margin: 0, borderRadius: '8px' }}>
          Add Todo
        </button>
      </form>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', alignItems: 'center' }}>
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
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-input" style={{ width: 'auto', marginBottom: 0 }}>
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="uncompleted">Uncompleted</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input" style={{ width: 'auto', marginBottom: 0 }}>
          <option value="id">Sort by ID</option>
          <option value="title">Sort by Title</option>
          <option value="completed">Sort by Status</option>
          <option value="random">Random Order</option>
        </select>
      </div>

      {loading ? (
        <p>טוען נתונים מהשרת...</p>
      ) : processedTodos.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {processedTodos.map(todo => (
            <li key={todo.id} style={{ marginBottom: '10px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  onChange={() => handleToggleCompleted(todo.id, todo.completed)}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }} 
                />
                
                {editingId === todo.id ? (
                  <div style={{ display: 'flex', marginLeft: '15px', flex: 1, gap: '8px', alignItems: 'center', width: '100%' }}>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      className="form-input"
                      style={{ marginBottom: 0, flex: '1 1 100%', width: '100%', padding: '8px 12px', borderRadius: '4px' }}
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(todo.id)} className="btn" style={{ flex: '0 0 auto', width: 'auto', padding: '6px 12px', fontSize: '0.9rem', margin: 0 }}>Save</button>
                    <button onClick={() => setEditingId(null)} className="btn" style={{ flex: '0 0 auto', width: 'auto', padding: '6px 12px', fontSize: '0.9rem', margin: 0, background: '#64748b' }}>Cancel</button>
                  </div>
                ) : (
                  <span style={{ marginLeft: '15px', fontSize: '1.1rem', textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1 }}>
                    <span style={{ color: '#94a3b8', marginRight: '8px' }}>#{todo.id}</span> 
                    {todo.title}
                  </span>
                )}
              </div>

              {editingId !== todo.id && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setEditingId(todo.id); setEditTitle(todo.title); }} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteTodo(todo.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>לא נמצאו מטלות.</p>
      )}
      
      <br />
      <Link to={`/users/${userId}/home`} className="btn" style={{ display: 'inline-block', marginTop: '20px' }}>Back to Home</Link>
    </div>
  );
}

export default Todos;