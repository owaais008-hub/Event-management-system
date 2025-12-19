import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Skeleton } from './ui/Skeleton';
import { TrendingUp, TrendingDown, Users, Calendar, Ticket, Building2 } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    totalExhibitors: 0,
    popularEvents: [],
    userEngagement: [],
    boothTraffic: [],
    eventTrends: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/stats/analytics?days=${timeRange}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Analytics API error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Total Events',
      value: analytics.totalEvents || 0,
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers || 0,
      icon: Users,
      gradient: 'from-emerald-500 to-teal-500',
      change: '+8%'
    },
    {
      title: 'Registrations',
      value: analytics.totalRegistrations || 0,
      icon: Ticket,
      gradient: 'from-purple-500 to-pink-500',
      change: '+15%'
    },
    {
      title: 'Exhibitors',
      value: analytics.totalExhibitors || 0,
      icon: Building2,
      gradient: 'from-amber-500 to-orange-500',
      change: '+5%'
    }
  ];

  const popularEventsData = (analytics.popularEvents || []).slice(0, 5).map(event => ({
    name: event.title?.substring(0, 20) + (event.title?.length > 20 ? '...' : ''),
    registrations: event.registrationCount || 0
  }));

  const categoryData = (analytics.popularEvents || []).reduce((acc, event) => {
    const cat = event.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      {/* Header with Time Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Analytics Overview</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your platform performance</p>
        </div>
        <select 
          className="px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Events Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Popular Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularEventsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularEventsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    stroke="#6b7280"
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="registrations" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Events by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.popularEvents?.length > 0 ? (
            <div className="space-y-3">
              {analytics.popularEvents.slice(0, 5).map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                      'bg-gradient-to-br from-indigo-500 to-purple-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{event.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.category} • {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                      {event.registrationCount || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">registrations</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No event data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
