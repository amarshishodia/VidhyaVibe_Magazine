import { getPool } from '../db';
import { validateCoupon, recordCouponUsage } from './coupons';

export async function createOrder(params: {
  userId: number;
  planId: number;
  months: number;
  readerId?: number;
  deliveryMode?: string;
  addressId?: number;
  couponCode?: string;
  magazineId?: number;
}) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let plan: any;
    let effectivePriceCents: number;
    let effectiveCurrency: string;
    const deliveryMode = params.deliveryMode || 'BOTH';
    if (params.magazineId) {
      const [rows]: any = await conn.query(
        `SELECT sp.id, sp.name, sp.min_months as minMonths, sp.max_months as maxMonths, sp.delivery_mode as deliveryMode, sp.price_cents as defaultPriceCents, sp.currency as defaultCurrency
         FROM subscription_plans sp WHERE sp.id = ? AND sp.active = 1 LIMIT 1`,
        [params.planId],
      );
      plan = rows[0];
      if (!plan) throw new Error('plan_not_found');
      const [mpRows]: any = await conn.query(
        `SELECT price_cents, currency FROM magazine_plans WHERE magazine_id = ? AND plan_id = ? AND delivery_mode = ? AND active = 1 LIMIT 1`,
        [params.magazineId, params.planId, deliveryMode],
      );
      if (mpRows[0]) {
        effectivePriceCents = Number(mpRows[0].price_cents);
        effectiveCurrency = mpRows[0].currency || 'INR';
      } else {
        effectivePriceCents = Number(plan.defaultPriceCents);
        effectiveCurrency = plan.defaultCurrency || 'INR';
      }
    } else {
      const [planRows]: any = await conn.query(
        'SELECT * FROM subscription_plans WHERE id = ? LIMIT 1',
        [params.planId],
      );
      plan = planRows[0];
      if (!plan) throw new Error('plan_not_found');
      effectivePriceCents = Number(plan.priceCents ?? plan.price_cents);
      effectiveCurrency = plan.currency || 'INR';
    }
    const minMonths = plan.minMonths ?? plan.min_months;
    const maxMonths = plan.maxMonths ?? plan.max_months;
    if (minMonths && params.months < minMonths) throw new Error('months_below_minimum');
    if (maxMonths && params.months > maxMonths) throw new Error('months_above_maximum');

    // validate address if physical
    if (['PHYSICAL', 'BOTH'].includes(deliveryMode)) {
      let addrOk = false;
      if (params.addressId) {
        const [aRows]: any = await conn.query('SELECT id FROM addresses WHERE id = ? LIMIT 1', [
          params.addressId,
        ]);
        addrOk = !!aRows[0];
      } else if (params.readerId) {
        const [aRows]: any = await conn.query(
          'SELECT id FROM addresses WHERE reader_id = ? LIMIT 1',
          [params.readerId],
        );
        addrOk = !!aRows[0];
      } else {
        const [aRows]: any = await conn.query(
          'SELECT id FROM addresses WHERE user_id = ? LIMIT 1',
          [params.userId],
        );
        addrOk = !!aRows[0];
      }
      if (!addrOk) throw new Error('physical_address_required');
    }

    // compute amounts (use magazine-specific price when available)
    const baseAmount = effectivePriceCents * Number(params.months);
    let final = baseAmount;
    let couponId = null;
    if (params.couponCode) {
      const v = await validateCoupon(params.couponCode, params.userId, params.planId, undefined);
      if (!v.valid) throw new Error(`invalid_coupon:${v.reason}`);
      couponId = v.coupon.id;
      // compute discount
      if (v.coupon.discount_pct) {
        final = Math.max(0, final - Math.round((final * Number(v.coupon.discount_pct)) / 100));
      } else if (v.coupon.discount_cents) {
        final = Math.max(0, final - Number(v.coupon.discount_cents));
      }
    }

    const [ins]: any = await conn.query(
      'INSERT INTO payment_orders (user_id, plan_id, months, reader_id, delivery_mode, address_id, coupon_id, amount_cents, final_cents, currency, magazine_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        params.userId,
        params.planId,
        params.months,
        params.readerId || null,
        deliveryMode,
        params.addressId || null,
        couponId,
        baseAmount,
        final,
        effectiveCurrency,
        params.magazineId || null,
      ],
    );
    const orderId = ins.insertId;
    await conn.commit();
    // return order info including a UPI uri (simple)
    const upi = `upi://pay?pa=merchant@upi&pn=Magazine&tn=Order%20${orderId}&am=${(final / 100).toFixed(2)}&cu=${effectiveCurrency}`;
    return {
      orderId,
      amountCents: baseAmount,
      finalCents: final,
      currency: effectiveCurrency,
      upi,
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function createEditionOrder(
  userId: number,
  editionId: number,
  priceCents: number = 199,
  currency: string = 'INR',
) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [edRows]: any = await conn.query(
      'SELECT id, magazineId FROM magazine_editions WHERE id = ? AND publishedAt IS NOT NULL LIMIT 1',
      [editionId],
    );
    const ed = edRows[0];
    if (!ed) throw new Error('edition_not_found');
    const [ins]: any = await conn.query(
      'INSERT INTO edition_orders (user_id, edition_id, amount_cents, currency, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, editionId, priceCents, currency, 'PENDING'],
    );
    const orderId = ins.insertId;
    const upi = `upi://pay?pa=merchant@upi&pn=Magazine&tn=Edition%20${orderId}&am=${(priceCents / 100).toFixed(2)}&cu=${currency}`;
    return { orderId, finalCents: priceCents, currency, upi };
  } finally {
    conn.release();
  }
}

