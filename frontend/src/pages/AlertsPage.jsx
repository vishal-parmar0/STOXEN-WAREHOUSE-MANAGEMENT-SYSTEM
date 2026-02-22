import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import API from '../api/api';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

const tabs = [
  { label: 'All', value: '' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
  { label: 'Expiry', value: 'expiry' },
  { label: 'Order Status', value: 'order_status' },
];

const typeColors = {
  low_stock: 'bg-amber-500',
  out_of_stock: 'bg-red-500',
  expiry: 'bg-orange-500',
  order_status: 'bg-blue-500',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/alerts');
      setAlerts(res.data?.alerts || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const filtered = alerts.filter(a => !activeTab || a.type === activeTab);
  const unreadCount = alerts.filter(a => !a.read && !a.is_read).length;

  const markAllRead = async () => {
    try {
      await API.put('/alerts/mark-all-read');
      setAlerts(prev => prev.map(a => ({ ...a, read: true, is_read: true })));
    } catch { }
  };

  const markRead = async (id) => {
    try {
      await API.put(`/alerts/${id}/read`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true, is_read: true } : a));
    } catch { }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Alerts</h2>
          {unreadCount > 0 && (
            <span className="bg-teal-600 text-white text-xs font-bold rounded-full px-2.5 py-0.5">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1.5 cursor-pointer">
            <CheckCheck size={16} /> Mark all read
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

      {/* Alert List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="No alerts" description="You're all caught up! No alerts match your filter." />
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => {
            const isRead = alert.read || alert.is_read;
            return (
              <div key={alert.id} onClick={() => !isRead && markRead(alert.id)}
                className={`flex items-start gap-3 p-4 rounded-xl transition-colors cursor-pointer ${isRead ? 'bg-white' : 'bg-teal-50 border border-teal-100'}`}>
                <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${typeColors[alert.type] || 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.created_at}</p>
                </div>
                {!isRead && (
                  <span className="text-[10px] font-medium text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full shrink-0">New</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
