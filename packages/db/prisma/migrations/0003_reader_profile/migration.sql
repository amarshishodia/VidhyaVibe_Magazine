-- Add reader profile fields: age, className, schoolName, schoolCity, parentPermissionRequired
ALTER TABLE readers
  ADD COLUMN age INT NULL,
  ADD COLUMN class VARCHAR(100) NULL,
  ADD COLUMN school_name VARCHAR(255) NULL,
  ADD COLUMN school_city VARCHAR(255) NULL,
  ADD COLUMN parent_permission_required BOOLEAN NOT NULL DEFAULT FALSE;

-- Note: column names in DB differ slightly from Prisma field names:
-- Prisma: className -> DB: class, schoolName -> school_name, schoolCity -> school_city, parentPermissionRequired -> parent_permission_required

