import { useState, useEffect } from 'react';
import { Truck, Plus, Search, Eye, Pencil, Trash2, Phone, Mail, MapPin, X } from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const emptyForm = { name: '', contact_person: '', email: '', phone: '', address: '', city: '', payment_terms: '', notes: '' };

export default function SuppliersPage() {
  const { isAdmin, hasRole } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [viewProducts, setViewProducts] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/suppliers');
      setSuppliers(res.data?.suppliers || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const filtered = suppliers.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.city || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditSupplier(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (s) => {
    setEditSupplier(s);
    setForm({ name: s.name, contact_person: s.contact_person || '', email: s.email || '', phone: s.phone || '', address: s.address || '', city: s.city || '', payment_terms: s.payment_terms || '', notes: s.notes || '' });
    setError('');
    setShowModal(true);
  };

  const openView = async (s) => {
    try {
      const res = await API.get(`/suppliers/${s.id}`);
      setViewSupplier(res.data?.supplier || s);
      setViewProducts(res.data?.products || []);
    } catch {
      setViewSupplier(s);
      setViewProducts([]);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Supplier name is required'); return; }
    setSaving(true); setError('');
    try {
      if (editSupplier) {
        await API.put(`/suppliers/${editSupplier.id}`, form);
      } else {
        await API.post('/suppliers', form);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await API.delete(`/suppliers/${deleteTarget.id}`); fetchSuppliers(); } catch { }
    setDeleteTarget(null);
  };

  const inputClass = 'w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Suppliers</h2>
        {(hasRole('admin') || hasRole('manager')) && (
          <button onClick={openAdd} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <Plus size={16} /> Add Supplier
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 h-10 flex-1 max-w-sm">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 ml-2 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400" />
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('card')} className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${viewMode === 'card' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}>Cards</button>
          <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}>Table</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Truck} title="No suppliers found" description="Try adjusting your search or add a new supplier." action="Add Supplier" onAction={openAdd} />
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                    <span className="text-sm font-bold text-teal-700">{s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-xs text-gray-400">{s.contact_person}</p>
                  </div>
                </div>
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{s.products_count} products</span>
              </div>
              <div className="space-y-2 text-xs text-gray-500">
                {s.email && <div className="flex items-center gap-2"><Mail size={12} /> {s.email}</div>}
                {s.phone && <div className="flex items-center gap-2"><Phone size={12} /> {s.phone}</div>}
                {s.city && <div className="flex items-center gap-2"><MapPin size={12} /> {s.city}</div>}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => openView(s)} className="flex-1 text-xs font-medium text-teal-600 py-2 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">View Details</button>
                {(hasRole('admin') || hasRole('manager')) && (
                  <button onClick={() => openEdit(s)} className="flex-1 text-xs font-medium text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">Edit</button>
                )}
                {isAdmin() && (
                  <button onClick={() => setDeleteTarget(s)} className="text-xs font-medium text-red-500 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">City</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Products</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 px-4 text-gray-600">{s.contact_person}</td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">{s.phone}</td>
                    <td className="py-3 px-4 text-gray-600">{s.city}</td>
                    <td className="py-3 px-4 text-center">{s.products_count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openView(s)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"><Eye size={15} /></button>
                        {(hasRole('admin') || hasRole('manager')) && (
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"><Pencil size={15} /></button>
                        )}
                        {isAdmin() && (
                          <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={15} /></button>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Supplier company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })} className={inputClass} placeholder="e.g. Net 30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={`${inputClass} h-16 py-2`} />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 cursor-pointer">
                {saving ? 'Saving...' : editSupplier ? 'Update' : 'Add Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewSupplier(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{viewSupplier.name}</h3>
              <button onClick={() => setViewSupplier(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[['Contact Person', viewSupplier.contact_person], ['Phone', viewSupplier.phone], ['Email', viewSupplier.email], ['City', viewSupplier.city], ['Address', viewSupplier.address], ['Payment Terms', viewSupplier.payment_terms], ['Products', viewSupplier.products_count]].map(([l, v]) => v ? (
                  <div key={l}><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="font-medium text-gray-900">{v}</p></div>
                ) : null)}
              </div>
              {viewSupplier.notes && <div className="text-sm"><p className="text-xs text-gray-400 mb-0.5">Notes</p><p className="text-gray-700">{viewSupplier.notes}</p></div>}
              {viewProducts.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Linked Products</p>
                  <div className="space-y-1">
                    {viewProducts.map(p => (
                      <div key={p.id} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <span className="font-medium text-gray-700">{p.name}</span>
                        <span className="text-gray-400 font-mono text-xs">{p.current_quantity} {p.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100">
              <button onClick={() => setViewSupplier(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Supplier" message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`} danger />
    </div>
  );
}
