import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PackagePlus, PackageMinus, SlidersHorizontal, X } from 'lucide-react';
import API from '../api/api';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const typeStyles = {
  stock_in: 'bg-emerald-50 text-emerald-700',
  stock_out: 'bg-red-50 text-red-600',
  adjustment: 'bg-amber-50 text-amber-700',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'stock_in' | 'stock_out' | 'adjustment'
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, txRes] = await Promise.all([
        API.get(`/products/${id}`),
        API.get(`/transactions?product_id=${id}`),
      ]);
      setProduct(prodRes.data);
      setHistory(txRes.data?.transactions || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const openModal = (type) => {
    setModal(type);
    setQty('');
    setNotes('');
    setReason('');
    setError('');
  };

  const handleTransaction = async () => {
    const quantity = parseInt(qty);
    if (!quantity || quantity <= 0) { setError('Enter a valid quantity'); return; }
    setSaving(true);
    setError('');
    try {
      const endpoints = { stock_in: '/transactions/stock-in', stock_out: '/transactions/stock-out', adjustment: '/transactions/adjustment' };
      const body = { product_id: parseInt(id), quantity };
      if (notes) body.notes = notes;
      if (modal === 'adjustment') body.reason = reason || 'manual_adjustment';
      await API.post(endpoints[modal], body);
      setModal(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const infoFields = [
    ['SKU', product.sku],
    ['Category', product.category],
    ['Supplier', product.supplier],
    ['Purchase Price', `₹${product.purchase_price}`],
    ['Selling Price', `₹${product.selling_price}`],
    ['Current Stock', `${product.quantity || product.current_quantity} ${product.unit}`],
    ['Min Stock Level', product.min_stock_level || product.minimum_threshold],
    ['Batch', product.batch_number],
    ['Expiry', product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : '—'],
  ];

  const modalConfig = {
    stock_in: { title: 'Stock IN', desc: 'Add incoming stock', color: 'teal', icon: PackagePlus },
    stock_out: { title: 'Stock OUT', desc: 'Remove outgoing stock', color: 'red', icon: PackageMinus },
    adjustment: { title: 'Stock Adjustment', desc: 'Correct stock count', color: 'amber', icon: SlidersHorizontal },
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/inventory" className="text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <ArrowLeft size={14} /> Inventory
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">{product.name}</span>
      </div>

      {/* Product Info + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-xs">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{product.description || 'No description'}</p>
            </div>
            <StatusBadge type={product.status || product.stock_status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {infoFields.map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Actions */}
        <div className="bg-white rounded-xl p-6 shadow-xs flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Stock Actions</h3>
          <button onClick={() => openModal('stock_in')} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors cursor-pointer">
            <PackagePlus size={20} className="text-emerald-600" />
            <div className="text-left"><p className="text-sm font-medium text-gray-900">Stock IN</p><p className="text-xs text-gray-400">Add incoming stock</p></div>
          </button>
          <button onClick={() => openModal('stock_out')} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
            <PackageMinus size={20} className="text-red-600" />
            <div className="text-left"><p className="text-sm font-medium text-gray-900">Stock OUT</p><p className="text-xs text-gray-400">Remove outgoing stock</p></div>
          </button>
          <button onClick={() => openModal('adjustment')} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer">
            <SlidersHorizontal size={20} className="text-amber-600" />
            <div className="text-left"><p className="text-sm font-medium text-gray-900">Adjust</p><p className="text-xs text-gray-400">Correct stock count</p></div>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Transaction History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Type</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">Qty</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Previous → New</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 text-xs">{tx.date || tx.transaction_date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${typeStyles[tx.type]}`}>
                        {tx.type === 'stock_in' ? 'Stock IN' : tx.type === 'stock_out' ? 'Stock OUT' : 'Adjust'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-medium ${tx.type === 'stock_in' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'stock_in' ? `+${tx.qty || tx.quantity}` : `${tx.qty || tx.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500 font-mono text-xs">
                      {tx.prev ?? tx.previous_qty ?? tx.previous_quantity} → {tx.after ?? tx.new_qty ?? tx.new_quantity}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{tx.user || tx.user_name}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{tx.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Transaction Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {(() => { const C = modalConfig[modal]; const Icon = C.icon; return <Icon size={20} className={`text-${C.color}-600`} />; })()}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{modalConfig[modal].title}</h3>
                  <p className="text-xs text-gray-400">{modalConfig[modal].desc}</p>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Current Stock</p>
                <p className="text-lg font-bold text-gray-900">{product.quantity || product.current_quantity} {product.unit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="1"
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter quantity" />
              </div>
              {modal === 'adjustment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select value={reason} onChange={e => setReason(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="manual_adjustment">Manual Adjustment</option>
                    <option value="damage">Damage</option>
                    <option value="theft">Theft</option>
                    <option value="expiry">Expiry</option>
                    <option value="correction">Correction</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full h-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleTransaction} disabled={saving}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 cursor-pointer ${modal === 'stock_out' ? 'bg-red-500 hover:bg-red-600' : modal === 'adjustment' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-600 hover:bg-teal-700'}`}>
                {saving ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
