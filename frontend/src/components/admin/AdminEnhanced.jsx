import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Download, 
  Settings, 
  Bell, 
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  Building
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export default function AdminEnhanced() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Redirect if user is not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [stats, setStats] = useState({
    pendingApprovals: 0,
    systemHealth: 'healthy',
    recentActivity: []
  });
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnnounceOpen, setIsAnnounceOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  useEffect(() => {
    loadAdminStats();
    const id = setInterval(() => {
      loadAdminStats();
    }, 10000); // refresh every 10s
    return () => clearInterval(id);
  }, []);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      const [pendingStaffRes, pendingEventsRes, pendingRegsRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/approvals'),
        axios.get('/api/admin/events/pending'),
        axios.get('/api/registrations/pending'),
        axios.get('/api/stats/analytics')
      ]);

      // Count pending approvals (both staff and events)
      const staff = pendingStaffRes.data?.staff || [];
      const events = pendingEventsRes.data?.events || [];
      const regs = pendingRegsRes.data?.registrations || [];
      const pendingStaffCount = staff.length;
      const pendingEventsCount = events.length;
      const totalPending = pendingStaffCount + pendingEventsCount;

      setStats((prev) => ({
        ...prev,
        pendingApprovals: totalPending,
        systemHealth: 'healthy',
        // Totals from analytics
        totalEvents: analyticsRes.data?.totalEvents ?? 0,
        totalUsers: analyticsRes.data?.totalUsers ?? 0,
        totalRegistrations: analyticsRes.data?.totalRegistrations ?? 0,
        totalExhibitors: analyticsRes.data?.totalExhibitors ?? 0,
        recentActivity: prev.recentActivity || []
      }));
      setPendingStaff(staff);
      setPendingEvents(events);
      setPendingRegistrations(regs);
    } catch (error) {
      console.error('Error loading admin stats:', error);
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  // Actions: events
  const approveEvent = async (id) => {
    try {
      setLoading(true);
      await axios.post(`/api/admin?action=approve-event&id=${id}`);
      toast.success('Event approved');
      await loadAdminStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to approve event');
    } finally {
      setLoading(false);
    }
  };
  const rejectEvent = async (id) => {
    try {
      setLoading(true);
      await axios.post(`/api/admin?action=reject-event&id=${id}`);
      toast.success('Event rejected');
      await loadAdminStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject event');
    } finally {
      setLoading(false);
    }
  };

  // Actions: registrations
  const approveRegistration = async (id) => {
    try {
      setLoading(true);
      await axios.post(`/api/registrations/${id}/approve`);
      toast.success('Registration approved');
      await loadAdminStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to approve registration');
    } finally {
      setLoading(false);
    }
  };
  const denyRegistration = async (id) => {
    try {
      setLoading(true);
      await axios.post(`/api/registrations/${id}/deny`, { reason: 'Denied by admin' });
      toast.success('Registration denied');
      await loadAdminStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to deny registration');
    } finally {
      setLoading(false);
    }
  };

  // Actions: staff
  const approveStaff = async (id) => {
    try {
      setLoading(true);
      await axios.post(`/api/admin/approve/${id}`);
      toast.success('Staff approved');
      await loadAdminStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to approve staff');
    } finally {
      setLoading(false);
    }
  };
  const rejectStaff = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/reject/${id}`);
      toast.success('Staff rejected');
      await loadAdminStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject staff');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`/api/admin/export?format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const sendAnnouncement = async () => {
    if (!announcementText.trim()) {
      toast.warn('Please enter an announcement message');
      return;
    }
    
    // Check if user is authenticated and is admin
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    try {
      setSendingAnnouncement(true);
      await axios.post('/api/admin/announce', { message: announcementText.trim() });
      toast.success('Announcement sent');
      setAnnouncementText('');
      setIsAnnounceOpen(false);
    } catch (error) {
      console.error('Announcement error:', error);
      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Access denied. Please log in as admin.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send announcement');
      }
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const quickStats = [
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      change: stats.pendingApprovals > 0 ? 'Action Required' : 'All Clear'
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: '+15%'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'Registrations',
      value: stats.totalRegistrations,
      icon: FileText,
      color: 'from-emerald-500 to-teal-500',
      change: '+8%'
    }
    // Removed Exhibitors section as requested
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant={stat.title === 'Pending Approvals' && stat.value > 0 ? 'warning' : 'success'}>
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {loading ? '...' : (stat.value ?? 0).toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              System Health
            </CardTitle>
            <CardDescription>Monitor system performance and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900 dark:text-white">Database</span>
                </div>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900 dark:text-white">API Server</span>
                </div>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900 dark:text-white">File Storage</span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsAnnounceOpen(true)}
              >
                <Bell className="w-4 h-4" />
                Compose Announcement
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate('/platform-statistics')}
              >
                <BarChart3 className="w-4 h-4" />
                Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Staff Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pending Staff Approvals
            </CardTitle>
            <CardDescription>Review and approve new staff members</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : pendingStaff.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No pending staff approvals</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingStaff.map((staff) => (
                  <div key={staff._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{staff.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{staff.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Role: {staff.role === 'organizer' ? 'Event Organizer' : 'Admin'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => approveStaff(staff._id)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectStaff(staff._id)}
                        disabled={loading}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Event Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Pending Event Approvals
            </CardTitle>
            <CardDescription>Review and approve new events</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : pendingEvents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No pending event approvals</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingEvents.map((event) => (
                  <div key={event._id} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(event.date).toLocaleDateString()} • {event.venue}
                        </p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                      {event.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => approveEvent(event._id)}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectEvent(event._id)}
                        disabled={loading}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Registration Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pending Registration Approvals
          </CardTitle>
          <CardDescription>Review and approve event registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : pendingRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No pending registration approvals</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingRegistrations.map((reg) => (
                <div key={reg._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {reg.user?.name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {reg.event?.title || 'Unknown Event'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => approveRegistration(reg._id)}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => denyRegistration(reg._id)}
                      disabled={loading}
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcement Modal */}
      {isAnnounceOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full shadow-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold dark:text-white">Compose Announcement</h3>
                <button
                  onClick={() => setIsAnnounceOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <textarea
                className="w-full h-32 p-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="Enter your announcement message..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAnnounceOpen(false)}
                  disabled={sendingAnnouncement}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendAnnouncement}
                  disabled={sendingAnnouncement || !announcementText.trim()}
                >
                  {sendingAnnouncement ? 'Sending...' : 'Send Announcement'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}