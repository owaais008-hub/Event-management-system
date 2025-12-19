import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Building, 
  Star, 
  Award,
  Activity,
  Calendar,
  BarChart3,
  Zap,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-toastify';

export default function PlatformStatistics() {
  const [stats, setStats] = useState({
    // Core metrics
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    totalExhibitors: 0,
    totalReviews: 0,
    totalCertificates: 0,
    
    // Activity metrics
    activeUsers: 0,
    newUsersThisMonth: 0,
    todayRegistrations: 0,
    weekRegistrations: 0,
    monthRegistrations: 0,
    todayEvents: 0,
    activeUsersToday: 0,
    
    // Trends
    userGrowth: 0,
    registrationGrowth: 0,
    eventCreationRate: 0,
    averageEventsPerUser: 0,
    
    // Real-time metrics
    registrationsLastHour: 0,
    registrationsLast5Minutes: 0,
    eventsCreatedToday: 0,
    activeUsersNow: 0,
    activeUsersLast5Minutes: 0,
    pendingApprovals: 0,
    pendingEvents: 0,
    pendingUsers: 0,
    
    // Loading and error states
    loading: true,
    error: '',
    
    // Last updated timestamp
    lastUpdated: null
  });
  
  const [trends, setTrends] = useState({
    historicalData: [],
    predictions: {
      nextWeekRegistrations: 0,
      nextWeekEvents: 0,
      growthRate: {
        registrations: 0,
        events: 0,
        users: 0
      }
    }
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const socketRef = useRef(null);
  const { user } = useAuth();

  const fetchStatistics = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [analyticsRes, realtimeRes, predictiveRes] = await Promise.all([
        axios.get('/api/stats/analytics'),
        axios.get('/api/stats/realtime'),
        axios.get('/api/stats/predictive')
      ]);
      
      setStats({
        // Core metrics
        totalEvents: analyticsRes.data.totalEvents || 0,
        totalUsers: analyticsRes.data.totalUsers || 0,
        totalRegistrations: analyticsRes.data.totalRegistrations || 0,
        totalExhibitors: analyticsRes.data.totalExhibitors || 0,
        totalReviews: analyticsRes.data.totalReviews || 0,
        totalCertificates: analyticsRes.data.totalCertificates || 0,
        
        // Activity metrics
        activeUsers: analyticsRes.data.activeUsers || 0,
        newUsersThisMonth: analyticsRes.data.newUsersThisMonth || 0,
        todayRegistrations: analyticsRes.data.todayRegistrations || 0,
        weekRegistrations: analyticsRes.data.weekRegistrations || 0,
        monthRegistrations: analyticsRes.data.monthRegistrations || 0,
        todayEvents: analyticsRes.data.todayEvents || 0,
        activeUsersToday: analyticsRes.data.activeUsersToday || 0,
        
        // Trends
        userGrowth: analyticsRes.data.trends?.userGrowth || 0,
        registrationGrowth: analyticsRes.data.trends?.registrationGrowth || 0,
        eventCreationRate: analyticsRes.data.trends?.eventCreationRate || 0,
        averageEventsPerUser: analyticsRes.data.trends?.averageEventsPerUser || 0,
        
        // Real-time metrics
        registrationsLastHour: realtimeRes.data.registrationsLastHour || 0,
        registrationsLast5Minutes: realtimeRes.data.registrationsLast5Minutes || 0,
        eventsCreatedToday: realtimeRes.data.eventsCreatedToday || 0,
        activeUsersNow: realtimeRes.data.activeUsersNow || 0,
        activeUsersLast5Minutes: realtimeRes.data.activeUsersLast5Minutes || 0,
        pendingApprovals: realtimeRes.data.pendingApprovals || 0,
        pendingEvents: realtimeRes.data.pendingEvents || 0,
        pendingUsers: realtimeRes.data.pendingUsers || 0,
        
        loading: false,
        error: '',
        lastUpdated: new Date()
      });
      
      setTrends({
        historicalData: predictiveRes.data.historicalData || [],
        predictions: predictiveRes.data.predictions || {
          nextWeekRegistrations: 0,
          nextWeekEvents: 0,
          growthRate: {
            registrations: 0,
            events: 0,
            users: 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load platform statistics. Please try again later.'
      }));
      toast.error('Failed to refresh statistics');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initialize WebSocket connection
  const initWebSocket = useCallback(() => {
    if (!user || user.role !== 'admin') return;

    try {
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/socket.io/?EIO=4&transport=websocket`);
      
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        toast.success('Real-time updates enabled');
        
        // Join admin stats room
        socket.send(JSON.stringify({ type: 'join-admin-stats' }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'realtime-stats-update') {
            setStats(prev => ({
              ...prev,
              registrationsLastHour: data.registrationsLastHour || 0,
              registrationsLast5Minutes: data.registrationsLast5Minutes || 0,
              eventsCreatedToday: data.eventsCreatedToday || 0,
              activeUsersNow: data.activeUsersNow || 0,
              activeUsersLast5Minutes: data.activeUsersLast5Minutes || 0,
              pendingApprovals: data.pendingApprovals || 0,
              pendingEvents: data.pendingEvents || 0,
              pendingUsers: data.pendingUsers || 0,
              lastUpdated: new Date(data.lastUpdated)
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        socketRef.current = null;
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        toast.error('Real-time connection error');
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchStatistics();
    
    // Initialize WebSocket for admin users
    if (user.role === 'admin') {
      initWebSocket();
    }
    
    // Set up periodic refresh every 30 seconds for real-time data
    const intervalId = setInterval(() => {
      fetchStatistics();
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(intervalId);
      
      // Clean up WebSocket connection
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user, fetchStatistics, initWebSocket]);

  const handleManualRefresh = () => {
    fetchStatistics();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Please log in to view platform statistics.
          </p>
        </div>
      </div>
    );
  }

  if (stats.loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="rounded p-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/30">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <span className="mr-2">⚠️</span>
            {stats.error}
          </div>
        </div>
      </div>
    );
  }

  // Core metrics cards
  const coreMetrics = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      change: `+${stats.eventCreationRate}%`
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: `+${stats.userGrowth}%`
    },
    {
      title: 'Registrations',
      value: stats.totalRegistrations,
      icon: FileText,
      color: 'from-emerald-500 to-teal-500',
      change: `+${stats.registrationGrowth}%`
    },
    {
      title: 'Exhibitors',
      value: stats.totalExhibitors,
      icon: Building,
      color: 'from-amber-500 to-orange-500',
      change: '+5%'
    },
    {
      title: 'Reviews',
      value: stats.totalReviews,
      icon: Star,
      color: 'from-yellow-500 to-amber-500',
      change: '+12%'
    }
  ];

  // Activity metrics cards
  const activityMetrics = [
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      description: 'Users active this week'
    },
    {
      title: 'New Users (Month)',
      value: stats.newUsersThisMonth,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      description: 'New signups this month'
    },
    {
      title: 'Today\'s Registrations',
      value: stats.todayRegistrations,
      icon: FileText,
      color: 'from-emerald-500 to-teal-500',
      description: 'Registrations today'
    },
    {
      title: 'Events Created Today',
      value: stats.todayEvents,
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      description: 'New events today'
    }
  ];

  // Real-time metrics cards
  const realtimeMetrics = [
    {
      title: 'Registrations (Last 5 Min)',
      value: stats.registrationsLast5Minutes,
      icon: Clock,
      color: 'from-red-500 to-pink-500',
      description: 'Burst activity'
    },
    {
      title: 'Active Users (Now)',
      value: stats.activeUsersLast5Minutes,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      description: 'Currently online'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      description: 'Awaiting review'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Platform Statistics</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Comprehensive insights and analytics for the event management platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className={`${
              connectionStatus === 'connected' ? 'text-green-600 dark:text-green-400' :
              connectionStatus === 'error' ? 'text-red-600 dark:text-red-400' :
              'text-gray-500 dark:text-gray-400'
            }`}>
              {connectionStatus === 'connected' ? 'Live' : 
               connectionStatus === 'error' ? 'Connection Error' : 
               'Disconnected'}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {stats.lastUpdated ? stats.lastUpdated.toLocaleTimeString() : 'Never'}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Core Metrics */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Core Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden h-full">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${metric.color} opacity-10 rounded-full -mr-12 -mt-12`}></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="success">
                      {metric.change}
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {(metric.value ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Activity Metrics */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Activity Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activityMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} shadow`}>
                      <metric.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {(metric.value ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{metric.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Real-time Metrics */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Real-time Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {realtimeMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} shadow`}>
                      <metric.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {(metric.value ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{metric.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Predictive Analytics */}
      {trends.predictions && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Predictive Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Next Week Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span>Registrations</span>
                  <span className="font-bold">{(trends.predictions.nextWeekRegistrations ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span>Events</span>
                  <span className="font-bold">{(trends.predictions.nextWeekEvents ?? 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Growth Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span>Registrations Growth</span>
                  <span className="font-bold">{Number(trends.predictions.growthRate.registrations ?? 0).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <span>Events Growth</span>
                  <span className="font-bold">{Number(trends.predictions.growthRate.events ?? 0).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <span>Users Growth</span>
                  <span className="font-bold">{Number(trends.predictions.growthRate.users ?? 0).toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}