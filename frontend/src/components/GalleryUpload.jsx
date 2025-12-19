import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import axios from 'axios';
import { toast } from 'react-toastify';
import ImageUploadPreview from './ImageUploadPreview.jsx';

export default function GalleryUpload({ eventId, onUploadSuccess }) {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('event');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = (selectedImages) => {
    setImages(Array.isArray(selectedImages) ? selectedImages : (selectedImages ? [selectedImages] : []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error('Please select at least one image to upload');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload each image
      const uploadPromises = images.map(async (image) => {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('eventId', eventId);
        formData.append('title', title || image.name);
        formData.append('description', description);
        formData.append('category', category);
        
        const response = await axios.post('/api/gallery/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return response.data.galleryItem;
      });
      
      const results = await Promise.all(uploadPromises);
      
      toast.success(`${results.length} image(s) uploaded successfully!`);
      
      // Reset form
      setImages([]);
      setTitle('');
      setDescription('');
      setCategory('event');
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(results);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700"
    >
      <h3 className="text-xl font-bold mb-4 dark:text-white">Upload Event Photos</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Photo title"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="event">Event</option>
              <option value="speakers">Speakers</option>
              <option value="activities">Activities</option>
              <option value="audience">Audience</option>
              <option value="behind-the-scenes">Behind the Scenes</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this photo..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Photos</label>
          <ImageUploadPreview
            onImageSelect={handleImageSelect}
            maxFiles={10}
            acceptedTypes="image/*"
            label="Select Event Photos"
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUploading || images.length === 0}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Photos
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}