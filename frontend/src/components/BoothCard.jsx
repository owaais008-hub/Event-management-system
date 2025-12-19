import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export default function BoothCard({ booth, onAction, actionLabel = "Select Booth" }) {
  const getStatusVariant = (isReserved) => {
    return isReserved ? 'danger' : 'success';
  };

  const getSizeVariant = (size) => {
    switch (size) {
      case 'small': return 'info';
      case 'medium': return 'secondary';
      case 'large': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Booth {booth.number}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {booth.row}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={getStatusVariant(booth.isReserved)}>
              {booth.isReserved ? 'Reserved' : 'Available'}
            </Badge>
            <Badge variant={getSizeVariant(booth.size)}>
              {booth.size}
            </Badge>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 dark:text-slate-300 text-sm">
            {booth.description}
          </p>
        </div>

        {booth.reservedBy && (
          <div className="mb-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {booth.reservedBy.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {booth.reservedBy.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Reserved
                </p>
              </div>
            </div>
          </div>
        )}

        {onAction && (
          <div className="mt-6">
            <button
              onClick={() => onAction(booth)}
              disabled={booth.isReserved}
              className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                booth.isReserved
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {booth.isReserved ? 'Already Reserved' : actionLabel}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
