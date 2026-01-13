import { connectDB } from '../lib/db.js';
import { authenticate } from '../lib/auth.js';
import {
    uploadMedia,
    getGalleryItems,
    getGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    getFeaturedItems
} from '../backend/src/controllers/galleryController.js';

export default async function handler(req, res) {
    await connectDB();

    const { method } = req;
    const { action, id } = req.query;

    // Authentication check for write operations
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
        try {
            const user = authenticate(req);
            req.user = user;
        } catch (err) {
            return res.status(401).json({ message: 'Authentication required' });
        }
    }

    // Handle actions
    if (action === 'featured') {
        return getFeaturedItems(req, res);
    }

    switch (method) {
        case 'GET':
            if (id) {
                req.params = { id };
                return getGalleryItem(req, res);
            }
            return getGalleryItems(req, res);
        case 'POST':
            return uploadMedia(req, res);
        case 'PUT':
            if (id) {
                req.params = { id };
                return updateGalleryItem(req, res);
            }
            return res.status(400).json({ message: 'Item ID required' });
        case 'DELETE':
            if (id) {
                req.params = { id };
                return deleteGalleryItem(req, res);
            }
            return res.status(400).json({ message: 'Item ID required' });
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).json({ message: `Method ${method} not allowed` });
    }
}
