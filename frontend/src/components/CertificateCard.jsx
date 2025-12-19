export default function CertificateCard({ certificate, onDownload, onView }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-2xl">📜</span>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Verified
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {certificate.event?.title || 'Event Certificate'}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          Issued on {formatDate(certificate.createdAt)}
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={() => onDownload(certificate._id)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Download
          </button>
          <button
            onClick={() => onView(certificate)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}