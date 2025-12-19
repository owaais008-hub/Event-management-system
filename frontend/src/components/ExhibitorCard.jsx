import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export default function ExhibitorCard({ exhibitor, showActions = true }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl">🏢</span>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {exhibitor.companyName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 truncate mt-1">
              {exhibitor.contactPerson}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={getStatusVariant(exhibitor.status)}>
                {exhibitor.status}
              </Badge>
              {exhibitor.boothNumber && (
                <Badge variant="info">
                  Booth {exhibitor.boothNumber}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 dark:text-slate-300 text-sm line-clamp-2">
            {exhibitor.description}
          </p>
        </div>

        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-slate-400">Email</span>
            <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
              {exhibitor.email}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-slate-400">Phone</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {exhibitor.phone || 'N/A'}
            </span>
          </div>
          {exhibitor.website && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Website</span>
              <a 
                href={exhibitor.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate ml-2"
              >
                Visit
              </a>
            </div>
          )}
        </div>

        {showActions && (
          <div className="mt-6">
            <Link
              to={`/exhibitors/${exhibitor._id}`}
              className="block w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-center rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
