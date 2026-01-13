import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export default function EventCard({ event, index = 0 }) {
  // Function to get the full URL for event posters
  const getFullPosterUrl = (posterUrl) => {
    if (!posterUrl) return null;
    if (posterUrl.startsWith('http')) {
      return posterUrl;
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:5001' : window.location.origin);
    return `${backendUrl}${posterUrl}`;
  };

  const getCategoryPlaceholder = (category) => {
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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <Card hover className="h-full flex flex-col overflow-hidden group">
        <Link to={`/events/${event._id}`} className="flex flex-col h-full">
          <div className="relative overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="relative h-48 sm:h-56 w-full"
            >
              <img
                src={getFullPosterUrl(event.posterUrl) || getCategoryPlaceholder(event.category)}
                alt={`${event.title} poster`}
                className="w-full h-full object-cover"
                onError={(ev) => {
                  ev.currentTarget.onerror = null;
                  ev.currentTarget.src = getCategoryPlaceholder(event.category);
                  ev.currentTarget.alt = 'Event poster placeholder';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Status Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge variant={getStatusVariant(event.status)}>
                  {event.status}
                </Badge>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3 z-10">
                <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {event.category}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-2 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {event.title}
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
              {event.description}
            </p>

            {/* Department Badge */}
            {event.department && (
              <div className="mb-4">
                <Badge variant="info" className="text-xs">
                  {event.department}
                </Badge>
              </div>
            )}

            {/* Event Details */}
            <div className="space-y-2 mb-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                <span>{event.date ? new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Date TBA'}</span>
              </div>
              {event.time && (
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>{event.time}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                <span className="truncate">{event.venue || 'Venue TBA'}</span>
              </div>
            </div>

            {/* View Details Link */}
            <motion.div
              className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-auto"
              whileHover={{ x: 4 }}
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </motion.div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
