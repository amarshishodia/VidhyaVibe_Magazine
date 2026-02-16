-- Add plan_id and magazine_id to coupons for scoped coupons
ALTER TABLE coupons
  ADD COLUMN plan_id BIGINT NULL,
  ADD COLUMN magazine_id BIGINT NULL;

ALTER TABLE coupons
  ADD CONSTRAINT fk_coupons_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL;

ALTER TABLE coupons
  ADD CONSTRAINT fk_coupons_magazine FOREIGN KEY (magazine_id) REFERENCES magazines(id) ON DELETE SET NULL;

