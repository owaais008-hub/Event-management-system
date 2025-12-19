import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    enrollmentNumber: '',
    interests: [],
    avatarUrl: ''
  });
  const [interestInput, setInterestInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        enrollmentNumber: user.enrollmentNumber || '',
        interests: user.interests || [],
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Role-specific validations
    if (user.role === 'student') {
      if (!profile.enrollmentNumber.trim()) {
        newErrors.enrollmentNumber = 'Enrollment number is required';
      }
      if (!profile.department.trim()) {
        newErrors.department = 'Department is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await axios.put('/api/auth/profile', profile);
      
      // Update the user context with the new user data
      if (res.data.user) {
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update AuthContext
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        if (token && refreshToken && res.data.user) {
          login({
            token,
            refreshToken,
            user: res.data.user
          });
        }
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && !profile.interests.includes(interestInput.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const getFullAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    // If it's already a full URL, return as is
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    // If it's a relative path, prepend the backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${avatarUrl}`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Upload the file to the backend
      const res = await axios.post('/api/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update the profile with the new avatar URL
      const newAvatarUrl = res.data.avatarUrl;
      setProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      
      // Update the user context with the new user data
      if (res.data.user) {
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update AuthContext - trigger a refresh by getting latest user data
        try {
          const meResponse = await axios.get('/api/auth/me');
          const token = localStorage.getItem('token');
          const refreshToken = localStorage.getItem('refreshToken');
          if (token && refreshToken && meResponse.data.user) {
            login({
              token,
              refreshToken,
              user: meResponse.data.user
            });
          }
        } catch (err) {
          // If refresh fails, still update local state
        }
      }
      
      setMessage({ type: 'success', text: 'Profile picture updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload profile picture' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          My Profile
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-700">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-slate-700 mx-auto flex items-center justify-center mb-4 overflow-hidden">
                  {getFullAvatarUrl(profile.avatarUrl) ? (
                    <img 
                      src={getFullAvatarUrl(profile.avatarUrl)} 
                      alt="Profile" 
                      className="h-32 w-32 rounded-full object-cover"
                      onError={(e) => {
                        // If the image fails to load, show the default placeholder
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('span')) {
                          const span = document.createElement('span');
                          span.className = 'text-5xl';
                          span.textContent = '👤';
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-5xl">👤</span>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition-colors">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                  <span>✏️</span>
                </label>
              </div>
              
              <h2 className="text-2xl font-bold dark:text-white">{profile.name}</h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">{user.role.replace('_', ' ')}</p>
              
              {user.role === 'student' && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Enrollment: {profile.enrollmentNumber}</p>
                  <p>Department: {profile.department}</p>
                </div>
              )}
              
              {user.role === 'organizer' && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Organizer Account</p>
                  <p>{user.isApproved ? 'Approved' : 'Pending Approval'}</p>
                </div>
              )}
              
              {user.role === 'admin' && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Administrator Account</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Profile Information</h2>
            
            {message.type === 'success' && message.text && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <p className="text-green-800 dark:text-green-200 font-medium">{message.text}</p>
                </div>
              </div>
            )}
            
            {message.type === 'error' && message.text && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-red-800 dark:text-red-200 font-medium">{message.text}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  placeholder="Your full name"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>
              
              {user.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                      Enrollment Number *
                    </label>
                    <input
                      type="text"
                      value={profile.enrollmentNumber}
                      onChange={(e) => setProfile(prev => ({ ...prev, enrollmentNumber: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.enrollmentNumber ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      placeholder="Your enrollment number"
                      disabled={loading}
                    />
                    {errors.enrollmentNumber && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.enrollmentNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                      Department *
                    </label>
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.department ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                      } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      placeholder="Your department"
                      disabled={loading}
                    />
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.department}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                      College ID
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={profile.collegeIdUrl}
                        onChange={(e) => setProfile(prev => ({ ...prev, collegeIdUrl: e.target.value }))}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="URL to your college ID"
                        disabled={loading}
                      />
                      <button 
                        type="button"
                        className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        onClick={() => document.getElementById('collegeIdUpload').click()}
                        disabled={loading}
                      >
                        Upload
                      </button>
                      <input 
                        id="collegeIdUpload"
                        type="file" 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-200">
                  Interests
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add an interest"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <button 
                    type="button"
                    className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={addInterest}
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm flex items-center"
                    >
                      {interest}
                      <button 
                        type="button"
                        className="ml-2 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        onClick={() => removeInterest(interest)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all duration-300 ${
                  loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Profile'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}