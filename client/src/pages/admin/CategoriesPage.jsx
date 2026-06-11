import { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import { HiOutlineTag, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (error) {
      toast.error('Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, { name });
        toast.success('Kategori berhasil diupdate');
      } else {
        await categoryAPI.create({ name });
        toast.success('Kategori berhasil ditambahkan');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async () => {
    try {
      await categoryAPI.delete(confirmDelete._id);
      toast.success('Kategori berhasil dihapus');
      setConfirmDelete(null);
      fetchCategories();
    } catch (error) {
      toast.error('Gagal menghapus kategori');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Kategori</h1>
          <p className="page-subtitle">Kelola kategori produk</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} id="add-category-btn">
          <HiOutlinePlus /> Tambah Kategori
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Kategori</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3">
                  <div className="empty-state">
                    <HiOutlineTag className="icon" />
                    <h3>Belum ada kategori</h3>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat._id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    <span className="badge badge-primary">{cat.name}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openModal(cat)} title="Edit">
                        <HiOutlinePencil />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm btn-icon" 
                        onClick={() => setConfirmDelete(cat)} 
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
              <h3 className="modal-title">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><HiOutlineXMark /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Kategori</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masukkan nama kategori"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  id="category-name"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" id="save-category-btn">
                  {editingCategory ? 'Update' : 'Simpan'}
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
            <h3>Hapus Kategori?</h3>
            <p>Anda yakin ingin menghapus <strong>{confirmDelete.name}</strong>?</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
