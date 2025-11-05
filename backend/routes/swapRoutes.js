import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { slotSwappable, swapReq, swapResponse } from '../controllers/swapController.js';

const router = express.Router();

/**
 * GET /api/swappable-slots
 * Return all SWAPPABLE slots belonging to other users (not the requester)
 */
router.get('/swappable-slots', auth, slotSwappable);

/**
 * POST /api/swap-request
 * body: { mySlotId, theirSlotId }
 */
router.post('/swap-request', auth, swapReq);

/**
 * POST /api/swap-response/:requestId
 * body: { accept: boolean }
 */
router.post('/swap-response/:requestId', auth, swapResponse);

export default router;
