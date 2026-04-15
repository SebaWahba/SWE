-- Add is_admin column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Add uploaded_by and timestamps to videos table
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS uploaded_by uuid,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_by ON public.videos(uploaded_by);

-- Add foreign key constraint for uploaded_by (optional, may fail if users table has different IDs)
-- ALTER TABLE public.videos
-- ADD CONSTRAINT videos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);
