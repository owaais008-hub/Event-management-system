import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import useSocket from '../hooks/useSocket.js';
import { toast } from 'react-toastify';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { socket } = useSocket(window.location.origin);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', handleNewNotification);
      // Also mirror announcements into notifications so all messages appear here
      socket.on('announcement', (payload) => {
        const notification = {
          _id: `local-${Date.now()}`,
          title: payload.title || 'Announcement',
          message: payload.message || (typeof payload === 'string' ? payload : ''),
          type: payload.type || 'info',
          read: false,
          createdAt: new Date().toISOString()
        };
        handleNewNotification(notification);
      });
      
      // Clean up listener on unmount
      return () => {
        socket.off('notification', handleNewNotification);
        socket.off('announcement');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (!user) return;
    // small delay to ensure axios auth header is set by AuthContext
    const t = setTimeout(() => fetchNotifications(), 100);
    return () => clearTimeout(t);
  }, [user]);

  // Light polling and refetch on tab focus so users don't miss updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000); // 30s
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [user]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notifications', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Retry once after a short delay if unauthorized or network error
      const status = error?.response?.status;
      if (!status || status === 401) {
        setTimeout(() => {
          const token = localStorage.getItem('token');
          axios.get('/api/notifications', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
            .then(res => {
              setNotifications(res.data.notifications || []);
              setUnreadCount(res.data.unreadCount || 0);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
          return;
        }, 400);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleNewNotification(notification) {
    // Only show notifications that belong to the current user
    if (notification.user && user && notification.user !== user.id) {
      return;
    }
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    const toastType = notification.type === 'success' ? toast.success :
                     notification.type === 'error' ? toast.error :
                     notification.type === 'warning' ? toast.warn :
                     toast.info;
    
    toastType(notification.message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('FusionFiesta', {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }

  async function markAsRead(notificationId) {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Silently handle mark as read errors
    }
  }

  async function markAsUnread(notificationId) {
    try {
      await axios.post(`/api/notifications/${notificationId}/unread`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: false } : n
        )
      );
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      // Silently handle mark as unread errors
    }
  }

  async function markAllAsRead() {
    try {
      await axios.post('/api/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Silently handle mark all as read errors
    }
  }

  async function deleteNotification(notificationId) {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Silently handle delete notification errors
    }
  }

  async function deleteAllRead() {
    try {
      await axios.delete('/api/notifications/read/all');
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (error) {
      console.error('Failed to delete all read notifications:', error);
      // Silently handle delete all read notifications errors
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      const diffInHoursInt = Math.floor(diffInHours);
      return `${diffInHoursInt}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true; // 'all'
  });

  // Group notifications by type
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const type = notification.type || 'info';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(notification);
    return groups;
  }, {});

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Notifications"
      >
        <svg 
          className="w-5 h-5 text-gray-600 dark:text-slate-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700/50 z-50 backdrop-blur-xl">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 dark:text-slate-200">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button 
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </button>
                )}
                {notifications.some(n => n.read) && (
                  <button 
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    onClick={deleteAllRead}
                  >
                    Clear read
                  </button>
                )}
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700 mb-3">
              <button
                className={`px-3 py-1 text-sm font-medium ${
                  filter === 'all'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 text-sm font-medium ${
                  filter === 'unread'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              <button
                className={`px-3 py-1 text-sm font-medium ${
                  filter === 'read'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
                onClick={() => setFilter('read')}
              >
                Read
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {Object.entries(groupedNotifications).map(([type, notifications]) => (
                  <div key={type}>
                    <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-2">
                      {type === 'success' ? 'Success' : 
                       type === 'error' ? 'Error' : 
                       type === 'warning' ? 'Warning' : 
                       type === 'info' ? 'Information' : 
                       type}
                    </h4>
                    <ul className="space-y-2">
                      {notifications.map((notification) => (
                        <li 
                          key={notification._id} 
                          className={`border border-gray-200 dark:border-slate-700 rounded-lg transition-colors duration-200 ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-800/50'
                          }`}
                        >
                          <div className="p-3 hover:bg-gray-50 dark:hover:bg-slate-800/80">
                            <div className="flex justify-between">
                              <div className="font-medium text-sm text-gray-800 dark:text-slate-200">{notification.title}</div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {formatTime(notification.createdAt)}
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-slate-300 text-sm mt-1">
                              {notification.message}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                                notification.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                                notification.type === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' :
                                'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200'
                              }`}>
                                {notification.type}
                              </span>
                              <div className="flex gap-2">
                                {!notification.read ? (
                                  <button
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    onClick={() => markAsRead(notification._id)}
                                  >
                                    Mark read
                                  </button>
                                ) : (
                                  <button
                                    className="text-xs text-gray-600 dark:text-slate-400 hover:underline"
                                    onClick={() => markAsUnread(notification._id)}
                                  >
                                    Mark unread
                                  </button>
                                )}
                                <button
                                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                  onClick={() => deleteNotification(notification._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 text-center border-t border-gray-200 dark:border-slate-700">
            <button 
              className="text-sm text-gray-600 dark:text-slate-400 hover:underline"
              onClick={() => setShowNotifications(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Request notification permission on mount */}
      {user && Notification.permission === 'default' && (
        <div id="notification-permission-request" className="fixed bottom-4 right-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-4 max-w-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Enable Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
                  Get notified about important updates and announcements.
                </p>
              </div>
              <button 
                onClick={() => {
                  const element = document.getElementById('notification-permission-request');
                  if (element) element.style.display = 'none';
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={async () => {
                  await Notification.requestPermission();
                  const element = document.getElementById('notification-permission-request');
                  if (element) element.style.display = 'none';
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                Allow
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('notification-permission-request');
                  if (element) element.style.display = 'none';
                }}
                className="px-3 py-1.5 text-gray-700 dark:text-slate-300 text-sm rounded-md border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}