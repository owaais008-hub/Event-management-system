import { Router } from 'express';
import { 
  uploadCertificate, 
  getUserCertificates, 
  getEventCertificates, 
  downloadCertificate, 
  deleteCertificate,
  verifyCertificate
} from '../controllers/certificateController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for certificate uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'certificate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Upload certificate (organizers only)
router.post('/upload', restrictTo('organizer', 'admin'), upload.single('certificate'), uploadCertificate);

// Get user's certificates
router.get('/me', getUserCertificates);

// Get certificates for an event (organizer only)
router.get('/event/:id', restrictTo('organizer', 'admin'), getEventCertificates);

// Download certificate
router.get('/:id/download', downloadCertificate);

// Delete certificate (organizer or admin only)
router.delete('/:id', restrictTo('organizer', 'admin'), deleteCertificate);

// Verify certificate (public endpoint)
router.post('/verify', verifyCertificate);

export default router;