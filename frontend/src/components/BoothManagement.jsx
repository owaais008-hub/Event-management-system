import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function BoothManagement({ eventId }) {
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBooths = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/booths/event/${eventId}`);
      setBooths(res.data.booths || []);
    } catch (err) {
      console.error('Failed to load booth information:', err);
      setError('Failed to load booth information');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchBooths();
    }
  }, [eventId, fetchBooths]);

  async function selectBooth(boothId) {
    try {
      await axios.post(`/api/booths/${boothId}/select`);
      setSelectedBooth(boothId);
      fetchBooths(); // Refresh booth data
    } catch (err) {
      console.error('Failed to select booth:', err);
      setError(err.response?.data?.message || 'Failed to select booth');
    }
  }

  async function releaseBooth(boothId) {
    try {
      await axios.post(`/api/booths/${boothId}/release`);
      setSelectedBooth(null);
      fetchBooths(); // Refresh booth data
    } catch (err) {
      console.error('Failed to release booth:', err);
      setError(err.response?.data?.message || 'Failed to release booth');
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading booth information...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
        {error}
      </div>
    );
  }

  // Group booths by row for better visualization
  const groupedBooths = booths.reduce((groups, booth) => {
    if (!groups[booth.row]) {
      groups[booth.row] = [];
    }
    groups[booth.row].push(booth);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Booth Selection</h2>
      
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h3 className="font-medium mb-3">Event Floor Plan</h3>
        
        {Object.keys(groupedBooths).length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No booths available for this event.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedBooths).map(([row, boothsInRow]) => (
              <div key={row} className="flex flex-wrap gap-2">
                <div className="w-16 py-2 text-center font-medium text-slate-600 dark:text-slate-400">
                  Row {row}
                </div>
                <div className="flex flex-wrap gap-2">
                  {boothsInRow.map((booth) => (
                    <button
                      key={booth._id}
                      className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium transition-all ${
                        booth.isReserved
                          ? booth.reservedByMe
                            ? 'bg-green-100 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-200 cursor-not-allowed'
                          : selectedBooth === booth._id
                            ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-800 dark:text-blue-200'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:shadow'
                      }`}
                      onClick={() => {
                        if (!booth.isReserved) {
                          selectBooth(booth._id);
                        } else if (booth.reservedByMe) {
                          releaseBooth(booth._id);
                        }
                      }}
                      disabled={booth.isReserved && !booth.reservedByMe}
                    >
                      <span className="font-bold">{booth.number}</span>
                      <span className="text-xs mt-1">
                        {booth.isReserved 
                          ? booth.reservedByMe 
                            ? 'My Booth' 
                            : 'Taken'
                          : 'Available'
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedBooth && (
        <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
            Booth Selected Successfully!
          </h3>
          <p className="text-green-700 dark:text-green-300 text-sm">
            You have selected booth #{booths.find(b => b._id === selectedBooth)?.number}. 
            You can customize your booth details in the exhibitor portal.
          </p>
        </div>
      )}
      
      <div className="text-sm text-slate-600 dark:text-slate-400">
        <p className="mb-1"><span className="inline-block w-3 h-3 bg-green-100 dark:bg-green-900/50 border border-green-500 mr-2"></span> Your booth</p>
        <p className="mb-1"><span className="inline-block w-3 h-3 bg-red-100 dark:bg-red-900/50 border border-red-500 mr-2"></span> Reserved by others</p>
        <p><span className="inline-block w-3 h-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 mr-2"></span> Available</p>
      </div>
    </div>
  );
}