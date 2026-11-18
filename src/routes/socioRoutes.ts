import { Router } from 'express';
import { SocioController } from '../controllers/socioController.js';

const router = Router();

router.get('/', SocioController.getAll);
router.post('/', SocioController.create);
router.put('/:id', SocioController.update);
router.delete('/:id', SocioController.delete);

export default router;