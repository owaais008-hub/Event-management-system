import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ExhibitorProfile() {
  const { id } = useParams();
  const [exhibitor, setExhibitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchExhibitor = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/exhibitors/${id}`);
      setExhibitor(res.data.exhibitor);
    } catch (error) {
      console.error('Error fetching exhibitor:', error);
      setError(error.response?.data?.message || 'Failed to load exhibitor profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchExhibitor();
    }
  }, [id, fetchExhibitor]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center py-8">Loading exhibitor profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center py-8 text-gray-500">
          Exhibitor not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {exhibitor.logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={exhibitor.logoUrl} 
                alt={exhibitor.companyName} 
                className="w-32 h-32 object-contain rounded border border-gray-200 dark:border-slate-800"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{exhibitor.companyName}</h1>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-gray-600 dark:text-slate-400">
                <span className="mr-2">📧</span>
                <a 
                  href={`mailto:${exhibitor.contactEmail}`} 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {exhibitor.contactEmail}
                </a>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-slate-400">
                <span className="mr-2">📱</span>
                <a 
                  href={`tel:${exhibitor.contactPhone}`} 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {exhibitor.contactPhone}
                </a>
              </div>
              
              {exhibitor.website && (
                <div className="flex items-center text-gray-600 dark:text-slate-400">
                  <span className="mr-2">🌐</span>
                  <a 
                    href={exhibitor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {exhibitor.website}
                  </a>
                </div>
              )}
            </div>
            
            {exhibitor.status && (
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  exhibitor.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : exhibitor.status === 'rejected' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {exhibitor.status.charAt(0).toUpperCase() + exhibitor.status.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-xl font-semibold mb-4">About {exhibitor.companyName}</h2>
        <p className="text-gray-700 dark:text-slate-300">
          {exhibitor.description}
        </p>
      </div>

      {/* Products/Services */}
      <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-xl font-semibold mb-4">Products & Services</h2>
        <p className="text-gray-700 dark:text-slate-300">
          {exhibitor.products}
        </p>
      </div>

      {/* Booth Information */}
      {exhibitor.booth && (
        <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Booth Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 dark:border-slate-800 rounded p-4">
              <div className="text-sm text-gray-500 dark:text-slate-400">Booth Number</div>
              <div className="font-semibold mt-1">#{exhibitor.booth.number}</div>
            </div>
            
            <div className="border border-gray-200 dark:border-slate-800 rounded p-4">
              <div className="text-sm text-gray-500 dark:text-slate-400">Location</div>
              <div className="font-semibold mt-1">Row {exhibitor.booth.row}</div>
            </div>
            
            <div className="border border-gray-200 dark:border-slate-800 rounded p-4">
              <div className="text-sm text-gray-500 dark:text-slate-400">Status</div>
              <div className="font-semibold mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  exhibitor.booth.isReserved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {exhibitor.booth.isReserved ? 'Reserved' : 'Available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Participating In */}
      {exhibitor.events && exhibitor.events.length > 0 && (
        <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Events Participating In</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exhibitor.events.map((event) => (
              <div 
                key={event._id} 
                className="border border-gray-200 dark:border-slate-800 rounded p-4 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {new Date(event.date).toLocaleDateString()} • {event.venue}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200">
                    {event.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}