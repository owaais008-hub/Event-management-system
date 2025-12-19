import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export default function usePlatformStats() {
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTotals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/stats/summary');
      setTotals(res.data.totals || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load stats');
      setTotals({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  return { totals, loading, error, refresh: fetchTotals };
}


