import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Schedule() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60'); // in minutes
  const [image, setImage] = useState(''); // New state for image URL

  useEffect(() => {
    fetchSessions();
    if (user) {
      fetchBookmarkedSessions();
    }
  }, [user]);

  async function fetchSessions() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/sessions');
      setSessions(res.data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBookmarkedSessions() {
    try {
      const res = await axios.get('/api/sessions/bookmarks');
      setBookmarkedSessions(res.data.sessions || []);
    } catch (error) {
      console.error('Failed to load bookmarked sessions:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const sessionData = {
      title,
      description,
      speaker,
      location,
      dateTime: `${date}T${time}`,
      duration: parseInt(duration),
      image // Include image in session data
    };
    
    try {
      if (editingSession) {
        await axios.put(`/api/sessions/${editingSession._id}`, sessionData);
      } else {
        await axios.post('/api/sessions', sessionData);
      }
      
      // Reset form
      resetForm();
      setShowForm(false);
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      setError(error.response?.data?.message || 'Failed to save session');
    }
  }

  async function deleteSession(id) {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await axios.delete(`/api/sessions/${id}`);
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      setError(error.response?.data?.message || 'Failed to delete session');
    }
  }

  async function toggleBookmark(sessionId) {
    try {
      if (bookmarkedSessions.some(s => s._id === sessionId)) {
        await axios.delete(`/api/sessions/${sessionId}/bookmark`);
        setBookmarkedSessions(bookmarkedSessions.filter(s => s._id !== sessionId));
      } else {
        await axios.post(`/api/sessions/${sessionId}/bookmark`);
        const session = sessions.find(s => s._id === sessionId);
        if (session) {
          setBookmarkedSessions([...bookmarkedSessions, session]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }

  function editSession(session) {
    setEditingSession(session);
    setTitle(session.title);
    setDescription(session.description);
    setSpeaker(session.speaker);
    setLocation(session.location);
    setImage(session.image || ''); // Set image when editing
    const dateTime = new Date(session.dateTime);
    setDate(dateTime.toISOString().split('T')[0]);
    setTime(dateTime.toTimeString().slice(0, 5));
    setDuration(session.duration.toString());
    setShowForm(true);
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setSpeaker('');
    setLocation('');
    setImage('');
    setDate('');
    setTime('');
    setDuration('60');
    setEditingSession(null);
  }

  function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleString();
  }

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.dateTime).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  // Get status badge class for session status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-lg border border-indigo-100 dark:border-slate-600">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg">
            📅
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-1">
              Sessions
            </h1>
            <p className="text-gray-600 dark:text-slate-300 text-lg">
              Plan your event experience
            </p>
          </div>
        </div>
        {user?.role === 'organizer' && user?.isApproved && (
          <button 
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ${
              showForm 
                ? 'bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border-2 border-gray-300 dark:border-slate-600' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl'
            }`}
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add Session'}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-200 dark:border-red-800 shadow-lg animate-slide-up">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center mr-3">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showForm && user?.role === 'organizer' && user?.isApproved && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-3xl text-gradient flex items-center">
              <span className="mr-3 text-4xl">{editingSession ? '✏️' : '➕'}</span>
              {editingSession ? 'Edit Session' : 'Add New Session'}
            </h2>
            <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-indigo-500 to-transparent rounded-full"></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Speaker</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Poster</label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {editingSession ? 'Update Session' : 'Add Session'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-80">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">⏳</div>
          </div>
        </div>
      ) : Object.keys(groupedSessions).length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-xl p-20 text-center border border-gray-100 dark:border-slate-600">
          <div className="text-8xl mb-6 animate-bounce">📅</div>
          <h3 className="text-3xl font-bold mb-4 text-gradient">No Sessions Scheduled Yet</h3>
          <p className="text-gray-600 dark:text-slate-300 text-lg mb-8">
            {user?.role === 'organizer' 
              ? 'Add your first session using the button above.' 
              : 'Check back later for the event schedule.'}
          </p>
          {user?.role === 'organizer' && (
            <button 
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowForm(true)}
            >
              + Add First Session
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([date, sessions]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-xl font-bold pb-2 border-b border-gray-200 dark:border-slate-800">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <div 
                    key={session._id} 
                    className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-5 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center"
                  >
                    {/* Session image */}
                    {session.image && (
                      <div className="mb-4 rounded overflow-hidden">
                        <img 
                          src={session.image} 
                          alt={session.title}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{session.title}</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                          {session.speaker}
                        </p>
                      </div>
                      {user && (
                        <button
                          onClick={() => toggleBookmark(session._id)}
                          className={`text-xl ${bookmarkedSessions.some(s => s._id === session._id) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
                          aria-label={bookmarkedSessions.some(s => s._id === session._id) ? "Remove bookmark" : "Bookmark session"}
                        >
                          {bookmarkedSessions.some(s => s._id === session._id) ? '★' : '☆'}
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-slate-300 text-sm mb-4">
                      {session.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <span className="mr-2">📅</span>
                        {formatDateTime(session.dateTime)}
                        <span className="mx-2">•</span>
                        <span>{session.duration} min</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-slate-400">
                        <span className="mr-2">📍</span>
                        {session.location}
                      </div>
                    </div>
                    
                    {/* Show status badge for organizers */}
                    {user && user.role === 'organizer' && user.isApproved && (
                      <div className="mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(session.status)}`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                    )}
                    
                    {user && user.role === 'organizer' && user.isApproved && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                        <button
                          className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 rounded-full text-xs hover:bg-gray-300 dark:hover:bg-slate-600"
                          onClick={() => editSession(session)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
                          onClick={() => deleteSession(session._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {user && bookmarkedSessions.length > 0 && (
        <div className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded-lg shadow p-6 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center">
          <h2 className="font-bold text-xl mb-6">⭐ My Bookmarked Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarkedSessions.map((session) => (
              <div 
                key={session._id} 
                className="bg-[url('/white-simple-textured-design-background.jpg')] bg-cover bg-center rounded shadow p-4 dark:bg-[url('/banner.jpg')] dark:bg-cover dark:bg-center"
              >
                {/* Session image for bookmarked sessions */}
                {session.image && (
                  <div className="mb-3 rounded overflow-hidden">
                    <img 
                      src={session.image} 
                      alt={session.title}
                      className="w-full h-24 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      {session.speaker}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(session._id)}
                    className="text-amber-500 text-lg"
                    aria-label="Remove bookmark"
                  >
                    ★
                  </button>
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400 mt-2">
                  {formatDateTime(session.dateTime)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}