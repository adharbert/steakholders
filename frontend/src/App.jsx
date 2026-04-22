import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Plus, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ArchiveScreen from './screens/ArchiveScreen';
import ReviewScreen from './screens/ReviewScreen';
import BillScreen from './screens/BillScreen';
import CreateMeatupScreen from './screens/CreateMeatupScreen';
import './styles/global.css';

function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tab = pathname.startsWith('/archive') ? 'archive'
            : pathname.startsWith('/review')  ? 'review'
            : pathname.startsWith('/bill')    ? 'bill'
            : 'home';

  return (
    <nav className="nav-bar">
      <button className={`nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => navigate('/')}>
        <Home size={20} />
        <span className="nav-label">Home</span>
      </button>
      <button className={`nav-item ${tab === 'archive' ? 'active' : ''}`} onClick={() => navigate('/archive')}>
        <BookOpen size={20} />
        <span className="nav-label">Archive</span>
      </button>
      <button className={`nav-item ${tab === 'review' ? 'active' : ''}`} onClick={() => navigate('/review')}>
        <Plus size={20} />
        <span className="nav-label">Review</span>
      </button>
      <button className={`nav-item ${tab === 'bill' ? 'active' : ''}`} onClick={() => navigate('/bill')}>
        <Users size={20} />
        <span className="nav-label">Bill</span>
      </button>
    </nav>
  );
}

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="grain" />
      <div className="screen-content">{children}</div>
      <NavBar />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/" element={<ProtectedRoute><AppShell><HomeScreen /></AppShell></ProtectedRoute>} />
      <Route path="/archive"     element={<ProtectedRoute><AppShell><ArchiveScreen /></AppShell></ProtectedRoute>} />
      <Route path="/archive/:id" element={<ProtectedRoute><AppShell><ArchiveScreen /></AppShell></ProtectedRoute>} />
      <Route path="/review"      element={<ProtectedRoute><AppShell><ReviewScreen /></AppShell></ProtectedRoute>} />
      <Route path="/review/:id"  element={<ProtectedRoute><AppShell><ReviewScreen /></AppShell></ProtectedRoute>} />
      <Route path="/bill"        element={<ProtectedRoute><AppShell><BillScreen /></AppShell></ProtectedRoute>} />
      <Route path="/meatups/new" element={<ProtectedRoute><AppShell><CreateMeatupScreen /></AppShell></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
