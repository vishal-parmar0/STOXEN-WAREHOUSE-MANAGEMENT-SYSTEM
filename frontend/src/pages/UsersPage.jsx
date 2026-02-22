import { useState, useEffect } from 'react';
import { Users, Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const roleBadgeColors = {
  admin: 'bg-teal-50 text-teal-700',
  manager: 'bg-blue-50 text-blue-700',
  staff: 'bg-gray-100 text-gray-600',
};

const emptyForm = { name: '', email: '', password: '', role: 'staff' };

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users');
      setUsers(res.data?.users || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required'); return; }
    if (!editUser && !form.password) { setError('Password is required for new users'); return; }
    setSaving(true); setError('');
    try {
      const body = { ...form };
      if (editUser && !body.password) delete body.password;
      if (editUser) {
        await API.put(`/users/${editUser.id}`, body);
      } else {
        await API.post('/users', body);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save user'); }
    setSaving(false);
  };

  const toggleStatus = async (id) => {
    try {
      const res = await API.put(`/users/${id}/toggle-status`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u));
    } catch { }
  };

  const handleDelete = async () => {
    try { await API.delete(`/users/${deleteTarget.id}`); fetchUsers(); } catch { }
    setDeleteTarget(null);
  };

  const inputClass = 'w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Users</h2>
        {isAdmin() && (
          <button onClick={openAdd} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 h-10 max-w-sm">
        <Search size={16} className="text-gray-400" />
        <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 ml-2 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400" />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try adjusting your search or add a new user." action="Add User" onAction={openAdd} />
      ) : (
        <div className="bg-white rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Email</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Role</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Created</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const active = u.is_active === undefined ? u.status === 'active' : u.is_active;
                  return (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-teal-700">{u.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{u.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleBadgeColors[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {isAdmin() && (
                            <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"><Pencil size={15} /></button>
                          )}
                          {isAdmin() && (
                            <button onClick={() => toggleStatus(u.id)} className="p-1.5 rounded hover:bg-gray-100 cursor-pointer" title="Toggle status">
                              {active ? <ToggleRight size={18} className="text-teal-600" /> : <ToggleLeft size={18} className="text-gray-400" />}
                            </button>
                          )}
                          {isAdmin() && (
                            <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={15} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="john@stoxen.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{editUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputClass}>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 cursor-pointer">
                {saving ? 'Saving...' : editUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete User" message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`} danger />
    </div>
  );
}
