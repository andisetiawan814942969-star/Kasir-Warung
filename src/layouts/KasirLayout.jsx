import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineShoppingCart,
  HiOutlineComputerDesktop,
  HiOutlineDocumentText,
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineSun,
  HiOutlineMoon
} from 'react-icons/hi2';
import { getGreeting, getTodayDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

const KasirLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Menu', type: 'label' },
    { path: '/kasir', icon: <HiOutlineComputerDesktop />, label: 'Kasir (POS)', end: true },
    { path: '/kasir/history', icon: <HiOutlineDocumentText />, label: 'Riwayat Transaksi' },
    { label: 'Akun', type: 'label' },
    { path: '/kasir/profile', icon: <HiOutlineUserCircle />, label: 'Profil Saya' },
  ];

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <HiOutlineShoppingCart />
          </div>
          <div className="sidebar-brand">
            <h2>Warung Sembako</h2>
            <p>Dashboard Kasir</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => 
            item.type === 'label' ? (
              <div key={idx} className="sidebar-nav-label">{item.label}</div>
            ) : (
              <NavLink
                key={idx}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'K'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="sidebar-logout" onClick={handleLogout} title="Logout">
              <HiOutlineArrowRightOnRectangle size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="navbar">
          <div className="navbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <HiOutlineBars3 size={20} />
            </button>
            <div className="greeting">
              {getGreeting()}, <strong>{user?.name}</strong>
            </div>
          </div>
          <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn-icon" 
              onClick={toggleTheme} 
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
            </button>
            <div className="navbar-date">{getTodayDate()}</div>
          </div>
        </div>

        <div className="animate-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default KasirLayout;
