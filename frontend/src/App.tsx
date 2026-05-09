import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Discovery from './pages/Discovery';
import Portfolio from './pages/Portfolio';
import Verification from './pages/Verification';
import AdminPanel from './pages/AdminPanel';
import OrgDashboard from './pages/OrgDashboard';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children, roles }: { children: JSX.Element, roles?: string[] }) => {
  const { token, user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!token) return <Navigate to="/login" />;

  if (roles && user && !roles.includes(user.role.toLowerCase())) {
    if (user.role === 'admin') return <Navigate to="/admin-panel" />;
    if (user.role === 'organization') return <Navigate to="/org-dashboard" />;
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  if (role === 'admin') return <Navigate to="/admin-panel" />;
  if (role === 'organization') return <Navigate to="/org-dashboard" />;
  return <Discovery />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Main Entry */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />

            {/* Volunteer Routes */}
            <Route 
              path="/portfolio" 
              element={
                <PrivateRoute roles={['volunteer']}>
                  <Portfolio />
                </PrivateRoute>
              } 
            />
            
            {/* Organization Routes */}
            <Route 
              path="/org-dashboard" 
              element={
                <PrivateRoute roles={['organization']}>
                  <OrgDashboard />
                </PrivateRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin-panel" 
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminPanel />
                </PrivateRoute>
              } 
            />

            {/* Shared Routes */}
            <Route 
              path="/verification" 
              element={
                <PrivateRoute>
                  <Verification />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
