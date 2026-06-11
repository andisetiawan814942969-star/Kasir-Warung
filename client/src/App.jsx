import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminProducts from './pages/admin/ProductsPage';
import AdminCategories from './pages/admin/CategoriesPage';
import AdminUsers from './pages/admin/UsersPage';
import AdminTransactions from './pages/admin/TransactionsPage';

// Kasir
import KasirLayout from './layouts/KasirLayout';
import KasirPOS from './pages/kasir/POSPage';
import KasirHistory from './pages/kasir/HistoryPage';
import KasirProfile from './pages/kasir/ProfilePage';

// Shared POS for admin
import POSPage from './pages/kasir/POSPage';

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/kasir'} replace />;
  }

  return children;
};

// Redirect based on role
const RoleRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/kasir'} replace />;
};

// Login Guard
const LoginGuard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/kasir'} replace />;
  }

  return <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.9rem'
            },
            success: {
              iconTheme: { primary: 'var(--success)', secondary: 'white' }
            },
            error: {
              iconTheme: { primary: 'var(--danger)', secondary: 'white' }
            }
          }}
        />
        
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginGuard />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="pos" element={<POSPage />} />
          </Route>

          {/* Kasir Routes */}
          <Route path="/kasir" element={
            <ProtectedRoute allowedRoles={['kasir']}>
              <KasirLayout />
            </ProtectedRoute>
          }>
            <Route index element={<KasirPOS />} />
            <Route path="history" element={<KasirHistory />} />
            <Route path="profile" element={<KasirProfile />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
