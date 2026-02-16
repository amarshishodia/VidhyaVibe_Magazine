-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  method VARCHAR(10),
  path VARCHAR(1000),
  body JSON NULL,
  ip_address VARCHAR(100),
  user_agent VARCHAR(1000),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user_id (user_id)
);

