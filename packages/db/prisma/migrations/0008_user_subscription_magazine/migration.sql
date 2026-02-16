-- Add magazine_id to user_subscriptions to scope subscriptions to a specific magazine
ALTER TABLE user_subscriptions
  ADD COLUMN magazine_id BIGINT NULL;

ALTER TABLE user_subscriptions
  ADD INDEX idx_subscriptions_magazine_id (magazine_id);

ALTER TABLE user_subscriptions
  ADD CONSTRAINT fk_user_subscriptions_magazine FOREIGN KEY (magazine_id) REFERENCES magazines(id) ON DELETE SET NULL;

