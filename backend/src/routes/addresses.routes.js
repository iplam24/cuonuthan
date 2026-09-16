import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listMyAddresses, createMyAddress, updateMyAddress, setDefaultMyAddress, deleteMyAddress } from '../controllers/address.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', listMyAddresses);
router.post('/', createMyAddress);
router.patch('/:id', updateMyAddress);
router.put('/:id/default', setDefaultMyAddress);
router.delete('/:id', deleteMyAddress);

export default router;
