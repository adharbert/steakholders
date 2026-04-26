import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Plus, UtensilsCrossed, Users } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen            from './screens/LoginScreen';
import RegisterScreen         from './screens/RegisterScreen';
import LandingScreen          from './screens/LandingScreen';
import HomeScreen             from './screens/HomeScreen';
import ArchiveScreen          from './screens/ArchiveScreen';
import ReviewScreen           from './screens/ReviewScreen';
import BillScreen             from './screens/BillScreen';
import CreateMeatupScreen     from './screens/CreateMeatupScreen';
import RestaurantsScreen      from './screens/RestaurantsScreen';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';
import GroupScreen            from './screens/GroupScreen';
import CreateGroupScreen      from './screens/CreateGroupScreen';
import JoinGroupScreen        from './screens/JoinGroupScreen';
import './styles/global.css';

function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const tab = pathname.startsWith('/archive')     ? 'archive'
            : pathname.startsWith('/review')       ? 'review'
            : pathname.startsWith('/bill')          ? 'bill'
            : pathname.startsWith('/restaurants')   ? 'restaurants'
            : pathname.startsWith('/groups')        ? 'groups'
            : 'home';

  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <span className="nav-brand-mark">Steakholders</span>
      </div>
      <button className={`nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => navigate('/home')}>
        <Home size={20} />
        <span className="nav-label">Home</span>
      </button>
      <button className={`nav-item ${tab === 'restaurants' ? 'active' : ''}`} onClick={() => navigate('/restaurants')}>
        <UtensilsCrossed size={20} />
        <span className="nav-label">Eats</span>
      </button>
      <button className={`nav-item ${tab === 'groups' ? 'active' : ''}`} onClick={() => navigate('/groups/join')}>
        <Users size={20} />
        <span className="nav-label">Groups</span>
      </button>
      <button className={`nav-item ${tab === 'archive' ? 'active' : ''}`} onClick={() => navigate('/archive')}>
        <BookOpen size={20} />
        <span className="nav-label">Archive</span>
      </button>
      <button className={`nav-item ${tab === 'review' ? 'active' : ''}`} onClick={() => navigate('/review')}>
        <Plus size={20} />
        <span className="nav-label">Review</span>
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
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"                    element={<LandingScreen />} />
      <Route path="/login"               element={<LoginScreen />} />
      <Route path="/register"            element={<RegisterScreen />} />
      <Route path="/restaurants"         element={<AppShell><RestaurantsScreen /></AppShell>} />
      <Route path="/restaurants/:name"   element={<AppShell><RestaurantDetailScreen /></AppShell>} />

      {/* Member routes */}
      <Route path="/home"          element={<ProtectedRoute><AppShell><HomeScreen /></AppShell></ProtectedRoute>} />
      <Route path="/archive"       element={<ProtectedRoute><AppShell><ArchiveScreen /></AppShell></ProtectedRoute>} />
      <Route path="/archive/:id"   element={<ProtectedRoute><AppShell><ArchiveScreen /></AppShell></ProtectedRoute>} />
      <Route path="/review"        element={<ProtectedRoute><AppShell><ReviewScreen /></AppShell></ProtectedRoute>} />
      <Route path="/review/:id"    element={<ProtectedRoute><AppShell><ReviewScreen /></AppShell></ProtectedRoute>} />
      <Route path="/bill"          element={<ProtectedRoute><AppShell><BillScreen /></AppShell></ProtectedRoute>} />
      <Route path="/meatups/new"   element={<ProtectedRoute><AppShell><CreateMeatupScreen /></AppShell></ProtectedRoute>} />
      <Route path="/groups/new"    element={<ProtectedRoute><AppShell><CreateGroupScreen /></AppShell></ProtectedRoute>} />
      <Route path="/groups/join"   element={<ProtectedRoute><AppShell><JoinGroupScreen /></AppShell></ProtectedRoute>} />
      <Route path="/groups/:id"    element={<ProtectedRoute><AppShell><GroupScreen /></AppShell></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
