import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import Notifications from './components/Notifications.jsx';
import { Moon, Sun, Menu, X } from 'lucide-react';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home.jsx'));
const EventDetails = lazy(() => import('./pages/EventDetails.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Pass = lazy(() => import('./pages/Pass.jsx'));
const PasswordReset = lazy(() => import('./pages/PasswordReset.jsx'));
const Schedule = lazy(() => import('./pages/Schedule.jsx'));
const ExhibitorPortal = lazy(() => import('./pages/ExhibitorPortal.jsx'));
const ExhibitorProfile = lazy(() => import('./pages/ExhibitorProfile.jsx'));
const Statistics = lazy(() => import('./pages/Statistics.jsx'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const ExhibitorManagement = lazy(() => import('./pages/ExhibitorManagement.jsx'));
const BoothManagement = lazy(() => import('./pages/BoothManagement.jsx'));
const Communications = lazy(() => import('./pages/Communications.jsx'));
const RoleAccess = lazy(() => import('./pages/RoleAccess.jsx'));
const RejectedEvents = lazy(() => import('./pages/RejectedEvents.jsx'));
const PlatformStatistics = lazy(() => import('./pages/PlatformStatistics.jsx'));
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useEffect, useState } from 'react';

// Enhanced animated background effect
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden">
    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20 dark:opacity-10">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-1/3 left-2/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-2/3 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>
  </div>
);

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  // If no roles specified, allow access
  if (!roles || roles.length === 0) return children;
  
  // Check if user's role is allowed for this route
  const isAllowed = roles.includes(user.role);
  
  // If user is a student trying to access a restricted route, redirect them to home
  if (!isAllowed && user.role === 'student') {
    return <Navigate to="/" replace />;
  }
  
  // For other roles, redirect to home if not allowed
  if (!isAllowed) return <Navigate to="/" replace />;
  
  return children;
}

function useTheme() {
  const getInitial = () => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [theme, setTheme] = useState(getInitial);
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') { root.classList.add('dark'); body && body.classList.add('dark'); }
    else { root.classList.remove('dark'); body && body.classList.remove('dark'); }
    localStorage.setItem('theme', theme);
  }, [theme]);
  return { theme, setTheme };
}

