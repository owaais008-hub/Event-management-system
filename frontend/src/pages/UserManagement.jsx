import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import UserCard from '../components/UserCard.jsx';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlockUser = async (userId) => {
    try {
      await axios.post(`/api/admin/users/${userId}/block`);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await axios.post(`/api/admin/users/${userId}/unblock`);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError('Failed to unblock user');
    }
  };

  const handleApproveOrganizer = async (userId) => {
    try {
      await axios.post(`/api/admin/users/${userId}/approve-organizer`);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error('Error approving organizer:', err);
      setError('Failed to approve organizer');
    }
  };

  const filteredUsers = users.filter(u => {
    // Search filter
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Role filter
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'blocked' && u.isBlocked) ||
                         (statusFilter === 'active' && !u.isBlocked) ||
                         (statusFilter === 'pending' && u.role === 'organizer' && !u.isApproved);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Only administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage all users in the system
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 mb-8 border border-white/30 dark:border-slate-700/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Search Users
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Filter by Role
            </label>
            <select
              id="role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Filter by Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(u => (
              <UserCard 
                key={u._id} 
                user={u} 
                onAction={(user) => {
                  if (user.isBlocked) {
                    handleUnblockUser(user._id);
                  } else {
                    handleBlockUser(user._id);
                  }
                }}
                actionLabel={u.isBlocked ? "Unblock" : "Block"}
              />
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow p-12 text-center">
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-xl font-semibold mb-2">No users found</h2>
                <p className="text-gray-600 dark:text-slate-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}