export async function attachEditionProof(
  orderId: number,
  userId: number,
  fileKey?: string,
  url?: string,
) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [r]: any = await conn.query(
      'INSERT INTO edition_order_proofs (order_id, user_id, file_key, url, created_at) VALUES (?, ?, ?, ?, NOW())',
      [orderId, userId, fileKey || null, url || null],
    );
    return r.insertId;
  } finally {
    conn.release();
  }
}

export async function verifyEditionProof(proofId: number, adminId: number) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [pRows]: any = await conn.query(
      'SELECT * FROM edition_order_proofs WHERE id = ? LIMIT 1',
      [proofId],
    );
    const proof = pRows[0];
    if (!proof) throw new Error('proof_not_found');
    const [oRows]: any = await conn.query('SELECT * FROM edition_orders WHERE id = ? LIMIT 1', [
      proof.order_id,
    ]);
    const order = oRows[0];
    if (!order) throw new Error('order_not_found');
    if (order.status === 'PAID') throw new Error('order_already_paid');

    const [payIns]: any = await conn.query(
      'INSERT INTO payments (userId, amountCents, currency, provider, providerPaymentId, status, metadata, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        order.user_id,
        order.amount_cents,
        order.currency,
        'UPI',
        proof.id.toString(),
        'SUCCESS',
        JSON.stringify({ proofId: proof.id, type: 'edition' }),
      ],
    );
    const paymentId = payIns.insertId;
    await conn.query(
      'INSERT INTO edition_purchases (userId, editionId, priceCents, currency, paymentId, purchasedAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [order.user_id, order.edition_id, order.amount_cents, order.currency, paymentId],
    );
    await conn.query('UPDATE edition_orders SET status = ? WHERE id = ?', ['PAID', order.id]);
    await conn.query(
      'UPDATE edition_order_proofs SET verified = 1, verified_at = NOW(), verified_by = ? WHERE id = ?',
      [adminId, proof.id],
    );
    await conn.commit();
    return { paymentId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function attachProof(orderId: number, userId: number, fileKey?: string, url?: string) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [r]: any = await conn.query(
      'INSERT INTO payment_proofs (order_id, user_id, file_key, url, created_at) VALUES (?, ?, ?, ?, NOW())',
      [orderId, userId, fileKey || null, url || null],
    );
    return r.insertId;
  } finally {
    conn.release();
  }
}

