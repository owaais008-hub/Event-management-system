import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { canManageExhibitors } from '../utils/permissions.js';
import { X } from 'lucide-react';

export default function ExhibitorManagement() {
  const { user } = useAuth();
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedExhibitor, setSelectedExhibitor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    boothNumber: '',
    description: '',
    website: '',
    status: 'pending'
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchExhibitors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/exhibitors');
      setExhibitors(response.data.exhibitors || []);
    } catch (err) {
      setError('Failed to load exhibitors');
      console.error('Error fetching exhibitors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExhibitors();
  }, [fetchExhibitors]);

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (selectedExhibitor) {
        // Update existing exhibitor
        await axios.put(`/api/exhibitors/${selectedExhibitor._id}`, formData);
      } else {
        // Create new exhibitor
        await axios.post('/api/exhibitors', formData);
      }
      setShowModal(false);
      fetchExhibitors();
      resetForm();
    } catch (err) {
      console.error('Error saving exhibitor:', err);
      setError('Failed to save exhibitor');
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      boothNumber: '',
      description: '',
      website: '',
      status: 'pending'
    });
    setFormErrors({});
    setSelectedExhibitor(null);
  };

  const handleEdit = (exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setFormData({
      companyName: exhibitor.companyName || '',
      contactPerson: exhibitor.contactPerson || '',
      email: exhibitor.email || '',
      phone: exhibitor.phone || '',
      boothNumber: exhibitor.boothNumber || '',
      description: exhibitor.description || '',
      website: exhibitor.website || '',
      status: exhibitor.status || 'pending'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exhibitor?')) return;
    
    try {
      await axios.delete(`/api/exhibitors/${id}`);
      fetchExhibitors();
    } catch (err) {
      console.error('Error deleting exhibitor:', err);
      setError('Failed to delete exhibitor');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-slate-400">
            Please log in to manage exhibitors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exhibitor Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage exhibitors for college events
          </p>
        </div>
        {canManageExhibitors(user) && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:shadow-lg transition-all duration-300"
          >
            Add New Exhibitor
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden border border-white/30 dark:border-slate-700/30">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    Booth
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/90 dark:bg-slate-800/90 divide-y divide-gray-200 dark:divide-slate-700">
                {exhibitors.length > 0 ? (
                  exhibitors.map((exhibitor) => (
                    <tr key={exhibitor._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{exhibitor.companyName}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{exhibitor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{exhibitor.contactPerson}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{exhibitor.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {exhibitor.boothNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(exhibitor.status)}`}>
                          {exhibitor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(exhibitor)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exhibitor._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                      No exhibitors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Exhibitor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 dark:border-slate-700/30">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedExhibitor ? 'Edit Exhibitor' : 'Add New Exhibitor'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                        formErrors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.companyName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                        formErrors.contactPerson ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.contactPerson && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.contactPerson}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="boothNumber" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Booth Number
                    </label>
                    <input
                      type="text"
                      id="boothNumber"
                      name="boothNumber"
                      value={formData.boothNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                        formErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:shadow-lg transition-all duration-300"
                  >
                    {selectedExhibitor ? 'Update Exhibitor' : 'Add Exhibitor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}