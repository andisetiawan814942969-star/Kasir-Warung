import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { 
  HiOutlineCube, HiOutlinePlus, HiOutlinePencil, 
  HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineXMark 
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', unit: 'pcs', image: null });
  const [imagePreview, setImagePreview] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search, filterCategory]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({ search, category: filterCategory, limit: 100 }),
        categoryAPI.getAll()
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        category: product.category?._id || '',
        price: product.price,
        stock: product.stock,
        unit: product.unit,
        image: null
      });
      setImagePreview(product.image || '');
    } else {
      setEditingProduct(null);
      setForm({ name: '', category: '', price: '', stock: '', unit: 'pcs', image: null });
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
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('unit', form.unit);
      if (form.image) {
        formData.append('image', form.image);
      }

      if (editingProduct) {
        await productAPI.update(editingProduct._id, formData);
        toast.success('Produk berhasil diupdate');
      } else {
        await productAPI.create(formData);
        toast.success('Produk berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await productAPI.delete(confirmDelete._id);
      toast.success('Produk berhasil dihapus');
      setConfirmDelete(null);
      fetchData();
    } catch (error) {
      toast.error('Gagal menghapus produk');
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
          <h1 className="page-title">Manajemen Produk</h1>
          <p className="page-subtitle">Kelola semua produk warung</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} id="add-product-btn">
          <HiOutlinePlus /> Tambah Produk
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-products"
          />
        </div>
        <select 
          className="form-select" 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ minWidth: 180 }}
          id="filter-category"
        >
          <option value="">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Satuan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <HiOutlineCube className="icon" />
                    <h3>Belum ada produk</h3>
                    <p>Tambahkan produk pertama Anda</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {product.image ? (
                        <img src={product.image} alt={product.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          <HiOutlineCube size={20} />
                        </div>
                      )}
                      <span style={{ fontWeight: 600 }}>{product.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">
                      {product.category?.name || '-'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</td>
                  <td>
                    <span className={`badge ${product.stock <= 5 ? 'badge-danger' : product.stock <= 20 ? 'badge-warning' : 'badge-success'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.unit}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn btn-ghost btn-sm btn-icon" 
                        onClick={() => openModal(product)}
                        title="Edit"
                      >
                        <HiOutlinePencil />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm btn-icon" 
                        onClick={() => setConfirmDelete(product)}
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

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <HiOutlineXMark />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Produk</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masukkan nama produk"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  id="product-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  id="product-category"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Gambar Produk (Opsional)</label>
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
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', marginTop: 8, borderRadius: 8, border: '1px solid var(--border-color)' }} />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Harga (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                    id="product-price"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stok</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                    min="0"
                    id="product-stock"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Satuan</label>
                <select
                  className="form-select"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  id="product-unit"
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                  <option value="botol">botol</option>
                  <option value="sachet">sachet</option>
                  <option value="karung">karung</option>
                  <option value="pouch">pouch</option>
                  <option value="kotak">kotak</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" id="save-product-btn" disabled={submitting}>
                  {submitting ? 'Memproses...' : (editingProduct ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="icon">⚠️</div>
            <h3>Hapus Produk?</h3>
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

export default ProductsPage;
