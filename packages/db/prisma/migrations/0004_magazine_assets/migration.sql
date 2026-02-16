-- Add cover and sample fields and create edition_videos table
ALTER TABLE magazines ADD COLUMN cover_key VARCHAR(1024) NULL;
ALTER TABLE magazine_editions ADD COLUMN sample_key VARCHAR(1024) NULL;

CREATE TABLE IF NOT EXISTS edition_videos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  edition_id BIGINT NOT NULL,
  page_number INT NOT NULL,
  url VARCHAR(2000) NOT NULL,
  public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_videos_edition_id (edition_id),
  FOREIGN KEY (edition_id) REFERENCES magazine_editions(id) ON DELETE CASCADE
);

