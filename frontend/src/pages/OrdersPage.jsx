import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Eye, ChevronDown, X, Pencil } from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';

const tabs = [
  { label: 'All', value: '' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Dispatch', value: 'dispatch' },
];

const statusFilters = ['', 'pending', 'approved', 'processing', 'completed', 'cancelled'];

const emptyForm = { type: 'purchase', supplier_id: '', customer_name: '', expected_date: '', notes: '', items: [{ product_id: '', quantity: 1, unit_price: 0 }] };

export default function OrdersPage() {
  const { hasRole, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, suppRes, prodRes] = await Promise.all([
        API.get('/orders'),
        API.get('/suppliers'),
        API.get('/products'),
      ]);
      setOrders(ordRes.data?.orders || []);
      setSuppliers(suppRes.data?.suppliers || []);
      setProducts(prodRes.data?.products || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = orders.filter(o => {
    const matchTab = !activeTab || o.type === activeTab;
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchTab && matchStatus;
  });

  const openNew = () => { setForm(emptyForm); setError(''); setShowModal(true); };

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1, unit_price: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: val };
    if (key === 'product_id' && val) {
      const prod = products.find(p => p.id === parseInt(val));
      if (prod) items[i].unit_price = prod.price || prod.selling_price || 0;
    }
    setForm({ ...form, items });
  };

  const handleCreate = async () => {
    if (form.type === 'purchase' && !form.supplier_id) { setError('Select a supplier'); return; }
    if (form.type === 'dispatch' && !form.customer_name) { setError('Enter customer name'); return; }
    if (!form.items.length || !form.items[0].product_id) { setError('Add at least one product'); return; }
    setSaving(true); setError('');
    try {
      await API.post('/orders', form);
      setShowModal(false);
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create order'); }
    setSaving(false);
  };

  const openStatusModal = (order) => { setStatusModal(order); setNewStatus(order.status); };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === statusModal.status) { setStatusModal(null); return; }
    try {
      await API.patch(`/orders/${statusModal.id}/status`, { status: newStatus });
      fetchData();
    } catch { }
    setStatusModal(null);
  };

  const handleView = async (o) => {
    try {
      const res = await API.get(`/orders/${o.id}`);
      setViewOrder(res.data?.order || res.data || o);
    } catch { setViewOrder(o); }
  };

  const handleDelete = async () => {
    try { await API.delete(`/orders/${deleteTarget.id}`); fetchData(); } catch { }
    setDeleteTarget(null);
  };

  const totalValue = form.items.reduce((s, item) => s + (item.quantity * item.unit_price), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Orders</h2>
        {(hasRole('admin') || hasRole('manager')) && (
          <button onClick={openNew} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <Plus size={16} /> New Order
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.value ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${statusFilter === s ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders found" description="Try adjusting filters or create a new order." action="New Order" onAction={openNew} />
      ) : (
        <div className="bg-white rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Order #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Supplier/Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Date</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">Value</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-teal-600 text-xs">{o.order_number}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${o.type === 'purchase' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {o.type === 'purchase' ? 'Purchase' : 'Dispatch'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{o.supplier || o.customer || o.customer_name}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{o.date}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge type={o.status} /></td>
                    <td className="py-3 px-4 text-right font-mono">₹{o.total_value?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleView(o)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"><Eye size={15} /></button>
                        {(hasRole('admin') || hasRole('manager')) && o.status !== 'completed' && o.status !== 'cancelled' && (
                          <button onClick={() => openStatusModal(o)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer" title="Update Status"><Pencil size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Create New Order</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="purchase">Purchase</option>
                    <option value="dispatch">Dispatch</option>
                  </select>
                </div>
                {form.type === 'purchase' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                    <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Select supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" placeholder="Customer name" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
                  <input type="date" value={form.expected_date} onChange={e => setForm({ ...form, expected_date: e.target.value })}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex items-end">
                  <div className="bg-gray-50 rounded-lg px-4 py-2 w-full">
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="text-lg font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Order Items *</label>
                  <button onClick={addItem} className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}
                        className="flex-1 h-9 px-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Select product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 0)} min="1"
                        className="w-20 h-9 px-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none text-center" placeholder="Qty" />
                      <input type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)} min="0" step="0.01"
                        className="w-24 h-9 px-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none text-right" placeholder="Price" />
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full h-16 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 cursor-pointer">
                {saving ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewOrder(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Order {viewOrder.order_number}</h3>
              <button onClick={() => setViewOrder(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-400 mb-0.5">Type</p><p className="font-medium text-gray-900 capitalize">{viewOrder.type}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Status</p><StatusBadge type={viewOrder.status} /></div>
                <div><p className="text-xs text-gray-400 mb-0.5">{viewOrder.type === 'purchase' ? 'Supplier' : 'Customer'}</p><p className="font-medium text-gray-900">{viewOrder.supplier || viewOrder.customer || viewOrder.customer_name}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Total Value</p><p className="font-medium text-gray-900">₹{viewOrder.total_value?.toLocaleString()}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Date</p><p className="font-medium text-gray-900">{viewOrder.date}</p></div>
                {viewOrder.expected_date && <div><p className="text-xs text-gray-400 mb-0.5">Expected Date</p><p className="font-medium text-gray-900">{viewOrder.expected_date}</p></div>}
              </div>
              {viewOrder.notes && <div className="text-sm"><p className="text-xs text-gray-400 mb-0.5">Notes</p><p className="text-gray-700">{viewOrder.notes}</p></div>}
              {viewOrder.items && viewOrder.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Items</p>
                  <div className="space-y-1">
                    {viewOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <span className="font-medium text-gray-700">{item.product_name || item.product}</span>
                        <span className="text-gray-500 font-mono text-xs">{item.quantity} × ₹{item.unit_price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100">
              <button onClick={() => setViewOrder(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setStatusModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
              <button onClick={() => setStatusModal(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-500">Order: <span className="font-medium text-gray-900">{statusModal.order_number}</span></p>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500">
                {['pending', 'approved', 'processing', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleStatusUpdate} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer">Update</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Order" message={`Delete order "${deleteTarget?.order_number}"?`} danger />
    </div>
  );
}
