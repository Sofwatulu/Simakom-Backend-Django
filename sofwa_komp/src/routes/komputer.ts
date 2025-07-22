// src/routes/komputer.ts
import { Router } from 'express';
import komputerController from '../controllers/komputer.controller';

const router = Router();

router.get('/ping', komputerController.ping);
router.get('/status', komputerController.getStatusKomputer);

export default router;