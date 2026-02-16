import { Router } from 'express';
import { getPool } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getEnv } from '@magazine/config';

const env = getEnv();
const router = Router();

router.use(requireAuth);

// List available plans
router.get('/plans', async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query(
      'SELECT id, name, slug, description, priceCents, currency, minMonths, maxMonths, deliveryMode, autoDispatch, dispatchFrequencyDays FROM subscription_plans WHERE active = 1'
    );
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'list_plans_failed' });
  } finally {
    conn.release();
  }
});

// Subscribe endpoint
router.post('/subscribe', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  const { planId, months, readerId, deliveryMode, addressId, couponCode, magazineId } = req.body;
  if (!planId || !months) return res.status(400).json({ error: 'planId_and_months_required' });

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // fetch plan
    const [planRows]: any = await conn.query('SELECT * FROM subscription_plans WHERE id = ? LIMIT 1', [planId]);
    const plan = planRows[0];
    if (!plan) {
      await conn.rollback();
      return res.status(404).json({ error: 'plan_not_found' });
    }

    if (plan.minMonths && months < plan.minMonths) {
      await conn.rollback();
      return res.status(400).json({ error: 'months_below_minimum' });
    }
    if (plan.maxMonths && months > plan.maxMonths) {
      await conn.rollback();
      return res.status(400).json({ error: 'months_above_maximum' });
    }

    // determine effective delivery mode
    const effectiveDelivery = deliveryMode || plan.deliveryMode;

    // if physical delivery required, validate address exists
    if (effectiveDelivery === 'PHYSICAL' || effectiveDelivery === 'BOTH' || plan.delivery_mode === 'PHYSICAL') {
      // check address either for reader or user
      let addrOk = false;
      if (addressId) {
        const [aRows]: any = await conn.query('SELECT id FROM addresses WHERE id = ? LIMIT 1', [addressId]);
        addrOk = !!aRows[0];
      } else if (readerId) {
        const [aRows]: any = await conn.query('SELECT id FROM addresses WHERE readerId = ? LIMIT 1', [readerId]);
        addrOk = !!aRows[0];
      } else {
        const [aRows]: any = await conn.query('SELECT id FROM addresses WHERE userId = ? LIMIT 1', [userId]);
        addrOk = !!aRows[0];
      }
      if (!addrOk) {
        await conn.rollback();
        return res.status(400).json({ error: 'physical_address_required' });
      }
    }

    // compute price (simple: plan.price_cents * months)
    const priceCents = Number(plan.price_cents) * Number(months);

    // handle coupon validation via coupon service
    let couponId: number | null = null;
    if (couponCode) {
      const { validateCoupon } = require('../services/coupons');
      const vres = await validateCoupon(couponCode, userId, planId, undefined);
      if (!vres.valid) {
        await conn.rollback();
        return res.status(400).json({ error: 'invalid_coupon', reason: vres.reason });
      }
      couponId = vres.coupon.id;
    }

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + Number(months));

    const [ins]: any = await conn.query(
      'INSERT INTO user_subscriptions (userId, readerId, magazineId, planId, status, startsAt, endsAt, autoRenew, priceCents, currency, couponId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, readerId || null, magazineId || null, planId, 'ACTIVE', startsAt, endsAt, 1, priceCents, plan.currency || 'USD', couponId]
    );
    const subscriptionId = ins.insertId;

    // create payment placeholder
    const [pay]: any = await conn.query(
      'INSERT INTO payments (userId, subscriptionId, amountCents, currency, provider, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, subscriptionId, priceCents, plan.currency || 'USD', 'manual', 'PENDING']
    );
    const paymentId = pay.insertId;

    // If plan autoDispatch and physical delivery, generate dispatch schedules
    if (plan.autoDispatch && (effectiveDelivery === 'PHYSICAL' || effectiveDelivery === 'BOTH' || plan.deliveryMode === 'PHYSICAL')) {
      // determine frequency in days
      const freqDays = plan.dispatchFrequencyDays || 30;
      let next = new Date(startsAt);
      // schedule until endsAt exclusive
      while (next < endsAt) {
        const scheduledAt = new Date(next);
        // try to find edition for the scheduled date if magazineId provided
        let editionIdForSchedule = null;
        if (magazineId) {
          const [edRows]: any = await conn.query(
            'SELECT id FROM magazine_editions WHERE magazineId = ? AND publishedAt <= ? ORDER BY publishedAt DESC LIMIT 1',
            [magazineId, scheduledAt]
          );
          if (edRows && edRows[0]) editionIdForSchedule = edRows[0].id;
        }
        await conn.query('INSERT INTO dispatch_schedules (subscriptionId, editionId, scheduledAt, status, createdAt) VALUES (?, ?, ?, ?, NOW())', [
          subscriptionId,
          editionIdForSchedule,
          scheduledAt,
          'SCHEDULED'
        ]);
        next = new Date(next.getTime() + freqDays * 24 * 60 * 60 * 1000);
      }
    }

    // record coupon usage (if any)
    if (couponId) {
      const { recordCouponUsage } = require('../services/coupons');
      await recordCouponUsage(couponId, userId, subscriptionId);
    }

    await conn.commit();
    res.status(201).json({ subscriptionId, paymentId });
  } catch (e: any) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'subscribe_failed', details: e.message });
  } finally {
    conn.release();
  }
});

export default router;

