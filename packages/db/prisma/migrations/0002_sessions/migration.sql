-- Create sessions table for device/session tracking
CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  device_name VARCHAR(255),
  ip_address VARCHAR(100),
  user_agent VARCHAR(1000),
  refresh_jti VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_refresh_jti (refresh_jti),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

