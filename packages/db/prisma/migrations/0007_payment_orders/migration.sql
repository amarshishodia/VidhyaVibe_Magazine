-- Create payment_orders and payment_proofs tables
CREATE TABLE IF NOT EXISTS payment_orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  months INT NOT NULL,
  reader_id BIGINT NULL,
  delivery_mode ENUM('ELECTRONIC','PHYSICAL','BOTH') NOT NULL DEFAULT 'ELECTRONIC',
  address_id BIGINT NULL,
  coupon_id BIGINT NULL,
  amount_cents INT NOT NULL,
  final_cents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status ENUM('PENDING','PAID','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE SET NULL,
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_proofs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  file_key VARCHAR(1024),
  url VARCHAR(2000),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at DATETIME NULL,
  verified_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_proofs_order_id (order_id),
  FOREIGN KEY (order_id) REFERENCES payment_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

