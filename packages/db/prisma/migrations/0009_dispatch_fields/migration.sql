-- Add tracking timestamps and courier tracking number to dispatch_schedules
ALTER TABLE dispatch_schedules
  ADD COLUMN packed_at DATETIME NULL,
  ADD COLUMN shipped_at DATETIME NULL,
  ADD COLUMN delivered_at DATETIME NULL,
  ADD COLUMN courier_tracking_number VARCHAR(255) NULL;

