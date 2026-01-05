-- Add social_links column to nominees table
ALTER TABLE nominees 
ADD COLUMN social_links JSONB DEFAULT '[]'::JSONB;

-- Comment describing the structure
COMMENT ON COLUMN nominees.social_links IS 'Array of social link objects: [{ "platform": "instagram", "url": "..." }]';
