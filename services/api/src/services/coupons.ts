import { prisma } from '@magazine/db';

export type CouponValidationResult = {
  valid: boolean;
  reason?: string;
  coupon?: any;
  discountCents?: number;
};

export async function validateCoupon(code: string, userId?: number, planId?: number, magazineId?: number): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return { valid: false, reason: 'not_found' };
  if (!coupon.active) return { valid: false, reason: 'inactive' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { valid: false, reason: 'expired' };

  // scope checks
  if (coupon.planId && planId && Number(coupon.planId) !== Number(planId)) {
    return { valid: false, reason: 'invalid_for_plan' };
  }
  if (coupon.magazineId && magazineId && Number(coupon.magazineId) !== Number(magazineId)) {
    return { valid: false, reason: 'invalid_for_magazine' };
  }

  // global usage limit
  if (coupon.maxUses) {
    const cnt = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
    if (cnt >= Number(coupon.maxUses)) return { valid: false, reason: 'exhausted' };
  }

  // per-user limit
  if (userId && coupon.perUserLimit) {
    const pcnt = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
    if (pcnt >= Number(coupon.perUserLimit)) return { valid: false, reason: 'user_limit_exceeded' };
  }

  return { valid: true, coupon };
}

export async function recordCouponUsage(couponId: number, userId?: number, subscriptionId?: number) {
  const r = await prisma.couponUsage.create({
    data: {
      couponId,
      userId: userId || undefined,
      subscriptionId: subscriptionId || undefined
    }
  });
  return r.id;
}

