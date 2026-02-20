-- Add description and coverKey to magazine_editions for edition-specific metadata
ALTER TABLE magazine_editions ADD COLUMN description TEXT NULL;
ALTER TABLE magazine_editions ADD COLUMN coverKey VARCHAR(1024) NULL;
