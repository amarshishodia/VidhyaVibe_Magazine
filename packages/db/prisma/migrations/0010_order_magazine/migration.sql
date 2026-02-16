-- Add magazine_id to payment_orders to track which magazine the order is for
ALTER TABLE payment_orders
  ADD COLUMN magazine_id BIGINT NULL;

ALTER TABLE payment_orders
  ADD CONSTRAINT fk_payment_orders_magazine FOREIGN KEY (magazine_id) REFERENCES magazines(id) ON DELETE SET NULL;

