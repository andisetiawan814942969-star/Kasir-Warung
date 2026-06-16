import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { 
  HiOutlineBanknotes, 
  HiOutlineCube, 
  HiOutlineShoppingCart,
  HiOutlineExclamationTriangle,
  HiOutlineUsers,
  HiOutlineChartBar
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes, topRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getChart(),
        dashboardAPI.getTopProducts()
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
      setTopProducts(topRes.data);
    } catch (error) {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
          <p style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan penjualan dan statistik warung</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <HiOutlineBanknotes />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(stats?.todaySales || 0)}</h3>
            <p>Penjualan Hari Ini</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <HiOutlineShoppingCart />
          </div>
          <div className="stat-info">
            <h3>{formatNumber(stats?.todayCount || 0)}</h3>
            <p>Transaksi Hari Ini</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <HiOutlineCube />
          </div>
          <div className="stat-info">
            <h3>{formatNumber(stats?.totalProducts || 0)}</h3>
            <p>Total Produk</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <HiOutlineExclamationTriangle />
          </div>
          <div className="stat-info">
            <h3>{formatNumber(stats?.lowStockProducts || 0)}</h3>
            <p>Stok Rendah</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <HiOutlineUsers />
          </div>
          <div className="stat-info">
            <h3>{formatNumber(stats?.totalUsers || 0)}</h3>
            <p>Total User</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Sales Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <HiOutlineChartBar style={{ marginRight: 8 }} />
              Penjualan 7 Hari Terakhir
            </h3>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  dataKey="day" 
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                />
                <YAxis 
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="sales" 
                  fill="var(--text-primary)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏆 Produk Terlaris</h3>
          </div>
          {topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topProducts.map((product, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--border-radius-sm)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: index === 0 ? 'var(--warning)' : 
                                index === 1 ? 'var(--secondary)' :
                                index === 2 ? 'var(--accent)' :
                                'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product._id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {product.totalQty} terjual
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success-light)' }}>
                    {formatCurrency(product.totalRevenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Belum ada data penjualan</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>Total Penjualan (Semua)</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatCurrency(stats?.totalSales || 0)}
            </h2>
          </div>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>Total Transaksi (Semua)</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatNumber(stats?.totalTransactions || 0)}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
