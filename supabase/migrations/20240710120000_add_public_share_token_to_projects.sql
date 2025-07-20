-- Proje public paylaşım token alanı
ALTER TABLE projects ADD COLUMN public_share_token TEXT UNIQUE; 