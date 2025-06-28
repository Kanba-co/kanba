-- Add slug column to projects table
ALTER TABLE projects ADD COLUMN slug TEXT;

-- Create unique index on slug to ensure uniqueness
CREATE UNIQUE INDEX projects_slug_idx ON projects(slug);

-- Update existing projects to have a slug based on their name
UPDATE projects 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
) || '-' || SUBSTRING(id::text, 1, 8);

-- Make slug column NOT NULL after populating existing records
ALTER TABLE projects ALTER COLUMN slug SET NOT NULL; 