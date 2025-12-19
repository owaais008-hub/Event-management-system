import { Link, useLocation } from 'react-router-dom';

export default function DashboardNavigation() {
  const location = useLocation();
  
  const navigationItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: '📊',
      roles: ['organizer', 'admin']
    },
    {
      name: 'My Events',
      href: '/dashboard#events',
      icon: '🎪',
      roles: ['organizer', 'admin']
    },
    {
      name: 'Exhibitors',
      href: '/exhibitors-management',
      icon: '🏢',
      roles: ['organizer', 'admin']
    },
    {
      name: 'Booths',
      href: '/booths-management',
      icon: '🎪',
      roles: ['organizer', 'admin']
    },
    {
      name: 'Communications',
      href: '/communications',
      icon: '💬',
      roles: ['student', 'organizer', 'admin']
    },
    {
      name: 'Statistics',
      href: '/statistics',
      icon: '📈',
      roles: ['student', 'organizer', 'admin']
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-slate-700">
      <div className="p-1">
        <nav className="flex-1 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-slate-700 dark:text-indigo-400'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}