// Sidebar Component
function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-white/30 dark:border-slate-700/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-thin ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            {user && user.role !== 'visitor' && (
              <>
                <Link
                  to="/statistics"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === '/statistics'
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-600/50'
                  }`}
                >
                  <span className="text-xl">📊</span>
                  <span className="font-medium">Statistics</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/platform-statistics"
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      location.pathname === '/platform-statistics'
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-600/50'
                    }`}
                  >
                    <span className="text-xl">📈</span>
                    <span className="font-medium">Platform Statistics</span>
                  </Link>
                )}
                <Link
                  to="/feedback"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === '/feedback'
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-600/50'
                  }`}
                >
                  <span className="text-xl">💬</span>
                  <span className="font-medium">Feedback</span>
                </Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <Link
                to="/events/rejected"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === '/events/rejected'
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-600/50'
                }`}
              >
                <span className="text-xl">🗑️</span>
                <span className="font-medium">Rejected Events</span>
              </Link>
            )}
            {user && (
              <Link
                to="/role-access"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === '/role-access'
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-600/50'
                }`}
              >
                <span className="text-xl">🔐</span>
                <span className="font-medium">Roles & Access</span>
              </Link>
            )}
            {user && user.role !== 'visitor' && (
              <Link
                to="/communications"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === '/communications'
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-600/50'
                }`}
              >
                <span className="text-xl">📨</span>
                <span className="font-medium">Communications</span>
              </Link>
            )}
            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <>
                <Link
                  to="/exhibitors-management"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === '/exhibitors-management'
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-600/50'
                  }`}
                >
                  <span className="text-xl">🏢</span>
                  <span className="font-medium">Exhibitors</span>
                </Link>
                <Link
                  to="/booths-management"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === '/booths-management'
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-600/50'
                  }`}
                >
                  <span className="text-xl">🏪</span>
                  <span className="font-medium">Booths</span>
                </Link>
              </>
            )}
          </nav>

          {/* Footer */}
          {user && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 mx-0 sm:mx-0 transition-all duration-300 hover:shadow-3xl rounded-none sm:rounded-none backdrop-blur-xl border-b border-white/30 dark:border-slate-700/50 shadow-lg bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 min-w-0">
            <img 
              src="/college-logo-design-template-vector-600nw-2553811015.webp" 
              alt="College Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain rounded-full mr-2 sm:mr-3"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
              Event Management System
            </span>
          </Link>

          {/* Desktop Main Navigation - Only essential links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm flex-1 justify-center" role="navigation" aria-label="Main navigation">
            <Link to="/" className={`px-3 xl:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              location.pathname==='/'?'bg-white dark:bg-slate-800 font-semibold backdrop-blur-xl shadow-lg border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'
            }`}>
              Home
            </Link>
            <Link to="/sessions" className={`px-3 xl:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              location.pathname==='/sessions'?'bg-white dark:bg-slate-800 font-semibold backdrop-blur-xl shadow-lg border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'
            }`}>
              Sessions
            </Link>
            <Link to="/about" className={`px-3 xl:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              location.pathname==='/about'?'bg-white dark:bg-slate-800 font-semibold backdrop-blur-xl shadow-lg border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'
            }`}>
              About
            </Link>
            <Link to="/contact" className={`px-3 xl:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              location.pathname==='/contact'?'bg-white dark:bg-slate-800 font-semibold backdrop-blur-xl shadow-lg border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'
            }`}>
              Contact
            </Link>
            <Link to="/exhibitors" className={`px-3 xl:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
              location.pathname==='/exhibitors'?'bg-white dark:bg-slate-800 font-semibold backdrop-blur-xl shadow-lg border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'
            }`}>
              Exhibitors
            </Link>
            {user && user.role !== 'visitor' && (
              <Link to="/dashboard" className={`px-3 xl:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                location.pathname.startsWith('/dashboard')?'bg-white dark:bg-slate-800 font-semibold backdrop-blur-xl shadow-lg border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'
              }`}>
                Dashboard
              </Link>
            )}
            {user && (
              <Link to="/profile" className={`px-3 xl:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                location.pathname==='/profile'?'bg-white dark:bg-slate-800 font-semibold backdrop-blur-xl shadow-lg border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'
              }`}>
                Profile
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden input px-2 sm:px-3 py-2 rounded-full shadow-md hover:shadow-lg bg-white/80 dark:bg-slate-700/80 text-sm border border-white/50 dark:border-slate-600/50 hover:bg-white/90 dark:hover:bg-slate-700/90 transition-all duration-300 text-gray-800 dark:text-slate-200"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="text-gray-800 dark:text-slate-200">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>

            {/* Sidebar toggle button - Only show if user is logged in */}
            {user && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex items-center justify-center px-3 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-white/50 dark:border-slate-600/50 hover:bg-white/90 dark:hover:bg-slate-700/90 text-gray-800 dark:text-slate-200"
                aria-label="Open sidebar"
              >
                <span className="text-lg">☰</span>
              </button>
            )}

            {/* Notifications */}
            {user && <Notifications />}

            {/* Auth Buttons / Logout */}
            {user ? (
              <button
                onClick={logout}
                className="btn-primary btn-xs sm:btn-sm btn-rounded shadow-lg hover:shadow-xl hidden sm:inline-flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border border-indigo-700/50 dark:border-indigo-500/50"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-outline btn-xs sm:btn-sm btn-rounded shadow-md hover:shadow-lg hidden sm:inline-flex border border-white/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-700/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-gray-800 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary btn-xs sm:btn-sm btn-rounded shadow-lg hover:shadow-xl hidden sm:inline-flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border border-indigo-700/50 dark:border-indigo-500/50"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <button
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="input px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-white/50 dark:border-slate-600/50 hover:bg-white/90 dark:hover:bg-slate-700/90 text-gray-800 dark:text-slate-200"
              onClick={()=>{
                const next = theme==='dark' ? 'light' : 'dark';
                const root = document.documentElement; const body = document.body;
                if (next==='dark') { root.classList.add('dark'); body && body.classList.add('dark'); }
                else { root.classList.remove('dark'); body && body.classList.remove('dark'); }
                localStorage.setItem('theme', next);
                setTheme(next);
              }}
            >
              <span className="hidden sm:inline whitespace-nowrap">{theme==='dark'?'🌙 Dark':'☀️ Light'}</span>
              <span className="sm:hidden">{theme==='dark'?'🌙':'☀️'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/30 dark:border-slate-700/50 px-4 pb-4 pt-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl">
            <div className="flex flex-col gap-2">
              <Link onClick={()=>setMobileMenuOpen(false)} to="/" className={`px-4 py-2 rounded-xl transition-all ${location.pathname==='/'?'bg-white dark:bg-slate-700 font-semibold border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'}`}>Home</Link>
              <Link onClick={()=>setMobileMenuOpen(false)} to="/sessions" className={`px-4 py-2 rounded-xl transition-all ${location.pathname==='/sessions'?'bg-white dark:bg-slate-700 font-semibold border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'}`}>Sessions</Link>
              <Link onClick={()=>setMobileMenuOpen(false)} to="/about" className={`px-4 py-2 rounded-xl transition-all ${location.pathname==='/about'?'bg-white dark:bg-slate-700 font-semibold border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'}`}>About</Link>
              <Link onClick={()=>setMobileMenuOpen(false)} to="/contact" className={`px-4 py-2 rounded-xl transition-all ${location.pathname==='/contact'?'bg-white dark:bg-slate-700 font-semibold border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'}`}>Contact</Link>
              <Link onClick={()=>setMobileMenuOpen(false)} to="/exhibitors" className={`px-4 py-2 rounded-xl transition-all ${location.pathname==='/exhibitors'?'bg-white dark:bg-slate-700 font-semibold border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'}`}>Exhibitors</Link>
              {user && user.role !== 'visitor' && (
                <Link onClick={()=>setMobileMenuOpen(false)} to="/dashboard" className={`px-4 py-2 rounded-xl transition-all ${location.pathname.startsWith('/dashboard')?'bg-white dark:bg-slate-700 font-semibold border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'}`}>Dashboard</Link>
              )}
              {user && (
                <>
                  <Link onClick={()=>setMobileMenuOpen(false)} to="/profile" className={`px-4 py-2 rounded-xl transition-all ${location.pathname==='/profile'?'bg-white dark:bg-slate-700 font-semibold border border-white/50 dark:border-slate-600/50 text-gray-800 dark:text-slate-200':'hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-slate-600/30 text-gray-700 dark:text-slate-300'}`}>Profile</Link>
                  <button onClick={()=>{ setMobileMenuOpen(false); setSidebarOpen(true); }} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border border-indigo-700/50 dark:border-indigo-500/50 hover:from-indigo-700 hover:to-purple-700">More Options</button>
                </>
              )}
              {!user && (
                <>
                  <Link onClick={()=>setMobileMenuOpen(false)} to="/login" className="px-4 py-2 rounded-xl border border-white/50 dark:border-slate-600/50 bg-white/80 dark:bg-slate-700/80 hover:bg-white/90 dark:hover:bg-slate-700/90 text-gray-800 dark:text-slate-200">Login</Link>
                  <Link onClick={()=>setMobileMenuOpen(false)} to="/signup" className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border border-indigo-700/50 dark:border-indigo-500/50 hover:from-indigo-700 hover:to-purple-700">Sign up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

function Layout({ children }) {
  const location = useLocation();
  // Slideshow images array
  const slideshowImages = [
    '/stopwatch-3699314_1920.jpg',
    '/event conference.jpg',
    '/photography.jpg',
    '/tech-event.jpg',
    '/sports-event.jpg',
    '/cultural-event.jpg',
    '/workshop-event.jpg',
    '/conference-event.jpg',
    '/football.jpg',
    '/yoga.jpg',
    '/hackathon.avif'
  ];

  // Check if we're on login or signup page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    // Simplified layout for auth pages with just navbar and content
    return (
      <div className="min-h-screen bg-neutral-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col relative">
        {/* Animated background effect */}
        <AnimatedBackground />
        
        {/* Light mode background */}
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat dark:hidden" 
             style={{backgroundImage: 'url("/white image.jpeg")', backgroundSize: 'cover', backgroundPosition: 'center center'}}></div>
        
        {/* Dark mode background with cards theme */}
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat hidden dark:block" 
             style={{backgroundImage: 'url("/dark-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center center'}}></div>
        
        {/* Enhanced overlay for better contrast */}
        <div className="fixed inset-0 bg-white/20 dark:bg-slate-900/60"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-4 pt-20 sm:pt-24">
            {children}
          </main>
          
          {/* Footer with FLUX SOLUTION software house info */}
          <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="/flux-solution-logo.png" 
                    alt="FLUX SOLUTION Logo" 
                    className="h-10 w-10 object-contain rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="text-base font-bold text-slate-800 dark:text-white">Powered by FLUX SOLUTION</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    © {new Date().getFullYear()} FLUX SOLUTION. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Full layout for other pages
  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Animated background effect */}
      <AnimatedBackground />
      
      {/* Light mode background */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat dark:hidden" 
           style={{backgroundImage: 'url("/white image.jpeg")', backgroundSize: 'cover', backgroundPosition: 'center center'}}></div>
      
      {/* Dark mode background with cards theme */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat hidden dark:block" 
           style={{backgroundImage: 'url("/dark-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center center'}}></div>
      
      {/* Enhanced overlay for better contrast */}
      <div className="fixed inset-0 bg-white/20 dark:bg-slate-900/60"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
        <Navbar />
        <section className="border-b border-slate-200 dark:border-slate-800 relative overflow-hidden py-16 w-full mt-16 sm:mt-20">
          {/* Gradient overlay with image slideshow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 dark:from-indigo-500/5 dark:to-emerald-500/5">
            <Slideshow images={slideshowImages} />
          </div>
          <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 w-full">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-emerald-700 bg-clip-text text-transparent dark:from-indigo-300 dark:to-emerald-300 mb-6 animate-fade-in-down">
                Discover and Manage Events
              </h1>
              <p className="text-slate-800 dark:text-slate-300 mt-2 max-w-2xl mx-auto text-xl animate-fade-in-up">
                Register, organize, review, and track your event participation.
              </p>
            </div>
          </div>
        </section>
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full overflow-x-hidden pt-4">
          {children}
        </main>
        
        {/* Footer with FLUX SOLUTION software house info */}
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/flux-solution-logo.png" 
                  alt="FLUX SOLUTION Logo" 
                  className="h-12 w-12 object-contain rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">Powered by FLUX SOLUTION</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  © {new Date().getFullYear()} FLUX SOLUTION. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Add custom styles for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}} />
    </div>
  );
}

// Slideshow component for rotating images
const Slideshow = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Only start the slideshow if there are images
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Don't render slideshow if no images
  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out transform ${
            index === currentIndex 
              ? 'opacity-30 scale-110' 
              : 'opacity-0 scale-100'
          }`}
          style={{ 
            backgroundImage: `url("${image}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      ))}
    </div>
  );
};

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <motion.div 
    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="text-center">
      <motion.div
        className="relative w-20 h-20 mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full"></div>
      </motion.div>
      <motion.p
        className="text-gray-600 dark:text-gray-400 text-lg font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Loading...
      </motion.p>
    </div>
  </motion.div>
);

// Session checking component
const SessionChecker = ({ children }) => {
  const { initialSessionChecked } = useAuth();
  
  // Show loading spinner while checking initial session
  if (!initialSessionChecked) {
    return <LoadingSpinner />;
  }
  
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SessionChecker>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/sessions" element={<Schedule />} />
                  <Route path="/schedule" element={<Navigate to="/sessions" replace />} />
                  <Route path="/exhibitors" element={<ExhibitorPortal />} />
                  <Route path="/exhibitors/:id" element={<ExhibitorProfile />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/statistics" element={<PrivateRoute roles={["student","organizer","admin"]}><Statistics /></PrivateRoute>} />
                  <Route path="/platform-statistics" element={<PrivateRoute roles={["admin"]}><PlatformStatistics /></PrivateRoute>} />
                  <Route path="/feedback" element={<PrivateRoute roles={["student","organizer","admin"]}><FeedbackPage /></PrivateRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<PasswordReset />} />
                  <Route path="/pass" element={<PrivateRoute roles={["student","organizer","admin"]}><Pass /></PrivateRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/profile" element={<PrivateRoute roles={["student","organizer","admin"]}><Profile /></PrivateRoute>} />
                  <Route path="/exhibitors-management" element={<PrivateRoute roles={["organizer","admin"]}><ExhibitorManagement /></PrivateRoute>} />
                  <Route path="/booths-management" element={<PrivateRoute roles={["organizer","admin"]}><BoothManagement /></PrivateRoute>} />
                  <Route path="/communications" element={<PrivateRoute roles={["student","organizer","admin"]}><Communications /></PrivateRoute>} />
                  <Route path="/role-access" element={<RoleAccess />} />
                  <Route path="/events/rejected" element={<PrivateRoute roles={["admin"]}><RejectedEvents /></PrivateRoute>} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute roles={["student","organizer","admin"]}>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </Layout>
        </SessionChecker>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          className="mt-20"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
