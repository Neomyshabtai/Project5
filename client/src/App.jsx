import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Todos from './components/Todos';
import Posts from './components/Posts';
import Albums from './components/Albums';
import Photos from './components/Photos';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes - Only accessible to the logged-in user matching the userId */}
      <Route element={<ProtectedRoute />}>
        <Route path="/users/:userId/home" element={<Home />} />

        {/* Todos & Posts Routing (Part D & E) */}
        <Route path="/users/:userId/todos" element={<Todos />} />
        <Route path="/users/:userId/posts" element={<Posts />} />

        {/* Albums Routing (Part F) */}
        <Route path="/users/:userId/albums" element={<Albums />} />
        <Route path="/users/:userId/albums/:albumId/photos" element={<Photos />} />
      </Route>
    </Routes>
  );
}

export default App;