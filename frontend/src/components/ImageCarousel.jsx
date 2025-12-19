import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Card } from './ui/Card';
import axios from 'axios';

export default function ImageCarousel({ images = [], autoPlay = true, interval = 5000, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [allImages, setAllImages] = useState(images);

  useEffect(() => {
    if (images.length === 0) {
      fetchFeaturedImages();
    }
  }, []);

  const fetchFeaturedImages = async () => {
    try {
      const res = await axios.get('/api/gallery/featured');
      setAllImages(res.data.galleryItems || []);
    } catch (error) {
      console.error('Error fetching featured images:', error);
      // Fallback to default images from uploads
      setAllImages([
        { imageUrl: '/uploads/yoga-morning.jpg', title: 'Morning Yoga Session' },
        { imageUrl: '/uploads/photography-workshop.jpg', title: 'Photography Workshop' },
        { imageUrl: '/uploads/tech-talk.jpg', title: 'Tech Talk Event' },
        { imageUrl: '/uploads/hackathon.jpg', title: 'Hackathon Competition' },
        { imageUrl: '/uploads/cultural-night.jpg', title: 'Cultural Night' },
        { imageUrl: '/uploads/football-meet.jpg', title: 'Football Tournament' },
      ]);
    }
  };

  useEffect(() => {
    if (!isPlaying || allImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, allImages.length, interval]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${imageUrl}`;
  };

  if (allImages.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      {title && (
        <h2 className="text-2xl font-bold mb-4 dark:text-white">{title}</h2>
      )}
      
      <Card className="overflow-hidden p-0 relative group">
        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img
                src={getFullImageUrl(allImages[currentIndex]?.imageUrl)}
                alt={allImages[currentIndex]?.title || 'Carousel image'}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Image Info Overlay */}
              {allImages[currentIndex]?.title && (
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl"
                  >
                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">
                      {allImages[currentIndex].title}
                    </h3>
                    {allImages[currentIndex].description && (
                      <p className="text-white/90 text-sm md:text-base line-clamp-2">
                        {allImages[currentIndex].description}
                      </p>
                    )}
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Play/Pause Button */}
          {allImages.length > 1 && autoPlay && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all z-10"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* Dots Indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm z-10">
              {currentIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

