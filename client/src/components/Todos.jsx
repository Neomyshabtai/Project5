import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

function Todos() {
  const { userId } = useParams();
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

  // 1. Fetch Todos (Read)
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

  // 2. Add Todo (Create)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const response = await api.post('/todos', {
        userId: Number(userId), // שומרים את השיוך למשתמש
        title: newTodoTitle,
        completed: false
      });
      // מעדכנים את הרשימה המקומית בלי קריאת שרת נוספת!
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
      setEditingId(null); // יוצאים ממצב עריכה
    } catch (error) {
      console.error("שגיאה בעדכון התוכן:", error);
    }
  };

  // 5. Delete Todo (Delete)
  const handleDeleteTodo = async (todoId) => {
    try {
      await api.delete(`/todos/${todoId}`);
      setTodos(todos.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error("שגיאה במחיקת מטלה:", error);
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
      
      {/* --- Add New Todo Form --- */}
      <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="What needs to be done?" 
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          className="form-input"
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button type="submit" className="btn" style={{ margin: 0 }}>Add Todo</button>
      </form>

      {/* --- Toolbar: Search, Filter, Sort --- */}
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

      {/* --- Task List --- */}
      {loading ? (
        <p>טוען נתונים מהשרת...</p>
      ) : processedTodos.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {processedTodos.map(todo => (
            <li key={todo.id} style={{ marginBottom: '10px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease-in-out' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {/* Checkbox is now interactive */}
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  onChange={() => handleToggleCompleted(todo.id, todo.completed)}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }} 
                />
                
                {/* Editing Mode vs View Mode */}
                {editingId === todo.id ? (
                  <div style={{ display: 'flex', marginLeft: '15px', flex: 1, gap: '10px' }}>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      className="form-input"
                      style={{ marginBottom: 0, flex: 1, padding: '5px' }}
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(todo.id)} className="btn" style={{ padding: '5px 10px', fontSize: '0.9rem', margin: 0 }}>Save</button>
                    <button onClick={() => setEditingId(null)} className="btn" style={{ padding: '5px 10px', fontSize: '0.9rem', margin: 0, background: '#64748b' }}>Cancel</button>
                  </div>
                ) : (
                  <span style={{ marginLeft: '15px', fontSize: '1.1rem', textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1 }}>
                    <span style={{ color: '#94a3b8', marginRight: '8px' }}>#{todo.id}</span> 
                    {todo.title}
                  </span>
                )}
              </div>

              {/* Action Buttons (Edit & Delete) */}
              {editingId !== todo.id && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => { setEditingId(todo.id); setEditTitle(todo.title); }} 
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '1rem' }}>
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTodo(todo.id)} 
                    style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '1rem' }}>
                    Delete
                  </button>
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