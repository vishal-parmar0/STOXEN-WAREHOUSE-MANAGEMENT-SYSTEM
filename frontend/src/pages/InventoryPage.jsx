import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Plus, Search, ChevronLeft, ChevronRight,
  Eye, Pencil, Trash2, X,
} from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function InventoryPage() {
  const { isAdmin, hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const perPage = 10;

  const emptyForm = { name: '', sku: '', category_id: '', supplier_id: '', unit: 'pieces', current_quantity: 0, minimum_threshold: 0, purchase_price: 0, selling_price: 0, batch_number: '', expiry_date: '', description: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, suppRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories'),
        API.get('/suppliers'),
      ]);
      setProducts(prodRes.data?.products || []);
      setCategories(catRes.data?.categories || catRes.data?.data || []);
      setSuppliers(suppRes.data?.suppliers || suppRes.data?.data || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchStatus = !statusFilter || p.status === statusFilter || p.stock_status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, sku: p.sku, category_id: p.category_id || '', supplier_id: p.supplier_id || '',
      unit: p.unit || 'pieces', current_quantity: p.quantity || p.current_quantity || 0,
      minimum_threshold: p.minimum_threshold || 0, purchase_price: p.purchase_price || 0,
      selling_price: p.selling_price || p.price || 0, batch_number: p.batch_number || '',
      expiry_date: p.expiry_date ? p.expiry_date.split('T')[0] : '', description: p.description || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Product name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editProduct) {
        await API.put(`/products/${editProduct.id}`, form);
      } else {
        await API.post('/products', form);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/products/${deleteTarget.id}`);
      fetchProducts();
    } catch { }
    setDeleteTarget(null);
  };

  const inputClass = 'w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Inventory</h2>
        {(hasRole('admin') || hasRole('manager')) && (
          <button onClick={openAdd} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 h-10 flex-1 min-w-0 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 ml-2 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400" />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none cursor-pointer">
          <option value="">All Categories</option>
          {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none cursor-pointer">
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try adjusting your filters or add a new product." action="Add Product" onAction={openAdd} />
      ) : (
        <div className="bg-white rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">Qty</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">Price</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                    <td className="py-3 px-4 text-gray-600">{p.category}</td>
                    <td className="py-3 px-4 text-right font-mono">{p.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{p.price || p.selling_price}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge type={p.status || p.stock_status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/inventory/${p.id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Eye size={15} /></Link>
                        {(hasRole('admin') || hasRole('manager')) && (
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"><Pencil size={15} /></button>
                        )}
                        {isAdmin() && (
                          <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"><ChevronLeft size={16} /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded text-xs font-medium cursor-pointer ${page === i + 1 ? 'bg-teal-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Enter product name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputClass} placeholder="Auto-generated if empty" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} className={inputClass}>
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                    {['pieces', 'kg', 'liters', 'rolls', 'kits', 'sheets', 'boxes', 'meters'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {!editProduct && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                    <input type="number" value={form.current_quantity} onChange={e => setForm({ ...form, current_quantity: e.target.value })} className={inputClass} min="0" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Threshold</label>
                  <input type="number" value={form.minimum_threshold} onChange={e => setForm({ ...form, minimum_threshold: e.target.value })} className={inputClass} min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input type="number" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} className={inputClass} min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                  <input type="number" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: e.target.value })} className={inputClass} min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-20 py-2`} placeholder="Product description..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 cursor-pointer">
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        danger
      />
    </div>
  );
}
