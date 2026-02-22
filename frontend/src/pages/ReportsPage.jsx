import { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, Calendar } from 'lucide-react';
import API from '../api/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const reportTypes = [
  { id: 'inventory', label: 'Inventory Report', desc: 'Current stock levels and values', endpoint: '/reports/inventory' },
  { id: 'transactions', label: 'Transaction Report', desc: 'Stock movements over time', endpoint: '/reports/transactions' },
  { id: 'low_stock', label: 'Low Stock Report', desc: 'Items below minimum threshold', endpoint: '/reports/low-stock' },
  { id: 'suppliers', label: 'Supplier Report', desc: 'Supplier performance and orders', endpoint: '/reports/suppliers' },
  { id: 'orders', label: 'Orders Report', desc: 'Purchase and dispatch summary', endpoint: '/reports/orders' },
];

const columnLabels = {
  name: 'Name', sku: 'SKU', category_name: 'Category', supplier_name: 'Supplier',
  current_quantity: 'Qty', unit: 'Unit', purchase_price: 'Purchase Price', selling_price: 'Sell Price',
  stock_value: 'Stock Value', stock_status: 'Status', minimum_threshold: 'Min Threshold',
  product_name: 'Product', type: 'Type', quantity: 'Qty', transaction_date: 'Date',
  user_name: 'User', reason: 'Reason', notes: 'Notes',
  contact_person: 'Contact', phone: 'Phone', email: 'Email', city: 'City',
  products_count: 'Products', total_purchase_value: 'Total Value', total_units_supplied: 'Units Supplied',
  order_number: 'Order #', status: 'Status', total_value: 'Value', customer_name: 'Customer',
  created_at: 'Date', items_count: 'Items', created_by_name: 'Created By',
  deficit: 'Deficit', previous_quantity: 'Previous', new_quantity: 'New',
};

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('inventory');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchReport = async (reportId) => {
    setLoading(true);
    const rt = reportTypes.find(r => r.id === reportId);
    try {
      const params = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await API.get(rt.endpoint, { params });
      setData(res.data?.report || []);
      setSummary(res.data?.summary || null);
    } catch { setData([]); setSummary(null); }
    setLoading(false);
  };

  useEffect(() => { fetchReport(activeReport); }, [activeReport]);

  const handleRefresh = () => fetchReport(activeReport);

  const exportCSV = () => {
    if (!data.length) return;
    const keys = Object.keys(data[0]).filter(k => !['id', 'updated_at', 'description', 'batch_number', 'expiry_date', 'supplier_id', 'category_id', 'product_id', 'performed_by', 'order_id', 'user_id', 'address', 'payment_terms'].includes(k));
    const header = keys.map(k => columnLabels[k] || k.replace(/_/g, ' ')).join(',');
    const rows = data.map(row => keys.map(k => {
      const v = row[k];
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v ?? '';
    }).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${activeReport}_report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Simple print-based PDF
    const rt = reportTypes.find(r => r.id === activeReport);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const keys = data.length ? Object.keys(data[0]).filter(k => !['id', 'updated_at', 'description', 'batch_number', 'expiry_date', 'supplier_id', 'category_id', 'product_id', 'performed_by', 'order_id', 'user_id', 'address', 'payment_terms'].includes(k)) : [];
    const tableRows = data.map(row => `<tr>${keys.map(k => `<td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${row[k] ?? ''}</td>`).join('')}</tr>`).join('');
    printWindow.document.write(`
      <html><head><title>${rt.label}</title></head>
      <body style="font-family:sans-serif;padding:20px">
        <h2>${rt.label}</h2>
        <p style="color:#888;font-size:13px">Generated: ${new Date().toLocaleString()}</p>
        ${summary ? `<div style="margin:16px 0;display:flex;gap:20px">${Object.entries(summary).map(([k,v]) => `<div style="background:#f9fafb;padding:10px 16px;border-radius:8px"><p style="font-size:11px;color:#888;margin:0">${k.replace(/([A-Z])/g,' $1')}</p><p style="font-size:18px;font-weight:700;margin:4px 0 0">${typeof v === 'number' && v > 1000 ? v.toLocaleString() : v}</p></div>`).join('')}</div>` : ''}
        <table style="width:100%;border-collapse:collapse;margin-top:12px">
          <thead><tr>${keys.map(k => `<th style="text-align:left;padding:8px 10px;border-bottom:2px solid #ddd;font-size:12px;color:#666">${columnLabels[k] || k.replace(/_/g,' ')}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const displayKeys = data.length ? Object.keys(data[0]).filter(k => !['id', 'updated_at', 'description', 'batch_number', 'expiry_date', 'supplier_id', 'category_id', 'product_id', 'performed_by', 'order_id', 'user_id', 'address', 'payment_terms'].includes(k)) : [];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Reports</h2>

      {/* Report Type Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {reportTypes.map(rt => (
          <button key={rt.id} onClick={() => setActiveReport(rt.id)}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer ${activeReport === rt.id ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:border-teal-300'}`}>
            <p className="text-sm font-semibold">{rt.label}</p>
            <p className={`text-xs mt-1 ${activeReport === rt.id ? 'text-teal-100' : 'text-gray-400'}`}>{rt.desc}</p>
          </button>
        ))}
      </div>

      {/* Filters & Export */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none" />
          <span className="text-gray-400 text-xs">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none" />
          <button onClick={handleRefresh} className="h-9 px-3 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg text-sm font-medium cursor-pointer">Apply</button>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={exportCSV} className="h-9 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer">
            <Download size={14} /> CSV
          </button>
          <button onClick={exportPDF} className="h-9 px-4 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors cursor-pointer">
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(summary).map(([key, val]) => (
            <div key={key} className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
              <p className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {typeof val === 'number' && val > 999 ? val.toLocaleString() : val}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Report Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl shadow-xs overflow-hidden">
          {data.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No data available for this report.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {displayKeys.map(k => (
                      <th key={k} className="text-left py-3 px-4 font-medium text-gray-500 text-xs capitalize whitespace-nowrap">
                        {columnLabels[k] || k.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      {displayKeys.map(k => (
                        <td key={k} className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          {typeof row[k] === 'number' && row[k] > 999 ? row[k].toLocaleString() : row[k] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
