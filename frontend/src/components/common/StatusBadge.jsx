export default function StatusBadge({ type, text }) {
  const styles = {
    stock_in:    'bg-green-50 text-green-500',
    stock_out:   'bg-red-50 text-red-500',
    adjustment:  'bg-amber-50 text-amber-500',
    pending:     'bg-amber-50 text-amber-500',
    approved:    'bg-blue-50 text-blue-500',
    processing:  'bg-teal-50 text-teal-600',
    completed:   'bg-green-50 text-green-500',
    cancelled:   'bg-gray-100 text-gray-500',
    low_stock:   'bg-amber-50 text-amber-500',
    out_of_stock:'bg-red-50 text-red-500',
    in_stock:    'bg-green-50 text-green-500',
    admin:       'bg-teal-50 text-teal-600',
    manager:     'bg-blue-50 text-blue-500',
    staff:       'bg-gray-100 text-gray-700',
    active:      'bg-green-50 text-green-500',
    inactive:    'bg-red-50 text-red-500',
  };

  const labels = {
    stock_in: 'Stock IN', stock_out: 'Stock OUT', adjustment: 'Adjustment',
    pending: 'Pending', approved: 'Approved', processing: 'Processing',
    completed: 'Completed', cancelled: 'Cancelled',
    low_stock: 'Low Stock', out_of_stock: 'Out of Stock', in_stock: 'In Stock',
    admin: 'Admin', manager: 'Manager', staff: 'Staff',
    active: 'Active', inactive: 'Inactive',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
      {text || labels[type] || type}
    </span>
  );
}
