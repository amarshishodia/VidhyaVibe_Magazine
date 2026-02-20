-- Magazine-specific plan pricing: each magazine can have different prices for each plan
CREATE TABLE magazine_plans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  magazine_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  price_cents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY magazine_plans_magazine_plan (magazine_id, plan_id),
  INDEX idx_magazine_plans_magazine (magazine_id),
  INDEX idx_magazine_plans_plan (plan_id),
  FOREIGN KEY (magazine_id) REFERENCES magazines(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);
