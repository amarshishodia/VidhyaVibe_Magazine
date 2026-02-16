import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { getStorageAdapter } from '../providers/storage';
import { createOrder, attachProof, verifyProof } from '../services/payments';
import { getPool } from '../db';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

// create order (user-facing)
router.post('/create-order', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const { planId, months, readerId, deliveryMode, addressId, couponCode, magazineId } = req.body;
  try {
    const result = await createOrder({ userId, planId: Number(planId), months: Number(months), readerId, deliveryMode, addressId, couponCode, magazineId });
    res.json(result);
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: 'create_order_failed', message: e.message });
  }
});

// upload payment proof (multipart)
router.post('/:orderId/proof', upload.single('proof'), async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const orderId = Number(req.params.orderId);
  try {
    const storage = getStorageAdapter();
    let fileKey: string | undefined = undefined;
    let url: string | undefined = undefined;
    if (req.file) {
      const key = `payments/${orderId}/${Date.now()}-${req.file.originalname}`;
      const up = await storage.upload(key, req.file.buffer, req.file.mimetype);
      fileKey = up.key;
      url = up.url;
    } else if (req.body.url) {
      url = req.body.url;
    } else {
      return res.status(400).json({ error: 'file_or_url_required' });
    }
    const proofId = await attachProof(orderId, userId, fileKey, url);
    res.status(201).json({ proofId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'attach_proof_failed', message: e.message });
  }
});

export default router;

