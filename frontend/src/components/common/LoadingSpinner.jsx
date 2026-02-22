import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ fullPage = false, size = 24 }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          St<span className="text-teal-600">ox</span>en
        </h1>
        <Loader2 size={32} className="text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 size={size} className="text-teal-600 animate-spin" />
    </div>
  );
}
