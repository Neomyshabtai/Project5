import { Navigate, Outlet, useParams } from 'react-router-dom';

export default function ProtectedRoute() {
  const { userId } = useParams();
  const storedUser = localStorage.getItem('currentUser');

  // 1. Check if user is logged in at all
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  const parsedUser = JSON.parse(storedUser);

  // 2. Check if the logged-in user is trying to access someone else's data
  if (parsedUser.id.toString() !== userId) {
    // Redirect them to their own home page
    return <Navigate to={`/users/${parsedUser.id}/home`} replace />;
  }

  // 3. If everything is fine, render the requested child route
  return <Outlet />;
}
