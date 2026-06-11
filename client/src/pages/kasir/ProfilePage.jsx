import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { HiOutlineUserCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      
      const res = await authAPI.updateProfile(data);
      updateUser(res.data);
      setForm(prev => ({ ...prev, password: '' }));
      toast.success('Profil berhasil diupdate');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-subtitle">Kelola informasi akun Anda</p>
        </div>
      </div>

      <div style={{ maxWidth: 500 }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white',
              margin: '0 auto 16px',
              boxShadow: '0 4px 20px var(--primary-glow)'
            }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
            <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-success'}`} style={{ marginTop: 8 }}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 20 }}>
            <HiOutlineUserCircle style={{ marginRight: 8 }} />
            Edit Profil
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                id="profile-name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                id="profile-email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password Baru (kosongkan jika tidak diubah)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan password baru..."
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                id="profile-password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-profile-btn">
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
