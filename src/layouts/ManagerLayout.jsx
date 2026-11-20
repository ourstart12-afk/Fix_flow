import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Wrench, LayoutDashboard, ClipboardList, Settings, User, LogOut } from 'lucide-react';
import { apiRequest } from '../lib/api.js';

function ManagerLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    apiRequest('/api/auth/me')
      .then((data) => {
        if (!isMounted) return;
        if (!data?.user || data.user.role !== 'manager') {
          // If not authenticated as manager, take directly to the manager sign in portal
          navigate('/manager/login', { replace: true });
          return;
        }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        navigate('/manager/login', { replace: true });
      });

    return () => { isMounted = false; };
  }, [navigate]);

  async function handleLogout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    navigate('/manager/login', { replace: true });
  }

  if (loading) {
    return (
      <div className="app-shell" style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#f8f9fd' }}>
        <p style={{ color: '#7d899b', fontSize: '14px', fontWeight: '500' }}>Loading manager portal…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/manager/dashboard">
          <span className="brand__mark"><Wrench size={18} strokeWidth={2.5} /></span>
          <span>fix<span>flow</span> <small style={{ fontSize: '10px', background: '#3978e8', color: '#fff', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>Manager</small></span>
        </Link>

        <nav className="sidebar-nav" aria-label="Manager navigation">
          <Link className={`sidebar-link${location.pathname === '/manager/dashboard' ? ' is-active' : ''}`} to="/manager/dashboard">
            <LayoutDashboard size={18} /> Dashboard & Analytics
          </Link>
          <Link className={`sidebar-link${location.pathname.startsWith('/manager/requests') ? ' is-active' : ''}`} to="/manager/requests">
            <ClipboardList size={18} /> Manage Requests
          </Link>
          <Link className={`sidebar-link${location.pathname === '/manager/profile' ? ' is-active' : ''}`} to="/manager/profile">
            <User size={18} /> Manager Profile
          </Link>
          <Link className={`sidebar-link${location.pathname === '/manager/settings' ? ' is-active' : ''}`} to="/manager/settings">
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3978e8', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '700', fontSize: '11px' }}>
              {user?.name ? user.name[0].toUpperCase() : 'M'}
            </div>
            <div className="sidebar-user__info">
              <strong>{user?.name || 'Facility Manager'}</strong>
              <small>{user?.email || 'manager@fixflow.com'}</small>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sign out" type="button">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

export default ManagerLayout;