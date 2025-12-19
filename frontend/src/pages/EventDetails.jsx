import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import { canRegisterForEvent, canManageEvent } from '../utils/permissions.js';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star, 
  Share2, 
  Download, 
  Edit, 
  Trash2,
  CheckCircle2,
  User,
  MessageSquare,
  X,
  Camera
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-toastify';
import ImageGallery from '../components/ImageGallery.jsx';
import GalleryUpload from '../components/GalleryUpload.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
    const [e, r] = await Promise.all([
      axios.get(`/api/events/${id}`),
      axios.get(`/api/reviews/${id}`),
    ]);
    setEvent(e.data.event);
    setReviews(r.data.reviews || []);
    
    if (user) {
      const userReview = r.data.reviews?.find(review => review.user?._id === user.id);
      setHasReviewed(!!userReview);
      
      try {
        const registrations = await axios.get('/api/registrations/me');
        const userRegistration = registrations.data.registrations?.find(reg => reg.event?._id === id);
        setIsRegistered(userRegistration?.status === 'approved');
        setSelectedRegistration(userRegistration);
      } catch (error) {
        console.error('Failed to check registration status:', error);
      }
      }
    } catch (error) {
      toast.error('Failed to load event details');
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  async function register() {
    if (!user) {
      localStorage.setItem('signupMessage', 'Sign up to Register for this event');
      localStorage.setItem('returnUrl', window.location.pathname);
      navigate('/signup');
      return;
    }
    
    if (isRegistered) {
      toast.info('You are already registered for this event.');
      return;
    }
    
    try {
      const response = await axios.post(`/api/registrations/${id}/register`);
      toast.success(response.data.message || 'Registration request submitted!');
      await load();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.setItem('signupMessage', 'Please sign up to register for this event');
        localStorage.setItem('returnUrl', window.location.pathname);
        navigate('/signup');
      } else {
        toast.error(`Registration failed: ${error.response?.data?.message || 'Please try again.'}`);
      }
    }
  }

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Event link copied to clipboard!');
    }
  }

  function downloadIcs() {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusEvents//EN
BEGIN:VEVENT
UID:${event._id}@campus
DTSTAMP:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTSTART:${start.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
DTEND:${end.toISOString().replace(/[-:]/g,'').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.venue}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `${event.title}.ics`; 
    a.click(); 
    URL.revokeObjectURL(url);
    toast.success('Calendar event downloaded!');
  }

  const getCategoryPlaceholder = (category) => {
    switch (category?.toLowerCase()) {
      case 'tech': return '/tech-event.jpg';
      case 'sports': return '/sports-event.jpg';
      case 'cultural': return '/cultural-event.jpg';
      case 'workshop': return '/workshop-event.jpg';
      case 'conference': return '/conference-event.jpg';
      default: return '/placeholder.svg';
    }
  };

  const getFullPosterUrl = (posterUrl) => {
    if (!posterUrl) return null;
    if (posterUrl.startsWith('http')) return posterUrl;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${posterUrl}`;
  };

  async function submitReview() {
    if (!user) {
      localStorage.setItem('signupMessage', 'Sign up to post a review for this event');
      localStorage.setItem('returnUrl', window.location.pathname);
      navigate('/signup');
      return;
    }

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      toast.error('Rating must be an integer between 1 and 5');
      return;
    }

    try {
      await axios.post(`/api/reviews/${id}`, { rating, comment });
      toast.success('Review posted successfully!');
      setComment('');
      await load();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.setItem('signupMessage', 'Please sign up to post a review');
        localStorage.setItem('returnUrl', window.location.pathname);
        navigate('/signup');
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('reviewed')) {
        toast.info('You have already reviewed this event.');
      } else {
        toast.error(`Failed to post review: ${error.response?.data?.message || 'Please try again.'}`);
      }
    }
  }

  const handleGalleryUploadSuccess = useCallback((/*newImages*/) => {
    // Refresh the gallery
    load();
    setShowGalleryUpload(false);
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative w-20 h-20"
        >
          <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')}>Browse Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Event Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Event Poster */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <div className="relative">
              <img
                src={getFullPosterUrl(event.posterUrl) || getCategoryPlaceholder(event.category)}
                alt={event.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getCategoryPlaceholder(event.category);
                }}
              />
              <div className="absolute top-4 right-4">
                <Badge variant={event.status === 'approved' ? 'success' : 'warning'}>
                  {event.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5" />
                  <span>{event.time || 'Time not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{event.venue || 'Venue not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-5 h-5" />
                  <span>
                    {event.capacity ? `${event.registrations?.length || 0}/${event.capacity}` : 'Unlimited'} spots
                  </span>
                </div>
                {event.organizer && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="w-5 h-5" />
                    <span>Organized by {event.organizer.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 dark:text-white">{event.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{event.category}</Badge>
                    <Badge variant="secondary">{event.department}</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {event.description?.substring(0, 150)}...
                  </p>
                </div>

                {canRegisterForEvent(user, event) && (
                  <Button
                    variant={isRegistered ? "success" : "primary"}
                    size="lg"
                    className="w-full"
                    onClick={register}
                    disabled={isRegistered}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Registered
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Register for Event
                      </>
                    )}
                  </Button>
                )}
                {!user && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      localStorage.setItem('signupMessage', 'Sign up to Register for this event');
                      localStorage.setItem('returnUrl', window.location.pathname);
                      navigate('/signup');
                    }}
                  >
                    Sign Up to Register
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={shareEvent}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={downloadIcs}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Calendar
                  </Button>
                </div>
                {canManageEvent(user, event) && (
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/dashboard?edit=${event._id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Event</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
            {event.description}
          </p>
        </CardContent>
      </Card>

      {/* Gallery Upload Section for Organizers */}
      {canManageEvent(user, event) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Event Gallery Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showGalleryUpload ? (
              <div className="text-center py-8">
                <Button 
                  onClick={() => setShowGalleryUpload(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Camera className="w-4 h-4" />
                  Upload Event Photos
                </Button>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                  Share photos from your event with attendees and visitors
                </p>
              </div>
            ) : (
              <GalleryUpload 
                eventId={event._id} 
                onUploadSuccess={handleGalleryUploadSuccess} 
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Review Form */}
          {user && !hasReviewed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
            >
              <h3 className="font-semibold mb-4 dark:text-white">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Comment</label>
                  <textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <Button onClick={submitReview} variant="primary">
                  Submit Review
                </Button>
              </div>
            </motion.div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {review.user?.name || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Event Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageGallery eventId={event._id} title={`${event.title} Gallery`} />
        </CardContent>
      </Card>
      
      {/* Ticket Modal */}
      {showTicket && selectedRegistration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setShowTicket(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <EventTicket 
                registration={selectedRegistration} 
                event={event}
                user={user}
                onReady={() => {}}
                onDownload={() => {}}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}