import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { canManageBooths } from '../utils/permissions.js';

export default function BoothManagement() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    row: '',
    size: 'medium',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  }, []);

  const fetchBooths = useCallback(async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/booths/event/${selectedEvent}`);
      setBooths(response.data.booths || []);
    } catch (err) {
      setError('Failed to load booths');
      console.error('Error fetching booths:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchBooths();
  }, [fetchBooths]);

  const validateForm = () => {
    const errors = {};
    if (!formData.number.trim()) errors.number = 'Booth number is required';
    if (!formData.row.trim()) errors.row = 'Row is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedEvent) return;

    setSubmitting(true);
    try {
      if (selectedBooth) {
        await axios.put(`/api/booths/${selectedBooth._id}`, formData);
      } else {
        await axios.post(`/api/booths/event/${selectedEvent}`, formData);
      }
      setShowModal(false);
      fetchBooths();
      resetForm();
    } catch (err) {
      console.error('Error saving booth:', err);
      setError('Failed to save booth');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      number: '',
      row: '',
      size: 'medium',
      description: ''
    });
    setFormErrors({});
    setSelectedBooth(null);
  };

  const handleEdit = (booth) => {
    setSelectedBooth(booth);
    setFormData({
      number: booth.number || '',
      row: booth.row || '',
      size: booth.size || 'medium',
      description: booth.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booth?')) return;
    
    try {
      await axios.delete(`/api/booths/${id}`);
      fetchBooths();
    } catch (err) {
      console.error('Error deleting booth:', err);
      setError('Failed to delete booth');
    }
  };

  const getSizeBadgeColor = (size) => {
    const colors = {
      small: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      medium: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      large: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colors[size] || colors.medium;
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12 animate-fade-in">
        <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center transform hover:scale-105 transition-all duration-300">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 animate-bounce">🔒</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Access Restricted
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-slate-400">
            Please log in to manage booths.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 animate-fade-in">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 animate-slide-down">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3 break-words">
              Booth Management
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
              Organize and manage event booths efficiently
            </p>
          </div>
          
          <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-3 sm:gap-4">
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full glass-card px-4 sm:px-6 py-2.5 sm:py-3 pr-8 sm:pr-10 rounded-xl border border-white/30 dark:border-slate-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer hover:shadow-lg text-sm sm:text-base"
              >
                <option value="">🎪 Select an Event</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {canManageBooths(user) && (
              <button
                onClick={() => {
                  if (!selectedEvent) {
                    setError('Please select an event first');
                    setTimeout(() => setError(''), 3000);
                    return;
                  }
                  resetForm();
                  setShowModal(true);
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                disabled={!selectedEvent}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden xs:inline">Add New Booth</span>
                <span className="xs:hidden">Add Booth</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 sm:mb-6 animate-slide-down glass-card border-l-4 border-red-500 bg-red-50/50 dark:bg-red-900/20 rounded-xl p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3 shadow-lg">
          <div className="flex-shrink-0 pt-0.5 sm:pt-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-red-700 dark:text-red-300 font-medium break-words">{error}</p>
        </div>
      )}

      {/* Content Section */}
      {selectedEvent ? (
        loading ? (
          <div className="flex justify-center items-center h-64 sm:h-80 md:h-96">
            <div className="text-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg font-medium">Loading booths...</p>
            </div>
          </div>
        ) : booths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 animate-fade-in">
            {booths.map((booth, index) => (
              <div
                key={booth._id}
                className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-2xl transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
                        {booth.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">Booth {booth.number}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Row {booth.row}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getSizeBadgeColor(booth.size)}`}>
                    {booth.size}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2 break-words">
                  {booth.description}
                </p>

                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${booth.isReserved ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className={`text-xs sm:text-sm font-semibold ${booth.isReserved ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {booth.isReserved ? 'Reserved' : 'Available'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {canManageBooths(user) && (
                  <div className="flex gap-2 pt-3 sm:pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => handleEdit(booth)}
                      className="flex-1 px-3 sm:px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(booth._id)}
                      className="flex-1 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-4xl sm:text-5xl animate-bounce">
                🎪
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">No booths found</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Get started by adding your first booth for this event.
              </p>
              {canManageBooths(user) && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Create Your First Booth</span>
                  <span className="sm:hidden">Create Booth</span>
                </button>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center animate-fade-in">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-5xl sm:text-6xl animate-pulse">
              🎪
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
              Select an Event
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Choose an event from the dropdown above to start managing booths.
            </p>
          </div>
        </div>
      )}

      {/* Modal for adding/editing booths */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="glass-card rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transform animate-scale-in my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 md:p-8">
              {/* Header */}
              <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700 gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent break-words">
                    {selectedBooth ? 'Edit Booth' : 'Create New Booth'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedBooth ? 'Update booth details' : 'Fill in the details to create a new booth'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 flex-shrink-0"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-6">
                  {/* Booth Number */}
                  <div className="space-y-2">
                    <label htmlFor="number" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Booth Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      placeholder="e.g., A-101"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white text-sm sm:text-base ${
                        formErrors.number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    {formErrors.number && (
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-down">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="break-words">{formErrors.number}</span>
                      </p>
                    )}
                  </div>

                  {/* Row */}
                  <div className="space-y-2">
                    <label htmlFor="row" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Row <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="row"
                      name="row"
                      value={formData.row}
                      onChange={handleInputChange}
                      placeholder="e.g., Row A"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white text-sm sm:text-base ${
                        formErrors.row ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    {formErrors.row && (
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-down">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="break-words">{formErrors.row}</span>
                      </p>
                    )}
                  </div>

                  {/* Size */}
                  <div className="space-y-2">
                    <label htmlFor="size" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Booth Size
                    </label>
                    <select
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700/50 dark:text-white transition-all duration-200 text-sm sm:text-base"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the booth features, location, or special requirements..."
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white resize-none text-sm sm:text-base ${
                        formErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-down">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="break-words">{formErrors.description}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl text-gray-700 dark:text-slate-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{selectedBooth ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{selectedBooth ? 'Update Booth' : 'Create Booth'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}