-- Add delivery_mode to magazine_plans: each magazine+plan can have different prices for E-only, Physical-only, or Both
ALTER TABLE magazine_plans ADD COLUMN delivery_mode ENUM('ELECTRONIC','PHYSICAL','BOTH') NOT NULL DEFAULT 'BOTH' AFTER plan_id;

-- Drop old unique, add new one including delivery_mode
ALTER TABLE magazine_plans DROP INDEX magazine_plans_magazine_plan;
ALTER TABLE magazine_plans ADD UNIQUE KEY magazine_plans_magazine_plan_mode (magazine_id, plan_id, delivery_mode);

-- Add delivery_mode to user_subscriptions to record user's choice
-- (no AFTER clause: DB may use planId or plan_id depending on which migrations were applied)
ALTER TABLE user_subscriptions ADD COLUMN delivery_mode ENUM('ELECTRONIC','PHYSICAL','BOTH') NULL;
