-- Create videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  5368709120, -- 5GB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5368709120,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

-- Create storage policy for authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos'
);

-- Create storage policy for everyone to read videos (public bucket)
CREATE POLICY "Everyone can read videos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'videos'
);

-- Create storage policy for video owners to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos'
);
