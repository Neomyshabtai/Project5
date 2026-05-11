import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Todos from './components/Todos'; 
import Posts from './components/Posts'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/users/:userId/home" element={<Home />} />
      
      {/* הניתוב החדש והאמיתי לעמוד המטלות שיצרנו */}
      <Route path="/users/:userId/todos" element={<Todos />} />
      
      {/* Placeholders for future sections */}
     <Route path="/users/:userId/posts" element={<Posts />} />
      <Route path="/users/:userId/albums" element={<div className="container glass-panel animate-fade-in"><h1 style={{color:'white'}}>Albums Page (Coming Soon)</h1><br/><a href="javascript:history.back()" className="btn">Back</a></div>} />
    </Routes>
  );
}

export default App;