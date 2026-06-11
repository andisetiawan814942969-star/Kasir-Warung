import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineShoppingCart,
  HiOutlineHome, 
  HiOutlineCube, 
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineComputerDesktop,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3
} from 'react-icons/hi2';
import { getGreeting, getTodayDate } from '../utils/formatters';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Menu Utama', type: 'label' },
    { path: '/admin', icon: <HiOutlineHome />, label: 'Dashboard', end: true },
    { path: '/admin/pos', icon: <HiOutlineComputerDesktop />, label: 'Kasir (POS)' },
    { label: 'Manajemen', type: 'label' },
    { path: '/admin/products', icon: <HiOutlineCube />, label: 'Produk' },
    { path: '/admin/categories', icon: <HiOutlineTag />, label: 'Kategori' },
    { path: '/admin/users', icon: <HiOutlineUsers />, label: 'User' },
    { label: 'Laporan', type: 'label' },
    { path: '/admin/transactions', icon: <HiOutlineDocumentText />, label: 'Riwayat Transaksi' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <HiOutlineShoppingCart />
          </div>
          <div className="sidebar-brand">
            <h2>Warung Sembako</h2>
            <p>Admin Panel</p>
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
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
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

      {/* Main Content */}
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
          <div className="navbar-right">
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

export default AdminLayout;
