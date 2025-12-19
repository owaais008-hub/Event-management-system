import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export default function ImageUploadPreview({ 
  onImageSelect, 
  maxFiles = 1, 
  acceptedTypes = 'image/*',
  label = 'Upload Image',
  className = ''
}) {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > maxFiles) {
      alert(`Please select only ${maxFiles} image(s)`);
      return;
    }

    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > maxFiles) {
      alert(`Please select only ${maxFiles} image(s)`);
      return;
    }
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      status: 'ready'
    }));

    if (maxFiles === 1) {
      // Remove old images if single file mode
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages(newImages);
      if (onImageSelect) {
        onImageSelect(newImages[0]?.file || null);
      }
    } else {
      setImages(prev => {
        const combined = [...prev, ...newImages].slice(0, maxFiles);
        if (onImageSelect) {
          onImageSelect(combined.map(img => img.file));
        }
        return combined;
      });
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      const newImages = prev.filter((_, i) => i !== index);
      if (onImageSelect) {
        onImageSelect(maxFiles === 1 ? null : newImages.map(img => img.file));
      }
      return newImages;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
        {label}
      </label>

      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple={maxFiles > 1}
          onChange={handleFileInput}
          className="hidden"
        />

        {images.length === 0 ? (
          <div className="p-8 text-center">
            <motion.div
              animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop images here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {maxFiles === 1 ? 'Single image' : `Up to ${maxFiles} images`} • PNG, JPG, GIF up to 10MB
            </p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <Card className="overflow-hidden p-0 aspect-square">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.name}</p>
                      <p className="text-white/70 text-xs">{formatFileSize(image.size)}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {images.length < maxFiles && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-square border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Add more</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Upload Button */}
      {images.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {images.length} image{images.length !== 1 ? 's' : ''} selected
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Change Images
          </Button>
        </div>
      )}
    </div>
  );
}

