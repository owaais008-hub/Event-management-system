import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import EventCard from '../components/EventCard.jsx';

export default function RejectedEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/events', { params: { status: 'rejected' } });
      setEvents(res.data.events || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rejected events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    load();
  }, [user, navigate, load]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">Rejected Events History</h1>
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-200">{error}</div>
      )}
      {loading ? (
        <div className="text-gray-600 dark:text-slate-300">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-gray-600 dark:text-slate-300">No rejected events.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map(e => (
            <EventCard key={e._id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}