export async function verifyProof(proofId: number, adminId: number) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // load proof and order
    const [pRows]: any = await conn.query('SELECT * FROM payment_proofs WHERE id = ? LIMIT 1', [
      proofId,
    ]);
    const proof = pRows[0];
    if (!proof) throw new Error('proof_not_found');
    const [oRows]: any = await conn.query('SELECT * FROM payment_orders WHERE id = ? LIMIT 1', [
      proof.order_id,
    ]);
    const order = oRows[0];
    if (!order) throw new Error('order_not_found');
    if (order.status === 'PAID') throw new Error('order_already_paid');

    // create subscription
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + Number(order.months));
    const [insSub]: any = await conn.query(
      'INSERT INTO user_subscriptions (user_id, reader_id, magazine_id, plan_id, delivery_mode, status, starts_at, ends_at, auto_renew, price_cents, currency, coupon_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [
        order.user_id,
        order.reader_id || null,
        order.magazine_id || null,
        order.plan_id,
        order.delivery_mode || 'BOTH',
        'ACTIVE',
        startsAt,
        endsAt,
        1,
        order.final_cents,
        order.currency,
        order.coupon_id || null,
      ],
    );
    const subscriptionId = insSub.insertId;

    // create payment record (success)
    const [pay]: any = await conn.query(
      'INSERT INTO payments (user_id, subscription_id, amount_cents, currency, provider, provider_payment_id, status, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        order.user_id,
        subscriptionId,
        order.final_cents,
        order.currency,
        'UPI',
        proof.id.toString(),
        'SUCCESS',
        JSON.stringify({ proofId: proof.id }),
      ],
    );
    const paymentId = pay.insertId;

    // record coupon usage if exists
    if (order.coupon_id) {
      await recordCouponUsage(order.coupon_id, order.user_id, subscriptionId);
    }

    // mark order and proof as paid/verified
    await conn.query('UPDATE payment_orders SET status = ? WHERE id = ?', ['PAID', order.id]);
    await conn.query(
      'UPDATE payment_proofs SET verified = 1, verified_at = NOW(), verified_by = ? WHERE id = ?',
      [adminId, proof.id],
    );

    // generate dispatch schedules if necessary (attempt to attach edition by order.magazine_id)
    const [planRows]: any = await conn.query(
      'SELECT dispatch_frequency_days, auto_dispatch, delivery_mode FROM subscription_plans WHERE id = ? LIMIT 1',
      [order.plan_id],
    );
    const plan = planRows[0];
    if (plan.auto_dispatch && ['PHYSICAL', 'BOTH'].includes(order.delivery_mode)) {
      const freqDays = plan.dispatch_frequency_days || 30;
      let next = new Date(startsAt);
      while (next < endsAt) {
        // try to find edition for scheduled date if order.magazine_id provided
        let editionIdForSchedule = null;
        if (order.magazine_id) {
          const [edRows]: any = await conn.query(
            'SELECT id FROM magazine_editions WHERE magazine_id = ? AND published_at <= ? ORDER BY published_at DESC LIMIT 1',
            [order.magazine_id, next],
          );
          if (edRows && edRows[0]) editionIdForSchedule = edRows[0].id;
        }
        await conn.query(
          'INSERT INTO dispatch_schedules (subscription_id, edition_id, scheduled_at, status, created_at) VALUES (?, ?, ?, ?, NOW())',
          [subscriptionId, editionIdForSchedule, next, 'SCHEDULED'],
        );
        next = new Date(next.getTime() + freqDays * 24 * 60 * 60 * 1000);
      }
    }

    await conn.commit();
    return { subscriptionId, paymentId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
