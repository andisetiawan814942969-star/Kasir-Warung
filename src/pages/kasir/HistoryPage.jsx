import { useState, useEffect } from 'react';
import { transactionAPI } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { HiOutlineDocumentText, HiOutlineEye, HiOutlineXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    try {
      const res = await transactionAPI.getAll({ page, limit: 20 });
      setTransactions(res.data.transactions);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Riwayat Transaksi Saya</h1>
          <p className="page-subtitle">Transaksi yang telah Anda lakukan</p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Tanggal</th>
              <th>Items</th>
              <th>Total</th>
              <th>Bayar</th>
              <th>Kembalian</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <HiOutlineDocumentText className="icon" />
                    <h3>Belum ada transaksi</h3>
                    <p>Mulai buat transaksi dari menu Kasir</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((trx) => (
                <tr key={trx._id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary-light)', fontSize: '0.85rem' }}>
                      {trx.invoiceNumber}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {formatDateTime(trx.createdAt)}
                  </td>
                  <td>
                    <span className="badge badge-info">{trx.items?.length} item</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(trx.totalAmount)}</td>
                  <td>{formatCurrency(trx.paymentAmount)}</td>
                  <td style={{ color: 'var(--success-light)' }}>{formatCurrency(trx.change)}</td>
                  <td>
                    <button 
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => setSelectedTransaction(trx)}
                      title="Detail"
                    >
                      <HiOutlineEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Sebelumnya
          </button>
          <span style={{ padding: '6px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
            {page} / {totalPages}
          </span>
          <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Selanjutnya
          </button>
        </div>
      )}

      {selectedTransaction && (
        <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h3 className="modal-title">Detail Transaksi</h3>
              <button className="modal-close" onClick={() => setSelectedTransaction(null)}><HiOutlineXMark /></button>
            </div>

            <div className="transaction-detail">
              <div className="transaction-detail-row">
                <span className="label">Invoice</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{selectedTransaction.invoiceNumber}</span>
              </div>
              <div className="transaction-detail-row">
                <span className="label">Tanggal</span>
                <span>{formatDateTime(selectedTransaction.createdAt)}</span>
              </div>
            </div>

            <div className="table-container" style={{ marginBottom: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaction.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.qty}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="payment-summary">
              <div className="payment-row total">
                <span>Total</span>
                <span className="value">{formatCurrency(selectedTransaction.totalAmount)}</span>
              </div>
              <div className="payment-row">
                <span style={{ color: 'var(--text-muted)' }}>Bayar</span>
                <span>{formatCurrency(selectedTransaction.paymentAmount)}</span>
              </div>
              <div className="payment-row change">
                <span style={{ color: 'var(--text-muted)' }}>Kembalian</span>
                <span className="value">{formatCurrency(selectedTransaction.change)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
