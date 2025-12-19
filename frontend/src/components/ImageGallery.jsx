import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Heart, Share2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import axios from 'axios';

export default function ImageGallery({ eventId, title = "Event Gallery" }) {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedImages, setLikedImages] = useState(new Set());

  useEffect(() => {
    fetchGalleryImages();
  }, [eventId]);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      // Fetch only approved images for public display
      const params = { 
        eventId,
        approved: true
      };
      const res = await axios.get('/api/gallery', { params });
      setImages(res.data.galleryItems || []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${imageUrl}`;
  };

  const openImage = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const next = (currentIndex + 1) % images.length;
    setCurrentIndex(next);
    setSelectedImage(images[next]);
  };

  const prevImage = () => {
    const prev = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prev);
    setSelectedImage(images[prev]);
  };

  const toggleLike = (imageId) => {
    const newLiked = new Set(likedImages);
    if (newLiked.has(imageId)) {
      newLiked.delete(imageId);
    } else {
      newLiked.add(imageId);
    }
    setLikedImages(newLiked);
  };

  const downloadImage = async (imageUrl, title) => {
    try {
      const url = getFullImageUrl(imageUrl);
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${title || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const shareImage = async (image) => {
    const url = getFullImageUrl(image.imageUrl);
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title || 'Event Image',
          text: image.description || '',
          url: url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Image link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📸</div>
        <p className="text-gray-600 dark:text-gray-400">No images in gallery yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <span>📸</span> {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group cursor-pointer"
              onClick={() => openImage(image, index)}
            >
              <Card className="overflow-hidden p-0 aspect-square">
                <div className="relative w-full h-full">
                  <img
                    src={getFullImageUrl(image.imageUrl)}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                        {image.title || 'Untitled'}
                      </h3>
                      <p className="text-white/80 text-xs line-clamp-2">
                        {image.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(image._id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md ${
                        likedImages.has(image._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-700 hover:bg-white'
                      } transition-colors`}
                    >
                      <Heart
                        className={`w-4 h-4 ${likedImages.has(image._id) ? 'fill-current' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeImage}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeImage}
                className="absolute top-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Main Image */}
              <div className="relative">
                <motion.img
                  key={selectedImage._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  src={getFullImageUrl(selectedImage.imageUrl)}
                  alt={selectedImage.title || 'Gallery image'}
                  className="max-w-full max-h-[90vh] mx-auto rounded-lg shadow-2xl"
                />

                {/* Image Info Overlay */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 rounded-b-lg"
                >
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedImage.title || 'Untitled'}
                    </h3>
                    <p className="text-white/80 mb-4">
                      {selectedImage.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(selectedImage._id);
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 ${
                            likedImages.has(selectedImage._id) ? 'fill-current text-red-500' : ''
                          }`}
                        />
                        {likedImages.has(selectedImage._id) ? 'Liked' : 'Like'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(selectedImage.imageUrl, selectedImage.title);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareImage(selectedImage);
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}