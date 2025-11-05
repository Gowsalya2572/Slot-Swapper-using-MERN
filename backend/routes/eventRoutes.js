import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { createEvent, getEvent, updateEvent, eventSwapStatus, deleteEvent } from '../controllers/eventController.js';


const router = express.Router();


// Create event
// POST /api/events
router.post('/', auth, createEvent);


// Get my events
// GET /api/events/mine
router.get('/mine', auth,getEvent );


// Update event (title, times)
// PUT /api/events/:id
router.put('/:id', auth, updateEvent);


// Make event swappable or set status
// PUT /api/events/:id/status
router.put('/:id/status', auth, eventSwapStatus);


// Delete event
// DELETE /api/events/:id
router.delete('/:id', auth, deleteEvent);

export default router;