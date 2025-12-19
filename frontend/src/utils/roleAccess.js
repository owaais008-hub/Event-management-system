/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines which pages/features are accessible to each user role
 */

export const roleAccess = {
  visitor: {
    name: 'Visitor',
    icon: '👤',
    description: 'Browse events without registration',
    color: 'from-gray-500 to-gray-600',
    pages: [
      { path: '/', name: 'Home', icon: '🏠', description: 'Browse all events' },
      { path: '/schedule', name: 'Schedule', icon: '📅', description: 'View event schedule' },
      { path: '/about', name: 'About', icon: 'ℹ️', description: 'Learn about the platform' },
      { path: '/contact', name: 'Contact', icon: '📧', description: 'Contact support' },
      { path: '/exhibitors', name: 'Exhibitors', icon: '🏢', description: 'Browse exhibitors' },
      { path: '/events/:id', name: 'Event Details', icon: '🎪', description: 'View event details (read-only)' },
      { path: '/exhibitors/:id', name: 'Exhibitor Profile', icon: '👤', description: 'View exhibitor profiles' },
    ],
    features: [
      'Browse events',
      'View event details',
      'View schedule',
      'View exhibitors',
      'Contact support',
    ],
    restrictions: [
      'Cannot register for events',
      'Cannot create events',
      'Cannot access dashboard',
      'Cannot view statistics',
    ]
  },
  
  student: {
    name: 'Student',
    icon: '🎓',
    description: 'Register and participate in events',
    color: 'from-blue-500 to-blue-600',
    pages: [
      { path: '/', name: 'Home', icon: '🏠', description: 'Browse all events' },
      { path: '/schedule', name: 'Schedule', icon: '📅', description: 'View event schedule' },
      { path: '/about', name: 'About', icon: 'ℹ️', description: 'Learn about the platform' },
      { path: '/contact', name: 'Contact', icon: '📧', description: 'Contact support' },
      { path: '/exhibitors', name: 'Exhibitors', icon: '🏢', description: 'Browse exhibitors' },
      { path: '/events/:id', name: 'Event Details', icon: '🎪', description: 'View and register for events' },
      { path: '/exhibitors/:id', name: 'Exhibitor Profile', icon: '👤', description: 'View exhibitor profiles' },
      { path: '/profile', name: 'Profile', icon: '👤', description: 'Manage your profile' },
      { path: '/statistics', name: 'Statistics', icon: '📈', description: 'View event statistics' },
      { path: '/feedback', name: 'Feedback', icon: '💬', description: 'Submit feedback' },
      { path: '/pass', name: 'Digital Pass', icon: '🎫', description: 'View your tickets' },
      { path: '/certificates', name: 'Certificates', icon: '📜', description: 'View your certificates' },
      { path: '/communications', name: 'Communications', icon: '💬', description: 'View messages' },
    ],
    features: [
      'Register for events',
      'Download tickets',
      'View certificates',
      'Submit feedback',
      'View statistics',
      'Manage profile',
    ],
    restrictions: [
      'Cannot create events',
      'Cannot manage participants',
      'Cannot approve events',
    ]
  },
  
  organizer: {
    name: 'Organizer',
    icon: '🎪',
    description: 'Create and manage events',
    color: 'from-purple-500 to-purple-600',
    pages: [
      { path: '/', name: 'Home', icon: '🏠', description: 'Browse all events' },
      { path: '/schedule', name: 'Schedule', icon: '📅', description: 'View event schedule' },
      { path: '/about', name: 'About', icon: 'ℹ️', description: 'Learn about the platform' },
      { path: '/contact', name: 'Contact', icon: '📧', description: 'Contact support' },
      { path: '/exhibitors', name: 'Exhibitors', icon: '🏢', description: 'Browse exhibitors' },
      { path: '/events/:id', name: 'Event Details', icon: '🎪', description: 'View and manage events' },
      { path: '/exhibitors/:id', name: 'Exhibitor Profile', icon: '👤', description: 'View exhibitor profiles' },
      { path: '/dashboard', name: 'Dashboard', icon: '📊', description: 'Manage your events' },
      { path: '/profile', name: 'Profile', icon: '👤', description: 'Manage your profile' },
      { path: '/statistics', name: 'Statistics', icon: '📈', description: 'View event statistics' },
      { path: '/feedback', name: 'Feedback', icon: '💬', description: 'Submit and view feedback' },
      { path: '/exhibitors-management', name: 'Exhibitor Management', icon: '🏢', description: 'Manage exhibitors' },
      { path: '/booths-management', name: 'Booth Management', icon: '🎪', description: 'Manage event booths' },
      { path: '/certificates', name: 'Certificates', icon: '📜', description: 'Manage certificates' },
      { path: '/communications', name: 'Communications', icon: '💬', description: 'Manage communications' },
    ],
    features: [
      'Create events',
      'Manage participants',
      'Export CSV data',
      'Manage exhibitors',
      'Manage booths',
      'View analytics',
      'Approve registrations',
    ],
    restrictions: [
      'Cannot approve events (admin only)',
      'Cannot manage all users',
      'Cannot approve other organizers',
    ]
  },
  
  admin: {
    name: 'Administrator',
    icon: '👑',
    description: 'Full system access and control',
    color: 'from-amber-500 to-amber-600',
    pages: [
      { path: '/', name: 'Home', icon: '🏠', description: 'Browse all events' },
      { path: '/schedule', name: 'Schedule', icon: '📅', description: 'View event schedule' },
      { path: '/about', name: 'About', icon: 'ℹ️', description: 'Learn about the platform' },
      { path: '/contact', name: 'Contact', icon: '📧', description: 'Contact support' },
      { path: '/exhibitors', name: 'Exhibitors', icon: '🏢', description: 'Browse exhibitors' },
      { path: '/events/:id', name: 'Event Details', icon: '🎪', description: 'View and manage all events' },
      { path: '/exhibitors/:id', name: 'Exhibitor Profile', icon: '👤', description: 'View exhibitor profiles' },
      { path: '/dashboard', name: 'Dashboard', icon: '📊', description: 'Admin dashboard and approvals' },
      { path: '/profile', name: 'Profile', icon: '👤', description: 'Manage your profile' },
      { path: '/statistics', name: 'Statistics', icon: '📈', description: 'View comprehensive statistics' },
      { path: '/feedback', name: 'Feedback', icon: '💬', description: 'Manage all feedback' },
      { path: '/exhibitors-management', name: 'Exhibitor Management', icon: '🏢', description: 'Manage all exhibitors' },
      { path: '/booths-management', name: 'Booth Management', icon: '🎪', description: 'Manage all booths' },
      { path: '/certificates', name: 'Certificates', icon: '📜', description: 'Manage all certificates' },
      { path: '/communications', name: 'Communications', icon: '💬', description: 'Manage all communications' },
    ],
    features: [
      'Approve/reject events',
      'Approve/reject organizers',
      'Manage all users',
      'View all analytics',
      'Manage all events',
      'Export all data',
      'System configuration',
    ],
    restrictions: []
  }
};

/**
 * Get accessible pages for a specific role
 */
export function getPagesForRole(role) {
  return roleAccess[role]?.pages || [];
}

/**
 * Get role information
 */
export function getRoleInfo(role) {
  return roleAccess[role] || roleAccess.visitor;
}

/**
 * Check if a role can access a specific path
 */
export function canAccessPath(role, path) {
  const roleInfo = roleAccess[role];
  if (!roleInfo) return false;
  
  // Check exact match
  if (roleInfo.pages.some(page => page.path === path)) {
    return true;
  }
  
  // Check pattern match (for dynamic routes like /events/:id)
  return roleInfo.pages.some(page => {
    const pagePattern = page.path.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pagePattern}$`);
    return regex.test(path);
  });
}

/**
 * Get all roles
 */
export function getAllRoles() {
  return Object.keys(roleAccess);
}

