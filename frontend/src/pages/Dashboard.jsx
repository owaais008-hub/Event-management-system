import { useEffect, useMemo, useState, useCallback } from 'react';
import { canCreateEvent } from '../utils/permissions.js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import AdminEnhanced from '../components/admin/AdminEnhanced.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { X } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [mine, setMine] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(''); // Add time state
  
  const [venue, setVenue] = useState(''); // Change from location to venue
  const [department, setDepartment] = useState(''); // Add department state
  const [category, setCategory] = useState('Tech');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [poster, setPoster] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // for organizer view
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle drag and drop events for poster upload
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        setPoster(file);
      } else {
        showToast('error', 'Please upload an image file (JPEG, PNG, etc.)');
      }
    }
  };

  const showToast = useCallback((type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
  }, []);

  // Validate event form
  const validateEventForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (!time) {
      newErrors.time = 'Time is required';
    }
    
    if (!venue.trim()) {
      newErrors.venue = 'Venue is required';
    }
    
    if (!department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    if (capacity && (isNaN(capacity) || capacity < 1)) {
      newErrors.capacity = 'Capacity must be a positive number';
    }
    
    if (!poster) {
      newErrors.poster = 'Event poster is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const downloadTicketDirect = async (registration) => {
    try {
      // Create a temporary div to render the ticket
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '980px';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);

      // Render the ticket HTML directly
      const event = registration.event;
      const eventDate = new Date(event?.date);

      tempDiv.innerHTML = `
        <div style="width: 980px; padding: 20px;">
          <div style="display: flex; min-height: 360px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
            <!-- Left main area -->
            <div style="flex: 1; padding: 32px; color: white; background: linear-gradient(135deg, #3730a3, #7c3aed, #3730a3);">
              <!-- Top brand row -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                <div>
                  <div style="font-size: 14px; letter-spacing: 0.1em; color: #f0abfc;">EVENT MANAGER</div>
                  <div style="font-size: 12px; color: #c7d2fe;">Official Event Ticket</div>
                </div>
              </div>
              
              <!-- Event title -->
              <div style="margin-bottom: 24px;">
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.025em;">${event?.title}</div>
                <div style="color: #67e8f9; font-weight: 600; margin-top: 4px;">${event?.category} EVENT</div>
              </div>
              
              <!-- Big date/time row -->
              <div style="display: flex; align-items: end; gap: 32px; margin-bottom: 24px;">
                <div style="font-size: 30px; font-weight: 800; letter-spacing: 0.025em;">${eventDate.toLocaleDateString('en-GB')}</div>
                <div style="font-size: 30px; font-weight: 800; letter-spacing: 0.025em;">${eventDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <div style="text-transform: uppercase; letter-spacing: 0.1em; color: #67e8f9; margin-bottom: 24px;">${event?.location}</div>
              
              <!-- Barcode -->
              <div style="display: flex; align-items: center;">
                <div style="height: 64px; width: 224px; background: repeating-linear-gradient(90deg, #fff 0, #fff 2px, transparent 2px, transparent 4px); border-radius: 4px;"></div>
              </div>
            </div>
            
            <!-- Perforation divider -->
            <div style="width: 2px; background: rgba(255,255,255,0.4); position: relative;">
              <div style="position: absolute; top: 24px; bottom: 24px; left: 0; right: 0; border-left: 2px dashed rgba(255,255,255,0.7);"></div>
            </div>
            
            <!-- Right stub -->
            <div style="width: 256px; padding: 24px; color: white; background: linear-gradient(to bottom, #312e81, #1e40af); display: flex; flex-direction: column;">
              <!-- Vertical date/time -->
              <div style="color: #67e8f9; font-size: 16px; font-weight: 700; margin-bottom: 20px; writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 2px; text-shadow: 0 0 10px rgba(103, 232, 249, 0.5);">
                ${eventDate.getDate().toString().padStart(2, '0')} ${(eventDate.getMonth() + 1).toString().padStart(2, '0')} ${eventDate.getFullYear()} • ${eventDate.getHours().toString().padStart(2, '0')} ${eventDate.getMinutes().toString().padStart(2, '0')}
              </div>
              
              <!-- QR -->
              <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 16px; text-align: center;">
                <div style="color: #c7d2fe; font-size: 14px; margin-bottom: 8px;">ENTRY QR</div>
                ${registration.qrCodeDataUrl ? `<img src="${registration.qrCodeDataUrl}" alt="QR" style="margin: 0 auto; width: 144px; height: 144px; border-radius: 6px; background: white; padding: 4px;" />` : ''}
              </div>
              
              <!-- Footer small -->
              <div style="margin-top: auto; text-align: center; font-size: 10px; color: rgba(199, 210, 254, 0.8);">
                <div style="font-weight: 600;">College Event Management System</div>
                <div style="opacity: 0.7;">www.collegeevents.com</div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        padding: 20
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = margin;
      const y = margin + (contentHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      const fileName = `${event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`;
      pdf.save(fileName);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      showToast('success', 'Ticket downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('error', 'Failed to download ticket. Please try again.');
    }
  };

  const loadMyRegs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/registrations/me');
      setMine(res.data.registrations || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      showToast('error', 'Failed to load registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setMine, showToast]);

  const loadMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/events', { params: { organizer: user?.id } });
      setMine(res.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
      showToast('error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setMine, showToast, user?.id]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'student') loadMyRegs();
    if (user.role === 'organizer') loadMyEvents();
    // Removed admin-specific loading since we moved it to AdminEnhanced component
  }, [user, loadMyRegs, loadMyEvents]); // Add missing dependencies

  async function loadParticipants(eventId) {
    try {
      setLoading(true);
      const res = await axios.get(`/api/registrations/${eventId}/participants`);
      setParticipants(res.data.participants || []);
    } catch (error) {
      console.error('Error loading participants:', error);
      showToast('error', 'Failed to load participants. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv(eventId) {
    try {
      setLoading(true);
      // Check if participants exist first
      const check = await axios.get(`/api/registrations/${eventId}/participants`);
      const list = check.data.participants || [];
      if (!Array.isArray(list) || list.length === 0) {
        showToast('error', 'No participants available for this event.');
        return;
      }
    } catch (error) {
      // If the check fails, show error and abort
      console.error('Error checking participants:', error);
      showToast('error', 'Unable to fetch participants. Please try again.');
      return;
    }

    try {
      const res = await axios.get(`/api/registrations/${eventId}/participants.csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; 
      a.download = `participants-${eventId}.csv`; 
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('success', 'CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast('error', 'Failed to export CSV. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e) {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateEventForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('title', title);
      fd.append('date', date);
      fd.append('time', time); // Add time
      fd.append('venue', venue); // Change from location to venue
      fd.append('department', department); // Add department
      fd.append('category', category);
      fd.append('description', description);
      if (capacity) fd.append('capacity', capacity);
      if (poster) fd.append('poster', poster);
      await axios.post('/api/events', fd);
      setTitle(''); 
      setDate(''); 
      setTime(''); // Reset time
      setVenue(''); // Reset venue
      setDepartment(''); // Reset department
      setDescription(''); 
      setCapacity('');
      setPoster(null);
      await loadMyEvents();
      showToast('success', 'Event created successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create event. Please try again.';
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Approve staff member (for admin)
  async function approveStaff(id) {
    try {
      setLoading(true);
      await axios.post(`/api/admin/approve/${id}`);
      showToast('success', 'Staff member approved successfully');
      // Note: For admin functionality, data refresh is handled in AdminEnhanced component
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to approve staff member');
    } finally {
      setLoading(false);
    }
  }

  // Reject staff member (for admin)
  async function rejectStaff(id) {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/reject/${id}`);
      showToast('success', 'Staff member rejected successfully');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to reject staff member');
    } finally {
      setLoading(false);
    }
  }

  const analytics = useMemo(() => {
    // Simple mini-analytics: count by status and category
    const byStatus = mine.reduce((acc,e)=>{ acc[e.status]=(acc[e.status]||0)+1; return acc; },{});
    const byCategory = mine.reduce((acc,e)=>{ acc[e.category]=(acc[e.category]||0)+1; return acc; },{});
    return { byStatus, byCategory };
  }, [mine]);

  const getCategoryPlaceholder = (category) => {
    // Ensure we have a valid category
    if (!category) return '/placeholder.svg';
    
    switch (category.toLowerCase()) {
      case 'tech':
      case 'technology':
        return '/tech-event.jpg';
      case 'sports':
        return '/sports-event.jpg';
      case 'cultural':
        return '/cultural-event.jpg';
      case 'workshop':
        return '/workshop-event.jpg';
      case 'conference':
        return '/conference-event.jpg';
      default:
        return '/placeholder.svg';
    }
  };

  // Function to get the full URL for event posters
  const getFullPosterUrl = (posterUrl) => {
    if (!posterUrl) return null;
    // If it's already a full URL, return as is
    if (posterUrl.startsWith('http')) {
      return posterUrl;
    }
    // If it's a relative path, prepend the backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${posterUrl}`;
  };

  // Enhanced Registration Card for students
  const RegistrationCard = ({ registration }) => (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:-translate-y-1">
      <div className="p-5">
        <div className="flex flex-col gap-4">
          {/* Event poster */}
          <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 flex items-center justify-center h-32">
            <img 
              src={getFullPosterUrl(registration.event?.posterUrl) || getCategoryPlaceholder(registration.event?.category)} 
              alt={`${registration.event?.title || 'Event'} poster`}
              className="w-full h-full object-cover"
              onError={(ev)=>{ 
                ev.currentTarget.onerror=null; 
                ev.currentTarget.src='/placeholder.svg';
                ev.currentTarget.alt='Event poster placeholder';
              }}
            />
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 dark:text-white">{registration.event?.title || 'Untitled Event'}</h3>
              <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                {registration.event?.date ? new Date(registration.event.date).toLocaleDateString() : 'Date not set'} • {registration.event?.venue || 'Venue not set'}
              </div>
              <div className="text-sm">
                Status: <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                  registration.status === 'approved' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                    : registration.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {registration.status || 'unknown'}
                </span>
              </div>
            </div>
            {registration.qrCodeDataUrl && (
              <img src={registration.qrCodeDataUrl} className="h-16 w-16 border rounded-lg" alt="QR Code" />
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTicket(registration)}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              View Ticket
            </button>
            <button
              onClick={() => downloadTicketDirect(registration)}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:shadow-md"
              disabled={loading}
            >
              📥 Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Event Card for organizers
  const EventCard = ({ event }) => (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:-translate-y-1">
      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Event poster */}
          <div className="md:w-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 flex items-center justify-center h-24">
            <img 
              src={getFullPosterUrl(event.posterUrl) || getCategoryPlaceholder(event.category)} 
              alt={`${event.title || 'Event'} poster`}
              className="w-full h-full object-cover"
              onError={(ev)=>{ 
                ev.currentTarget.onerror=null; 
                ev.currentTarget.src='/placeholder.svg';
                ev.currentTarget.alt='Event poster placeholder';
              }}
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 dark:text-white">{event.title || 'Untitled Event'}</h3>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Organizer: {event.organizer?.name || 'Unknown Organizer'}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {event.date ? new Date(event.date).toLocaleDateString() : 'Date not set'} • {event.venue || 'Venue not set'}
            </div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'approved' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                  : event.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}>
                {event.status || 'unknown'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3 md:mt-0">
            <button 
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              onClick={()=>{setSelectedEvent(event._id);loadParticipants(event._id);}}
              disabled={loading}
            >
              Participants
            </button>
            <button 
              className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:shadow-md"
              onClick={()=>exportCsv(event._id)}
              disabled={loading}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Staff member card for admin approval
  const StaffCard = ({ staff }) => (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:-translate-y-1">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 dark:text-white">{staff.name}</h3>
            <div className="text-sm text-gray-600 dark:text-slate-400 mb-1">
              {staff.email}
            </div>
            <div className="text-sm dark:text-slate-300">
              Role: <span className="font-medium">{staff.role === 'organizer' ? 'Organizer' : 'Admin'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              onClick={()=>approveStaff(staff._id)}
              disabled={loading}
            >
              {loading ? 'Approving...' : 'Approve'}
            </button>
            <button 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              onClick={()=>rejectStaff(staff._id)}
              disabled={loading}
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Toast Notification */}
      {toast.open && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-lg border animate-slide-up ${
          toast.type==='error'
            ?'bg-red-500/90 text-white border-red-600'
            :toast.type==='success'
              ?'bg-green-500/90 text-white border-green-600'
              :'bg-blue-500/90 text-white border-blue-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl">
                {toast.type==='error' ? '⚠️' : toast.type==='success' ? '✓' : 'ℹ️'}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-bold capitalize text-sm">{toast.type}</div>
              <div className="text-sm opacity-90">{toast.message}</div>
            </div>
            <button
              className="ml-2 h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={()=>setToast({ ...toast, open:false })}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-lg border border-indigo-100 dark:border-slate-600">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-1">Dashboard</h1>
            <p className="text-gray-600 dark:text-slate-300 flex items-center">
              <span className="mr-2">👋</span>
              Welcome back, <span className="font-semibold ml-1">{user?.name}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-full font-semibold shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <span className="mr-2">
              {user?.role === 'student' ? '🎓' : '🎪'}
            </span>
            {user?.role === 'student' ? 'Student' : 'Event Organizer'}
          </div>
          <button 
            className="px-5 py-2.5 bg-white dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500 rounded-full transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
            onClick={logout}
          >
            Logout →
          </button>
        </div>
      </div>

      {/* Visitor Dashboard */}
      {user?.role === 'visitor' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-700">
          <div className="text-center py-20">
            <div className="text-7xl mb-6">👤</div>
            <h3 className="text-3xl font-bold mb-4 dark:text-white">Visitor Account</h3>
            <p className="text-gray-600 dark:text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
              As a visitor, you can browse events but cannot register. Upgrade to a student account to participate in events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/" 
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Browse Events →
              </a>
              <a 
                href="/role-access" 
                className="inline-block px-6 py-3 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                View Role Access →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Student Dashboard */}
      {user?.role === 'student' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-3xl dark:text-white flex items-center">
              <span className="mr-3 text-4xl">🎟️</span> 
              <span className="text-gradient">My Registrations</span>
            </h2>
            <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-indigo-500 to-transparent rounded-full"></div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">⏳</div>
              </div>
            </div>
          ) : mine.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl">
              <div className="text-7xl mb-6 animate-bounce">🎫</div>
              <h3 className="text-2xl font-bold mb-3 dark:text-white">No Registrations Yet</h3>
              <p className="text-gray-600 dark:text-slate-300 text-lg mb-6">
                You haven't registered for any events yet.
              </p>
              <a href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Browse Events →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mine.map((r) => (
                <RegistrationCard key={r._id} registration={r} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Organizer Dashboard */}
      {user?.role === 'organizer' && (
        <div className="space-y-8">
          {/* Approval banners removed; approval is announced via Notifications */}

          {/* Tabs for organizer view */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 border border-white/30 dark:border-slate-700/30">
            <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'overview'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              {canCreateEvent(user) && (
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'create'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
                onClick={() => setActiveTab('create')}
              >
                Create Event
              </button>
              )}
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-5">
                    <h3 className="font-semibold mb-3 dark:text-white">By Status</h3>
                    <ul className="space-y-2">
                      {Object.entries(analytics.byStatus).map(([k,v]) => (
                        <li key={k} className="flex justify-between items-center">
                          <span className="capitalize dark:text-slate-300">{k}</span>
                          <span className="font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full">
                            {v}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-5">
                    <h3 className="font-semibold mb-3 dark:text-white">By Category</h3>
                    <ul className="space-y-2">
                      {Object.entries(analytics.byCategory).map(([k,v]) => (
                        <li key={k} className="flex justify-between items-center">
                          <span className="capitalize dark:text-slate-300">{k}</span>
                          <span className="font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full">
                            {v}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 border border-white/30 dark:border-slate-700/30">
                  <h2 className="font-bold text-2xl mb-6 dark:text-white flex items-center">
                    <span className="mr-2">🎪</span> My Events
                  </h2>
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : mine.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">🎪</div>
                      <h3 className="text-xl font-semibold mb-2 dark:text-white">No events yet</h3>
                      <p className="text-gray-600 dark:text-slate-400">
                        Create your first event using the "Create Event" tab.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mine.map((e) => (
                        <EventCard key={e._id} event={e} />
                      ))}
                    </div>
                  )}
                </div>

                {selectedEvent && (
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-6 border border-white/30 dark:border-slate-700/30">
                    <h2 className="font-bold text-2xl mb-6 dark:text-white flex items-center">
                      <span className="mr-2">👥</span> Participants
                    </h2>
                    {loading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : participants.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-5xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold mb-2 dark:text-white">No participants yet</h3>
                        <p className="text-gray-600 dark:text-slate-400">
                          No one has registered for this event yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {participants.map(a => (
                          <div key={a._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <div>
                              <div className="font-medium dark:text-white">{a.user?.name}</div>
                              <div className="text-sm text-gray-600 dark:text-slate-400">{a.user?.email}</div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              a.status === 'approved' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                                : a.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                            }`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              !user.isApproved ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold mb-3 dark:text-white">Account Pending Approval</h3>
                  <p className="text-gray-600 dark:text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
                    You cannot create events until your organizer account has been approved by an administrator.
                    Please wait for approval before proceeding.
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 max-w-md mx-auto border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      <span className="font-semibold">Status:</span> Pending Admin Approval
                    </p>
                  </div>
              </div>
            ) : (
              <form onSubmit={createEvent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-slate-300">Event Title *</label>
                    <input 
                      className={`border rounded-lg px-4 py-3 w-full ${
                        errors.title 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                      }`} 
                      placeholder="Enter event title" 
                      value={title} 
                      onChange={(e)=>setTitle(e.target.value)} 
                      disabled={loading}
                    />
                    {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-slate-300">Date *</label>
                    <input 
                      className={`border rounded-lg px-4 py-3 w-full ${
                        errors.date 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                      }`} 
                      type="date" 
                      value={date} 
                      onChange={(e)=>setDate(e.target.value)} 
                      disabled={loading}
                    />
                    {errors.date && <div className="text-red-600 text-sm">{errors.date}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-slate-300">Time *</label>
                    <input 
                      className={`border rounded-lg px-4 py-3 w-full ${
                        errors.time 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                      }`} 
                      type="time" 
                      value={time} 
                      onChange={(e)=>setTime(e.target.value)} 
                      disabled={loading}
                    />
                    {errors.time && <div className="text-red-600 text-sm">{errors.time}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-slate-300">Venue *</label>
                    <input 
                      className={`border rounded-lg px-4 py-3 w-full ${
                        errors.venue 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                      }`} 
                      placeholder="Event venue" 
                      value={venue} 
                      onChange={(e)=>setVenue(e.target.value)} 
                      disabled={loading}
                    />
                    {errors.venue && <div className="text-red-600 text-sm">{errors.venue}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-slate-300">Department *</label>
                    <input 
                      className={`border rounded-lg px-4 py-3 w-full ${
                        errors.department 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                      }`} 
                      placeholder="Organizing department" 
                      value={department} 
                      onChange={(e)=>setDepartment(e.target.value)} 
                      disabled={loading}
                    />
                    {errors.department && <div className="text-red-600 text-sm">{errors.department}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-slate-300">Capacity (Optional)</label>
                    <input 
                      className={`border rounded-lg px-4 py-3 w-full ${
                        errors.capacity 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                      }`} 
                      type="number" 
                      placeholder="Maximum participants (leave blank for unlimited)" 
                      value={capacity} 
                      onChange={(e)=>setCapacity(e.target.value)} 
                      disabled={loading}
                      min="1"
                    />
                    {errors.capacity && <div className="text-red-600 text-sm">{errors.capacity}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-slate-300">Category</label>
                    <select 
                      className="border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 w-full dark:bg-slate-700 dark:text-white" 
                      value={category} 
                      onChange={(e)=>setCategory(e.target.value)}
                      disabled={loading}
                    >
                      <option value="Tech">Technology</option>
                      <option value="Sports">Sports</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Conference">Conference</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium dark:text-slate-300">Event Poster *</label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : errors.poster ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input 
                        className="hidden" 
                        type="file" 
                        id="poster-upload"
                        onChange={(e)=>setPoster(e.target.files[0])} 
                        disabled={loading}
                        accept="image/*"
                      />
                      <label htmlFor="poster-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        {poster ? (
                          <div className="mb-2">
                            <img src={URL.createObjectURL(poster)} alt="Preview" className="max-h-40 rounded-lg mx-auto" />
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{poster.name}</p>
                          </div>
                        ) : (
                          <>
                            <div className="text-4xl mb-2">{isDragOver ? '📥' : '📁'}</div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{isDragOver ? 'Drop your file here' : 'Click to upload poster'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </label>
                    </div>
                    {errors.poster && <div className="text-red-600 text-sm mt-1">{errors.poster}</div>}
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Select an image file from your device (JPEG, PNG, etc.)</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium dark:text-slate-300">Event Description *</label>
                    <textarea 
                      className={`border rounded-lg px-4 py-3 w-full min-h-[150px] ${
                        errors.description 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                      }`} 
                      placeholder="Provide a detailed description of the event, including agenda, speakers, activities, etc." 
                      value={description} 
                      onChange={(e)=>setDescription(e.target.value)} 
                      disabled={loading}
                      maxLength="500"
                    />
                    <div className={`text-right text-sm ${description.length > 450 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {description.length}/500 characters
                    </div>
                    {errors.description && <div className="text-red-600 text-sm">{errors.description}</div>}
                  </div>
                </div>
                <div className="pt-2">
                  <button 
                    className={`w-full py-3 rounded-lg font-semibold ${
                      loading 
                        ? 'bg-indigo-400' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300'
                    }`} 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Creating Event...
                      </div>
                    ) : 'Create Event'}
                  </button>
                </div>
              </form>
              )
            )}
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      {user?.role === 'admin' && (
        <>
          {/* Enhanced Admin Features */}
          <AdminEnhanced />

        </>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold dark:text-white">Event Ticket</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <EventTicket registration={selectedTicket} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}