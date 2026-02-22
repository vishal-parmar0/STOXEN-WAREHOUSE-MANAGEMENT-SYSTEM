import { useState, useEffect } from 'react';
import { ArrowLeftRight, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import API from '../api/api';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

const tabs = [
  { label: 'All', value: '' },
  { label: 'Stock IN', value: 'stock_in' },
  { label: 'Stock OUT', value: 'stock_out' },
  { label: 'Adjustments', value: 'adjustment' },
];

const typeStyles = {
  stock_in: 'bg-emerald-50 text-emerald-700',
  stock_out: 'bg-red-50 text-red-600',
  adjustment: 'bg-amber-50 text-amber-700',
};

export default function TransactionsPage() {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const getInitialTab = () => {
    if (location.pathname.includes('stock-in')) return 'stock_in';
    if (location.pathname.includes('stock-out')) return 'stock_out';
    return '';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/transactions');
      setTransactions(res.data?.transactions || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);
  useEffect(() => { setActiveTab(getInitialTab()); }, [location.pathname]);

  const filtered = transactions.filter(tx => {
    const matchTab = !activeTab || tx.type === activeTab;
    const matchSearch = !search || (tx.product || tx.product_name || '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Transactions</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.value ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 h-10 flex-1 max-w-sm">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search by product..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 ml-2 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400" />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="No transactions found" description="No transactions match your current filters." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Type</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">Qty</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs">Previous → New</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{tx.date || tx.transaction_date}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{tx.product || tx.product_name}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${typeStyles[tx.type]}`}>
                        {tx.type === 'stock_in' ? 'Stock IN' : tx.type === 'stock_out' ? 'Stock OUT' : 'Adjust'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-medium ${tx.type === 'stock_in' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'stock_in' ? `+${tx.qty || tx.quantity}` : `-${tx.qty || tx.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500 font-mono text-xs">
                      {tx.prev ?? tx.previous_qty ?? tx.previous_quantity} → {tx.after ?? tx.new_qty ?? tx.new_quantity}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{tx.user || tx.user_name}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs max-w-[150px] truncate">{tx.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
