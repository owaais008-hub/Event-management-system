import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export default function UserCard({ user, onAction, actionLabel = "View Profile" }) {
  const getRoleVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'organizer': return 'secondary';
      case 'student': return 'info';
      default: return 'default';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">
              {getInitials(user.name)}
            </span>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 truncate mt-1">
              {user.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={getRoleVariant(user.role)}>
                {user.role}
              </Badge>
              {user.isBlocked && (
                <Badge variant="danger">
                  Blocked
                </Badge>
              )}
            </div>
          </div>
        </div>

        {user.role === 'student' && (
          <div className="mb-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-slate-400">Department</span>
              <span className="font-medium text-gray-900 dark:text-white">{user.department || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Enrollment</span>
              <span className="font-medium text-gray-900 dark:text-white">{user.enrollmentNumber || 'N/A'}</span>
            </div>
          </div>
        )}

        {user.role === 'organizer' && (
          <div className="mb-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-slate-400">Status</span>
              <span className={`font-medium ${user.isApproved ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {user.isApproved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Events Created</span>
              <span className="font-medium text-gray-900 dark:text-white">{user.activityStats?.eventsCreated || 0}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <span className="text-amber-500 mr-1">⭐</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.points || 0} pts</span>
          </div>
          {onAction && (
            <button
              onClick={() => onAction(user)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
