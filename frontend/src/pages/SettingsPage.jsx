import { useState, useEffect } from 'react';
import { Save, Building2, BellRing, Tag, Plus, Pencil, Trash2, X } from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    warehouse_name: '', address: '', phone: '', email: '',
    low_stock_threshold: 20, expiry_alert_days: 30,
  });
  const [categories, setCategories] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [catModal, setCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [deleteCat, setDeleteCat] = useState(null);
  const [catSaving, setCatSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [settingsRes, catRes, logRes] = await Promise.all([
        API.get('/settings'),
        API.get('/categories'),
        API.get('/settings/activity-log'),
      ]);
      if (settingsRes.data) {
        const d = settingsRes.data;
        setForm({
          warehouse_name: d.warehouse_name || '',
          address: d.address || d.warehouse_address || '',
          phone: d.phone || d.warehouse_phone || '',
          email: d.email || d.warehouse_email || '',
          low_stock_threshold: d.low_stock_threshold || d.low_stock_alert_days || 20,
          expiry_alert_days: d.expiry_alert_days || 30,
        });
      }
      setCategories(catRes.data?.categories || []);
      setActivityLog(logRes.data?.logs || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setSaved(false); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await API.put('/settings', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to save settings'); }
    setSaving(false);
  };

  const openAddCat = () => { setEditCat(null); setCatForm({ name: '', description: '' }); setCatModal(true); };
  const openEditCat = (c) => { setEditCat(c); setCatForm({ name: c.name, description: c.description || '' }); setCatModal(true); };

  const handleSaveCat = async () => {
    if (!catForm.name.trim()) return;
    setCatSaving(true);
    try {
      if (editCat) {
        await API.put(`/categories/${editCat.id}`, catForm);
      } else {
        await API.post('/categories', catForm);
      }
      setCatModal(false);
      const res = await API.get('/categories');
      setCategories(res.data?.categories || []);
    } catch { }
    setCatSaving(false);
  };

  const handleDeleteCat = async () => {
    try {
      await API.delete(`/categories/${deleteCat.id}`);
      const res = await API.get('/categories');
      setCategories(res.data?.categories || []);
    } catch { }
    setDeleteCat(null);
  };

  const inputClass = 'w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Settings</h2>

      {/* Warehouse Info */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={18} className="text-teal-600" />
          <h3 className="text-base font-semibold text-gray-900">Warehouse Information</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Warehouse Name</label>
            <input name="warehouse_name" value={form.warehouse_name} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <BellRing size={18} className="text-teal-600" />
          <h3 className="text-base font-semibold text-gray-900">Alert Configuration</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Low Stock Threshold</label>
            <input type="number" name="low_stock_threshold" value={form.low_stock_threshold} onChange={handleChange} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Alert when stock falls below this quantity</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Alert Days</label>
            <input type="number" name="expiry_alert_days" value={form.expiry_alert_days} onChange={handleChange} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Alert this many days before expiry</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Settings saved</span>}
        {error && <span className="text-sm text-red-600 font-medium">{error}</span>}
      </div>

      {/* Categories Management */}
      <div className="bg-white rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-teal-600" />
            <h3 className="text-base font-semibold text-gray-900">Categories</h3>
          </div>
          {isAdmin() && (
            <button onClick={openAddCat} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer">
              <Plus size={14} /> Add Category
            </button>
          )}
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No categories yet.</p>
        ) : (
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{c.products_count} products</span>
                  {isAdmin() && (
                    <>
                      <button onClick={() => openEditCat(c)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteCat(c)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Log */}
      {activityLog.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-xs">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {activityLog.slice(0, 20).map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm py-2 border-b border-gray-50">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-700"><span className="font-medium">{log.user_name}</span> — {log.action} ({log.module})</p>
                  {log.details && <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>}
                  <p className="text-xs text-gray-300 mt-0.5">{log.created_at}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCatModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setCatModal(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setCatModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleSaveCat} disabled={catSaving} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 cursor-pointer">
                {catSaving ? 'Saving...' : editCat ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteCat} onCancel={() => setDeleteCat(null)} onConfirm={handleDeleteCat}
        title="Delete Category" message={`Delete "${deleteCat?.name}"? Products in this category won't be deleted.`} danger />
    </div>
  );
}
