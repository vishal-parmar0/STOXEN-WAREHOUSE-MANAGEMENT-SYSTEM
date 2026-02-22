import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full animate-scale-in">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100 text-gray-400">
          <X size={18} />
        </button>
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle size={24} className={danger ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
