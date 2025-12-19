import { Router } from 'express';
import { 
  uploadMedia,
  getGalleryItems,
  getGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  approveGalleryItem,
  rejectGalleryItem,
  getFeaturedItems
} from '../controllers/galleryController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for gallery uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common image formats
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes
router.get('/', getGalleryItems);
router.get('/featured', getFeaturedItems);
router.get('/:id', getGalleryItem);

// All other routes require authentication
router.use(authenticate);

// Upload media (organizers only)
router.post('/upload', restrictTo('organizer', 'admin'), upload.single('image'), uploadMedia);

// Update gallery item (organizer or admin)
router.put('/:id', restrictTo('organizer', 'admin'), updateGalleryItem);

// Delete gallery item (organizer or admin)
router.delete('/:id', restrictTo('organizer', 'admin'), deleteGalleryItem);

// Admin approval/rejection routes
router.post('/:id/approve', restrictTo('admin'), approveGalleryItem);
router.post('/:id/reject', restrictTo('admin'), rejectGalleryItem);

export default router;