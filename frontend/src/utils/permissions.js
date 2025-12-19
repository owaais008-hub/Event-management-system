/**
 * Permission utilities for role-based access control
 * Checks what actions users can perform based on their role and approval status
 */

/**
 * Check if user can create events
 */
export function canCreateEvent(user) {
  if (!user) return false;
  return (user.role === 'organizer' && user.isApproved) || user.role === 'admin';
}

/**
 * Check if user can edit/delete an event
 */
export function canManageEvent(user, event) {
  if (!user || !event) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'organizer' && user.isApproved && event.organizerId?._id === user.id) return true;
  return false;
}

/**
 * Check if user can register for events
 */
export function canRegisterForEvent(user) {
  if (!user) return false;
  return user.role === 'student';
}

/**
 * Check if user can access dashboard
 */
export function canAccessDashboard(user) {
  if (!user) return false;
  return user.role !== 'visitor';
}

/**
 * Check if user can manage exhibitors
 */
export function canManageExhibitors(user) {
  if (!user) return false;
  return (user.role === 'organizer' && user.isApproved) || user.role === 'admin';
}

/**
 * Check if user can manage booths
 */
export function canManageBooths(user) {
  if (!user) return false;
  return (user.role === 'organizer' && user.isApproved) || user.role === 'admin';
}

/**
 * Check if user can manage certificates
 */
export function canManageCertificates(user) {
  if (!user) return false;
  return (user.role === 'organizer' && user.isApproved) || user.role === 'admin';
}

/**
 * Check if user can view statistics
 */
export function canViewStatistics(user) {
  if (!user) return false;
  return user.role !== 'visitor';
}

/**
 * Check if user can submit feedback
 */
export function canSubmitFeedback(user) {
  if (!user) return false;
  return user.role !== 'visitor';
}

/**
 * Check if user can approve events (admin only)
 */
export function canApproveEvents(user) {
  if (!user) return false;
  return user.role === 'admin';
}

/**
 * Check if user can approve organizers (admin only)
 */
export function canApproveOrganizers(user) {
  if (!user) return false;
  return user.role === 'admin';
}

/**
 * Check if user can manage users (admin only)
 */
export function canManageUsers(user) {
  if (!user) return false;
  return user.role === 'admin';
}

