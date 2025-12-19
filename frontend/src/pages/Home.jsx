import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import useSocket from '../hooks/useSocket.js';
import Sitemap from '../components/Sitemap.jsx';
import EventCard from '../components/EventCard.jsx';
import ImageCarousel from '../components/ImageCarousel.jsx';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [showSitemap, setShowSitemap] = useState(false);
  const categories = ['All','Tech','Sports','Cultural','Workshop'];
  const { announcements } = useSocket(window.location.origin);
  const { user } = useAuth();

  const fetchEvents = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError('');
    try {
      const effQ = overrides.q !== undefined ? overrides.q : q;
      const effCategory = overrides.category !== undefined ? overrides.category : category;
      const params = {};
      if (effQ) params.q = effQ;
      if (effCategory) params.category = effCategory;
      // Home should only show approved events, even for admin
      params.status = 'approved';
      // Show all approved events including past ones (no date filter)
      // This allows users to see events they registered for even if they've passed
      params.dateFrom = '2020-01-01'; // Set a far past date to show all events
      const res = await axios.get('/api/events', { params });
      setEvents(res.data.events || []);
    } catch (error) {
      if (error.response) {
        setError(`Failed to load events (${error.response.status}): ${error.response.data?.message || 'Unknown error'}. Please ensure the backend is running.`);
      } else if (error.request) {
        setError('Failed to load events: No response from server. Please ensure the backend is running.');
      } else {
        setError(`Failed to load events: ${error.message}. Please ensure the backend is running.`);
      }
    } finally {
      setLoading(false);
    }
  }, [q, category]);

  const fetchRecs = useCallback(async () => {
    try {
      const res = await axios.get('/api/stats/recommendations');
      setRecs(res.data.events || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Silently handle recommendation loading errors
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (user) fetchRecs();
    else setRecs([]);
  }, [user, fetchRecs]);

  const Skeleton = () => (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-white/30 dark:border-slate-700/60 animate-pulse">
      <div className="h-56 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700" />
      <div className="p-5">
        <div className="h-7 bg-gray-200 dark:bg-slate-700 w-4/5 rounded-xl mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 w-2/3 rounded-lg mb-5"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 w-full rounded-lg mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 w-3/4 rounded-lg mb-5"></div>
        <div className="space-y-2.5 mb-5">
          <div className="h-10 bg-gray-200 dark:bg-slate-700 w-full rounded-lg"></div>
          <div className="h-10 bg-gray-200 dark:bg-slate-700 w-full rounded-lg"></div>
        </div>
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 w-full rounded-xl"></div>
      </div>
    </div>
  );

  const StatCard = null;

  return (
    <div className="space-y-8">
      {/* Enhanced Hero Section */}
      <section className="relative text-center py-20 md:py-28 overflow-hidden">
        {/* Animated background with multiple layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-xl animate-float animation-delay-4000"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-lg animate-float animation-delay-1000"></div>
        </div>

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main heading with enhanced typography */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-4 animate-fade-in-up px-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                Events
              </span>
            </h1>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full animate-fade-in-up animation-delay-300"></div>
          </div>

          {/* Subtitle with better spacing */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed font-medium animate-fade-in-up animation-delay-600 px-4">
            Discover, register, and participate in extraordinary events. Your gateway to managing and attending
            <span className="text-indigo-600 dark:text-indigo-400 font-bold"> unforgettable experiences</span> and creating
            <span className="text-purple-600 dark:text-purple-400 font-bold"> lifelong memories</span>.
          </p>

          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in-up animation-delay-900 px-4">
            {!user && (
            <Link
              to="/signup"
                className="group relative px-6 sm:px-8 md:px-10 py-4 sm:py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center">
                  <span className="mr-2 text-lg sm:text-xl">🎪</span>
                Explore Events
                  <span className="ml-2 text-lg sm:text-xl">✨</span>
              </span>
            </Link>
            )}
            <button
              onClick={() => setShowSitemap(!showSitemap)}
              className="group relative px-6 sm:px-8 md:px-10 py-4 sm:py-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-indigo-200 dark:border-slate-600 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 text-sm sm:text-base"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2 text-lg sm:text-xl group-hover:rotate-12 transition-transform duration-300">🗺️</span>
                <span className="hidden sm:inline">{showSitemap ? 'Hide Sitemap' : 'Explore Features'}</span>
                <span className="sm:hidden">{showSitemap ? 'Hide' : 'Features'}</span>
              </span>
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-indigo-300 dark:border-slate-500 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-indigo-500 dark:bg-slate-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Custom animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradient-x {
            0%, 100% { background-size: 200% 200%; background-position: left center; }
            50% { background-size: 200% 200%; background-position: right center; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(120deg); }
            66% { transform: translateY(10px) rotate(240deg); }
          }
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-gradient-x { animation: gradient-x 3s ease infinite; }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
          .animation-delay-300 { animation-delay: 0.3s; }
          .animation-delay-600 { animation-delay: 0.6s; }
          .animation-delay-900 { animation-delay: 0.9s; }
          .animation-delay-1000 { animation-delay: 1s; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}} />
      </section>

      {/* Sitemap Section */}
      {showSitemap && (
        <section className="mb-12">
          <Sitemap />
        </section>
      )}

      {/* Platform Statistics moved to dedicated page: /platform-statistics */}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-white/10 mx-4 sm:mx-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center">
            <span className="mr-2">📢</span> Latest Announcements
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {announcements.slice(0, 3).map((a, i) => (
              <div key={i} className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-lg border border-white/10">
                <p className="mb-2 text-sm sm:text-base">{a.message}</p>
                <p className="text-xs sm:text-sm opacity-90 font-medium">
                  {new Date(a.at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Image Carousel Section */}
      <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <ImageCarousel 
          autoPlay={true} 
          interval={5000}
          title="Featured Event Moments"
        />
      </section>

      {/* Recommendations */}
      {user && recs.length > 0 && (
        <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 dark:text-white">Recommended Events For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {recs.slice(0, 4).map((e, index) => <EventCard key={e._id} event={e} index={index} />)}
          </div>
        </section>
      )}

      {/* All Events */}
      <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold dark:text-white">Browse All Events</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full sm:w-48 md:w-56 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
            <select
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c === 'All' ? '' : c}>{c}</option>
              ))}
            </select>
            <button
              className="group relative w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl font-bold transform hover:scale-105 hover:-translate-y-0.5 overflow-hidden text-sm sm:text-base"
              onClick={() => fetchEvents()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center">
                <span className="mr-2 text-base sm:text-lg">🔍</span>
                Search
                <span className="ml-2 text-base sm:text-lg group-hover:rotate-12 transition-transform duration-300">✨</span>
              </span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-200 dark:border-red-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg animate-slide-up">
            <div className="flex items-start sm:items-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-500 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-lg">
                <span className="text-lg sm:text-xl">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-red-800 dark:text-red-200 font-bold text-base sm:text-lg mb-1">Connection Error</h3>
                <p className="text-red-700 dark:text-red-300 font-medium text-sm sm:text-base break-words">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl sm:rounded-2xl px-4">
            <div className="text-5xl sm:text-6xl mb-4">🎪</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 dark:text-white">No Events Found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              {q || category 
                ? 'Try adjusting your search criteria' 
                : 'Check back later for upcoming events'}
            </p>
            {!q && !category && user && (user.role === 'organizer' || user.role === 'admin') && (
              <Link
                to="/dashboard"
                className="group relative inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  <span className="mr-3 text-xl">🎪</span>
                  Create Your First Event
                  <span className="ml-3 text-xl group-hover:rotate-12 transition-transform duration-300">✨</span>
                </span>
              </Link>
            )}
            {!q && !category && !user && (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Want to organize an event? 
                </p>
                <Link
                  to="/signup"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up as Organizer
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {events.map((e, index) => <EventCard key={e._id} event={e} index={index} />)}
          </div>
        )}
      </section>
    </div>
  );
}