import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { HiOutlineUsers, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'kasir', image: null, canEditProfile: false });
  const [imagePreview, setImagePreview] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (error) {
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({ name: user.name, email: user.email, password: '', role: user.role, image: null, canEditProfile: user.canEditProfile || false });
      setImagePreview(user.image || '');
    } else {
      setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'kasir', image: null, canEditProfile: false });
      setImagePreview('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (form.password) formData.append('password', form.password);
      formData.append('role', form.role);
      formData.append('canEditProfile', form.canEditProfile);
      if (form.image) formData.append('image', form.image);

      if (editingUser) {
        await userAPI.update(editingUser._id, formData);
        toast.success('User berhasil diupdate');
      } else {
        await userAPI.create(formData);
        toast.success('User berhasil ditambahkan');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await userAPI.delete(confirmDelete._id);
      toast.success('User berhasil dihapus');
      setConfirmDelete(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen User</h1>
          <p className="page-subtitle">Kelola akun admin dan kasir</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} id="add-user-btn">
          <HiOutlinePlus /> Tambah User
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <HiOutlineUsers className="icon" />
                    <h3>Belum ada user</h3>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: user.role === 'admin' 
                          ? 'linear-gradient(135deg, var(--primary), var(--secondary))' 
                          : 'linear-gradient(135deg, var(--success), #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.75rem', color: 'white', flexShrink: 0
                      }}>
                        {user.image ? (
                          <img src={user.image} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt=""/>
                        ) : (
                          user.name?.charAt(0)?.toUpperCase()
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}`} style={{ width: 'fit-content' }}>
                        {user.role}
                      </span>
                      {user.role === 'kasir' && user.canEditProfile && (
                        <span className="badge" style={{ width: 'fit-content', fontSize: '0.65rem', background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
                          Bisa Edit Profil
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openModal(user)} title="Edit">
                        <HiOutlinePencil />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm btn-icon" 
                        onClick={() => setConfirmDelete(user)} 
                        title="Hapus"
                        style={{ color: 'var(--danger)' }}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><HiOutlineXMark /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input type="text" className="form-input" placeholder="Masukkan nama"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="user-name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="Masukkan email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required id="user-email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password {editingUser && '(kosongkan jika tidak diubah)'}</label>
                <input type="password" className="form-input" placeholder="Masukkan password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser} minLength={6} id="user-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} id="user-role">
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === 'kasir' && (
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <input 
                    type="checkbox" 
                    id="can-edit-profile" 
                    checked={form.canEditProfile} 
                    onChange={(e) => setForm({ ...form, canEditProfile: e.target.checked })} 
                    style={{ width: 18, height: 18 }}
                  />
                  <label htmlFor="can-edit-profile" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Izinkan kasir mengedit profilnya sendiri
                  </label>
                </div>
              )}
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
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginTop: 8, border: '1px solid var(--border-color)' }} />
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Batal</button>
                <button type="submit" className="btn btn-primary" id="save-user-btn" disabled={submitting}>
                  {submitting ? 'Memproses...' : (editingUser ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="icon">⚠️</div>
            <h3>Hapus User?</h3>
            <p>Anda yakin ingin menghapus <strong>{confirmDelete.name}</strong>?</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)} disabled={submitting}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
