import { NavLink, Outlet } from 'react-router-dom';
import brandIcon from '../assets/icon.png';
import { useApp } from '../context/AppContext.jsx';

export default function AppShell() {
  const { user, appError, clearAppError } = useApp();
  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/sessions', label: 'Find sangat' },
    { to: '/hukamnama', label: 'Hukamnama Sahib' },
    { to: '/notes', label: 'My reflections' },
    { to: '/settings', label: 'My account' },
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Manage programme' }] : []),
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand-lockup" aria-label="Saadh Sangat home">
          <span className="brand-mark"><img className="brand-image" src={brandIcon} alt="" /></span>
          <span className="brand-name">Saadh <span>Sangat</span></span>
        </NavLink>
        <nav className="side-nav" aria-label="Main navigation">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-profile">
          <div className="profile-copy"><strong>{user.name.trim().split(/\s+/)[0]}</strong></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="mobile-header">
          <NavLink to="/" className="brand-lockup" aria-label="Saadh Sangat home">
            <span className="brand-mark"><img className="brand-image" src={brandIcon} alt="" /></span>
            <span className="brand-name">Saadh <span>Sangat</span></span>
          </NavLink>
        </header>
        {appError && <div className="app-alert" role="alert"><span>{appError}</span><button type="button" onClick={clearAppError} aria-label="Dismiss message">Dismiss</button></div>}
        <Outlet />
        <footer className="page-footer"><span>Saadh Sangat</span></footer>
      </main>

      <nav className="mobile-nav" aria-label="Main navigation">
        {links.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}>
            <span>{label === 'My reflections' ? 'Reflections' : label === 'Find sangat' ? 'Sangat' : label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
