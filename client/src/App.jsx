import { BrowserRouter, Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './App.css';
import AppShell from './components/AppShell.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GuestLanding from './pages/Landingpage.jsx';
import Hukamnama from './pages/Hukamnama.jsx';
import Notes from './pages/Notes.jsx';
import Sessions from './pages/Sessions.jsx';
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';

function LoadingScreen() {
  return <main className="app-loading" role="status">Loading…</main>;
}

function HomeLayout() {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingScreen />;
  return user ? <AppShell /> : <GuestLanding />;
}

function ProtectedShell() {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingScreen />;
  return user ? <AppShell /> : <Navigate to="/login" replace />;
}

function HukamnamaLayout() {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingScreen />;
  if (user) return <AppShell />;
  return (
    <main className="guest-reading">
      <header className="guest-reading-header">
        <Link to="/" className="guest-reading-brand">Saadh Sangat</Link>
        <Link to="/login" className="guest-reading-signin">Sign in</Link>
      </header>
      <Outlet />
    </main>
  );
}

function AdminLayout() {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return user.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

function AuthRoute({ mode }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingScreen />;
  return user ? <Navigate to="/" replace /> : <AuthPage mode={mode} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/login" element={<AuthRoute mode="login" />} />
      <Route path="/signup" element={<AuthRoute mode="signup" />} />
      <Route path="/hukamnama" element={<HukamnamaLayout />}>
        <Route index element={<Hukamnama />} />
      </Route>
      <Route element={<ProtectedShell />}>
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/settings" element={<Settings />} />
        <Route element={<AdminLayout />}><Route path="/admin" element={<Admin />} /></Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
