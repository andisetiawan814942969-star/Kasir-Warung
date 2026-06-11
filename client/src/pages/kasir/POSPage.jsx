import { useState, useEffect } from 'react';
import { productAPI, categoryAPI, transactionAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { 
  HiOutlineShoppingCart, HiOutlineMagnifyingGlass, HiOutlinePlus, 
  HiOutlineMinus, HiOutlineTrash, HiOutlineXMark, HiOutlineBanknotes,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    fetchData();
  }, [search, filterCategory]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({ search, category: filterCategory, limit: 200 }),
        categoryAPI.getAll()
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Stok habis!');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.error(`Stok ${product.name} hanya ${product.stock}`);
          return prev;
        }
        return prev.map(item => 
          item.product._id === product._id 
            ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.product.price }
            : item
        );
      }
      return [...prev, { product, qty: 1, subtotal: product.price }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product._id === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            toast.error(`Stok maksimal ${item.product.stock}`);
            return item;
          }
          return { ...item, qty: newQty, subtotal: newQty * item.product.price };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const change = paymentAmount ? parseFloat(paymentAmount) - totalAmount : 0;

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) < totalAmount) {
      toast.error('Pembayaran kurang!');
      return;
    }

    setProcessing(true);
    try {
      const res = await transactionAPI.create({
        items: cart.map(item => ({
          product: item.product._id,
          qty: item.qty
        })),
        paymentAmount: parseFloat(paymentAmount)
      });

      setLastTransaction(res.data);
      setCart([]);
      setPaymentAmount('');
      setShowPayment(false);
      fetchData(); // Refresh stock
      toast.success('Transaksi berhasil!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaksi gagal');
    } finally {
      setProcessing(false);
    }
  };

  const quickCashAmounts = [
    totalAmount,
    Math.ceil(totalAmount / 5000) * 5000,
    Math.ceil(totalAmount / 10000) * 10000,
    Math.ceil(totalAmount / 20000) * 20000,
    50000,
    100000,
  ].filter((v, i, a) => v > 0 && a.indexOf(v) === i).slice(0, 6);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kasir (POS)</h1>
          <p className="page-subtitle">Buat transaksi baru</p>
        </div>
      </div>

      <div className="pos-container">
        {/* Products Panel */}
        <div className="pos-products">
          <div className="toolbar">
            <div className="search-bar" style={{ flex: 1 }}>
              <HiOutlineMagnifyingGlass className="search-icon" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="pos-search"
              />
            </div>
            <select 
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ minWidth: 150 }}
              id="pos-filter"
            >
              <option value="">Semua</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="pos-products-grid">
            {products.map(product => (
              <div
                key={product._id}
                className={`pos-product-card ${product.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => addToCart(product)}
              >
                <div className="product-name">{product.name}</div>
                <div className="product-price">{formatCurrency(product.price)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="product-stock">
                    Stok: {product.stock} {product.unit}
                  </span>
                  <span className={`badge ${product.stock <= 0 ? 'badge-danger' : product.stock <= 5 ? 'badge-warning' : 'badge-success'}`}
                    style={{ fontSize: '0.65rem' }}>
                    {product.stock <= 0 ? 'Habis' : product.stock <= 5 ? 'Sedikit' : 'Ready'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="cart-panel">
          <div className="cart-header">
            <h3>
              <HiOutlineShoppingCart /> Keranjang
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </h3>
            {cart.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--danger)' }}>
                Hapus Semua
              </button>
            )}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <HiOutlineShoppingCart className="icon" />
                <h3>Keranjang kosong</h3>
                <p style={{ fontSize: '0.8rem' }}>Klik produk untuk menambahkan</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product._id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-price">{formatCurrency(item.product.price)} / {item.product.unit}</div>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQty(item.product._id, -1)}><HiOutlineMinus size={14} /></button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.product._id, 1)}><HiOutlinePlus size={14} /></button>
                  </div>
                  <div className="cart-item-subtotal">{formatCurrency(item.subtotal)}</div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.product._id)}>
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">{formatCurrency(totalAmount)}</span>
            </div>
            <button 
              className="btn btn-success btn-lg"
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
              id="pay-btn"
            >
              <HiOutlineBanknotes /> Bayar
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay payment-modal" onClick={() => setShowPayment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💰 Pembayaran</h3>
              <button className="modal-close" onClick={() => setShowPayment(false)}>
                <HiOutlineXMark />
              </button>
            </div>

            <div className="payment-summary">
              {cart.map(item => (
                <div key={item.product._id} className="payment-row">
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {item.product.name} x{item.qty}
                  </span>
                  <span style={{ fontSize: '0.85rem' }}>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <div className="payment-row total">
                <span>Total</span>
                <span className="value">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Uang Dibayar</label>
              <input
                type="number"
                className="form-input"
                placeholder="Masukkan jumlah uang..."
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                autoFocus
                style={{ fontSize: '1.2rem', fontWeight: 700, padding: '14px' }}
                id="payment-input"
              />
            </div>

            <div className="quick-cash">
              {quickCashAmounts.map(amount => (
                <button 
                  key={amount}
                  onClick={() => setPaymentAmount(amount.toString())}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            {paymentAmount && (
              <div className="payment-summary" style={{ marginTop: 16 }}>
                <div className={`payment-row change ${change < 0 ? 'negative' : ''}`}>
                  <span style={{ fontWeight: 600 }}>Kembalian</span>
                  <span className="value" style={{ fontSize: '1.2rem' }}>
                    {change < 0 ? `(Kurang ${formatCurrency(Math.abs(change))})` : formatCurrency(change)}
                  </span>
                </div>
              </div>
            )}

            <button
              className="btn btn-success btn-lg"
              style={{ width: '100%', marginTop: 16 }}
              disabled={!paymentAmount || parseFloat(paymentAmount) < totalAmount || processing}
              onClick={handlePayment}
              id="confirm-payment"
            >
              {processing ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <HiOutlineCheckCircle /> Konfirmasi Pembayaran
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {lastTransaction && (
        <div className="modal-overlay" onClick={() => setLastTransaction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Transaksi Berhasil!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              {lastTransaction.invoiceNumber}
            </p>
            
            <div className="payment-summary">
              <div className="payment-row">
                <span style={{ color: 'var(--text-muted)' }}>Total</span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(lastTransaction.totalAmount)}</span>
              </div>
              <div className="payment-row">
                <span style={{ color: 'var(--text-muted)' }}>Bayar</span>
                <span>{formatCurrency(lastTransaction.paymentAmount)}</span>
              </div>
              <div className="payment-row change">
                <span style={{ color: 'var(--text-muted)' }}>Kembalian</span>
                <span className="value" style={{ fontSize: '1.3rem' }}>{formatCurrency(lastTransaction.change)}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => setLastTransaction(null)}
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;
