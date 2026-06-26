-- Migration 003: Create entry-images storage bucket + RLS
-- Requires: executed in Supabase Dashboard SQL Editor

-- Create the bucket (public so URLs are accessible without auth)
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('entry-images', 'entry-images', true, false)
ON CONFLICT (id) DO NOTHING;

-- Allow anon users to read any file in the bucket
CREATE POLICY "Anyone can view entry images"
ON storage.objects FOR SELECT
USING (bucket_id = 'entry-images');

-- Allow anon users to upload files to the bucket
CREATE POLICY "Anyone can upload entry images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'entry-images');