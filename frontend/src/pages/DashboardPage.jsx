import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, DollarSign, AlertTriangle, ClipboardList,
  TrendingUp, ArrowUpRight, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import API from '../api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PIE_COLORS = ['#0d9488', '#99f6e4', '#d1d5db'];

function StatCard({ icon: Icon, label, value, subtitle, color, borderColor }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border-t-[3px]" style={{ borderTopColor: borderColor }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${borderColor}15` }}>
          <Icon size={20} style={{ color: borderColor }} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 font-[ClashDisplay,sans-serif]">{value}</p>
      <p className={`text-xs mt-1 flex items-center gap-1 ${color}`}>
        <ArrowUpRight size={12} />
        {subtitle}
      </p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-md rounded-lg px-3 py-2 border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [movement, setMovement] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stockOverview, setStockOverview] = useState({ in_stock: 0, low_stock: 0, out_of_stock: 0, total: 0 });
  const [categoryStock, setCategoryStock] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [expiring, setExpiring] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsR, movementR, txR, alertsR, overviewR, catR, suppR, expR] = await Promise.all([
        API.get('/dashboard/stats').catch(() => ({ data: {} })),
        API.get('/dashboard/stock-movement').catch(() => ({ data: { movement: [] } })),
        API.get('/dashboard/recent-transactions').catch(() => ({ data: { transactions: [] } })),
        API.get('/dashboard/alerts').catch(() => ({ data: { alerts: [] } })),
        API.get('/dashboard/stock-overview').catch(() => ({ data: {} })),
        API.get('/dashboard/category-stock').catch(() => ({ data: { categories: [] } })),
        API.get('/dashboard/top-suppliers').catch(() => ({ data: { suppliers: [] } })),
        API.get('/dashboard/expiring-soon').catch(() => ({ data: { products: [] } })),
      ]);
      setStats(statsR.data || {});
      setMovement(movementR.data?.movement || []);
      setTransactions(txR.data?.transactions || []);
      setAlerts(alertsR.data?.alerts || []);
      setStockOverview(overviewR.data || {});
      setCategoryStock(catR.data?.categories || []);
      setTopSuppliers(suppR.data?.suppliers || []);
      setExpiring(expR.data?.products || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const typeStyles = {
    stock_in: 'bg-emerald-50 text-emerald-700',
    stock_out: 'bg-red-50 text-red-600',
    adjustment: 'bg-amber-50 text-amber-700',
  };
  const typeLabels = { stock_in: 'Stock IN', stock_out: 'Stock OUT', adjustment: 'Adjust' };

  // Pie chart data from stock overview
  const pieData = [
    { name: 'In Stock', value: stockOverview.in_stock || 0, color: PIE_COLORS[0] },
    { name: 'Low Stock', value: stockOverview.low_stock || 0, color: PIE_COLORS[1] },
    { name: 'Out of Stock', value: stockOverview.out_of_stock || 0, color: PIE_COLORS[2] },
  ];
  const totalPie = pieData.reduce((s, d) => s + d.value, 0);
  const inStockPct = totalPie > 0 ? Math.round((pieData[0].value / totalPie) * 100) : 0;

  // Chart data formatting
  const chartData = movement.map(m => {
    const d = new Date(m.date);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), stock_in: m.stock_in, stock_out: m.stock_out };
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <StatCard icon={Package} label="Total Products" value={stats.totalProducts?.toLocaleString() || '0'} subtitle={`${stats.outOfStockItems || 0} out of stock`} color="text-emerald-600" borderColor="#0d9488" />
          <StatCard icon={DollarSign} label="Stock Value" value={formatCurrency(stats.stockValue)} subtitle="Total inventory value" color="text-emerald-600" borderColor="#3b82f6" />
          <StatCard icon={AlertTriangle} label="Low Stock Items" value={String(stats.lowStockItems || 0)} subtitle="Needs attention" color="text-amber-600" borderColor="#f59e0b" />
          <StatCard icon={ClipboardList} label="Pending Orders" value={String(stats.pendingOrders || 0)} subtitle={`${stats.unreadAlerts || 0} unread alerts`} color="text-emerald-600" borderColor="#22c55e" />
        </div>

        {/* Chart + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-5">
          <div className="lg:col-span-3 bg-white rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Stock Movement</h3>
              <button onClick={fetchAll} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 cursor-pointer">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div className="h-[280px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="stock_in" name="Stock IN" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="stock_out" name="Stock OUT" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No movement data yet</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-xs">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Active Alerts</h3>
            <div className="space-y-3 max-h-[260px] overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-sm text-gray-400">No active alerts</p>
              ) : alerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${alert.type === 'low_stock' ? 'bg-amber-500' : alert.type === 'expiry' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <span className="text-sm text-gray-700 flex-1 truncate">{alert.message}</span>
                  {alert.quantity !== null && (
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-600">
                      {alert.quantity} left
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/alerts')} className="text-xs text-teal-600 hover:text-teal-700 mt-4 font-medium cursor-pointer">
              View all alerts →
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 10 stock movements</p>
            </div>
            <button onClick={() => navigate('/transactions')} className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No transactions yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-medium text-gray-400 text-xs">Date & Time</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-400 text-xs">Product</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-400 text-xs">Type</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-400 text-xs">Qty</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-400 text-xs">User</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-400 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(tx.date).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-900">{tx.product}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${typeStyles[tx.type]}`}>
                          {typeLabels[tx.type]}
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-right font-mono font-medium ${tx.type === 'stock_in' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'stock_in' ? `+${tx.qty}` : `-${tx.qty}`}
                      </td>
                      <td className="py-3 px-2 text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-500">{tx.user?.charAt(0)}</span>
                          </div>
                          {tx.user}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="xl:w-[280px] xl:shrink-0 space-y-4 sm:space-y-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-5">
        {/* Stock Overview */}
        <div className="bg-white rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Stock Overview</h3>
          <p className="text-xs text-gray-400 mb-4">Quick stats</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total SKUs', value: stats.totalProducts || 0 },
              { label: 'Low Stock', value: stats.lowStockItems || 0 },
              { label: 'Out of Stock', value: stats.outOfStockItems || 0 },
              { label: 'Pending Orders', value: stats.pendingOrders || 0 },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Stock by Status</h3>
          <div className="flex justify-center">
            <div className="relative">
              <PieChart width={180} height={180}>
                <Pie data={pieData} cx={90} cy={90} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{inStockPct}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Suppliers</h3>
          <div className="space-y-3">
            {topSuppliers.length === 0 ? (
              <p className="text-xs text-gray-400">No supplier data</p>
            ) : topSuppliers.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-teal-700">
                    {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium truncate">{s.name}</p>
                  <p className="text-[10px] text-gray-400">{s.products_count} products</p>
                </div>
                <span className="text-xs font-mono font-medium text-gray-700">
                  {formatCurrency(parseFloat(s.total_value))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Expiring Soon</h3>
          <div className="space-y-3">
            {expiring.length === 0 ? (
              <p className="text-xs text-gray-400">No items expiring soon</p>
            ) : expiring.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.days_left < 7 ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">Batch: {item.batch_number || 'N/A'}</p>
                </div>
                <span className={`text-xs font-mono font-medium whitespace-nowrap ${item.days_left < 7 ? 'text-red-600' : 'text-amber-600'}`}>
                  {item.days_left}d left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
