-- Initial migration for Magazine schema
-- NOTE: primary_guardian_id is created nullable to avoid circular FK issues.
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(50),
  primary_guardian_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
);

CREATE TABLE guardians (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  relation VARCHAR(100),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_guardians_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- add unique index on users.primary_guardian_id (nullable)
CREATE UNIQUE INDEX ux_users_primary_guardian ON users (primary_guardian_id);

CREATE TABLE readers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  dob DATETIME NULL,
  delivery_mode ENUM('ELECTRONIC','PHYSICAL','BOTH') NOT NULL DEFAULT 'ELECTRONIC',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_readers_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  reader_id BIGINT NULL,
  line1 VARCHAR(400) NOT NULL,
  line2 VARCHAR(400),
  city VARCHAR(200) NOT NULL,
  state VARCHAR(200),
  postal_code VARCHAR(50) NOT NULL,
  country VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_addresses_user_id (user_id),
  INDEX idx_addresses_reader_id (reader_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE SET NULL
);

CREATE TABLE magazines (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  publisher VARCHAR(255),
  description TEXT,
  category VARCHAR(200),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE magazine_editions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  magazine_id BIGINT NOT NULL,
  volume INT NULL,
  issue_number INT NULL,
  sku VARCHAR(255) UNIQUE,
  published_at DATETIME NULL,
  pages INT NULL,
  file_key VARCHAR(1024),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_editions_magazine_id (magazine_id),
  FOREIGN KEY (magazine_id) REFERENCES magazines(id) ON DELETE CASCADE
);

CREATE TABLE subscription_plans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price_cents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  min_months INT NOT NULL DEFAULT 1,
  max_months INT NULL,
  delivery_mode ENUM('ELECTRONIC','PHYSICAL','BOTH') NOT NULL DEFAULT 'BOTH',
  auto_dispatch BOOLEAN NOT NULL DEFAULT TRUE,
  dispatch_frequency_days INT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  reader_id BIGINT NULL,
  plan_id BIGINT NOT NULL,
  status ENUM('ACTIVE','CANCELLED','EXPIRED','PENDING') NOT NULL DEFAULT 'PENDING',
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  price_cents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  coupon_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subscriptions_user_id (user_id),
  INDEX idx_subscriptions_reader_id (reader_id),
  INDEX idx_subscriptions_plan_id (plan_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE SET NULL,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
);

CREATE TABLE edition_purchases (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  reader_id BIGINT NULL,
  edition_id BIGINT NOT NULL,
  price_cents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  payment_id BIGINT NULL,
  purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_purchases_user_id (user_id),
  INDEX idx_purchases_reader_id (reader_id),
  INDEX idx_purchases_edition_id (edition_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE SET NULL,
  FOREIGN KEY (edition_id) REFERENCES magazine_editions(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  subscription_id BIGINT NULL,
  amount_cents INT NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  provider VARCHAR(255) NOT NULL,
  provider_payment_id VARCHAR(500),
  status ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_user_id (user_id),
  INDEX idx_payments_subscription_id (subscription_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL
);

CREATE TABLE coupons (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  discount_pct INT NULL,
  discount_cents INT NULL,
  expires_at DATETIME NULL,
  max_uses INT NULL,
  per_user_limit INT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coupon_usages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  coupon_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  subscription_id BIGINT NULL,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_coupon_usages_coupon_id (coupon_id),
  INDEX idx_coupon_usages_user_id (user_id),
  INDEX idx_coupon_usages_subscription_id (subscription_id),
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL
);

CREATE TABLE dispatch_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subscription_id BIGINT NOT NULL,
  edition_id BIGINT NULL,
  scheduled_at DATETIME NOT NULL,
  status ENUM('SCHEDULED','DISPATCHED','DELIVERED','FAILED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  dispatched_at DATETIME NULL,
  tracking_number VARCHAR(255),
  address_id BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dispatch_subscription_id (subscription_id),
  INDEX idx_dispatch_edition_id (edition_id),
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (edition_id) REFERENCES magazine_editions(id) ON DELETE SET NULL,
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

CREATE TABLE bookmarks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reader_id BIGINT NOT NULL,
  edition_id BIGINT NOT NULL,
  page_number INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bookmarks_reader_id (reader_id),
  INDEX idx_bookmarks_edition_id (edition_id),
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE,
  FOREIGN KEY (edition_id) REFERENCES magazine_editions(id) ON DELETE CASCADE
);

CREATE TABLE highlights (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reader_id BIGINT NOT NULL,
  edition_id BIGINT NOT NULL,
  page_number INT NULL,
  text TEXT NOT NULL,
  color VARCHAR(50),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_highlights_reader_id (reader_id),
  INDEX idx_highlights_edition_id (edition_id),
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE,
  FOREIGN KEY (edition_id) REFERENCES magazine_editions(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reader_id BIGINT NOT NULL,
  edition_id BIGINT NOT NULL,
  page_number INT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notes_reader_id (reader_id),
  INDEX idx_notes_edition_id (edition_id),
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE,
  FOREIGN KEY (edition_id) REFERENCES magazine_editions(id) ON DELETE CASCADE
);

CREATE TABLE reader_progress (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reader_id BIGINT NOT NULL,
  edition_id BIGINT NOT NULL,
  current_page INT NULL,
  percent FLOAT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_reader_edition (reader_id, edition_id),
  INDEX idx_progress_reader_id (reader_id),
  INDEX idx_progress_edition_id (edition_id),
  FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE,
  FOREIGN KEY (edition_id) REFERENCES magazine_editions(id) ON DELETE CASCADE
);

