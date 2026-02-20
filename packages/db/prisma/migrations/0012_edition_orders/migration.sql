-- Support edition purchase orders (single edition buy)
CREATE TABLE IF NOT EXISTS edition_orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  edition_id BIGINT NOT NULL,
  amount_cents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status ENUM('PENDING','PAID','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_edition_orders_user_id (user_id),
  INDEX idx_edition_orders_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (edition_id) REFERENCES magazine_editions(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS edition_order_proofs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  file_key VARCHAR(1024),
  url VARCHAR(2000),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at DATETIME NULL,
  verified_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_edition_proofs_order_id (order_id),
  FOREIGN KEY (order_id) REFERENCES edition_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
