import { Router } from 'express';
import { StatsController } from '../controllers/statsController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', verificarToken, StatsController.getStats);

export default router;