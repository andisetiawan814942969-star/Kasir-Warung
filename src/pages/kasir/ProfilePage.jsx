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
    password: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const canEdit = user?.role === 'admin' || user?.canEditProfile;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (form.name) formData.append('name', form.name);
      if (form.email) formData.append('email', form.email);
      if (form.password) formData.append('password', form.password);
      if (form.image) formData.append('image', form.image);

      const res = await authAPI.updateProfile(formData);
      updateUser(res.data);
      toast.success('Profil berhasil diupdate');
      setForm(prev => ({ ...prev, password: '', image: null }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate profil');
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
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)',
              margin: '0 auto 16px',
              overflow: 'hidden'
            }}>
              {user?.image ? (
                <img src={user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
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
                disabled={!canEdit}
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
                disabled={!canEdit}
                id="profile-email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password Baru (Opsional)</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={!canEdit}
                placeholder="Kosongkan jika tidak diubah"
                id="profile-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Foto Profil (Opsional)</label>
              <input
                type="file"
                className="form-input"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setForm({ ...form, image: file });
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
                disabled={!canEdit}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginTop: 8, border: '1px solid var(--border-color)' }} />
              )}
            </div>

            {!canEdit ? (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem' }}>
                ℹ️ Anda tidak dapat mengubah data profil. Hubungi Administrator untuk melakukan perubahan data.
              </div>
            ) : (
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
