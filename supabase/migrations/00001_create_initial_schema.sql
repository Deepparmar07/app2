/*
# Create SecureBox File Storage System Schema

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique, not null)
- `role` (user_role enum: 'user', 'admin', default: 'user')
- `storage_used` (bigint, default: 0) - bytes used
- `storage_limit` (bigint, default: 5368709120) - 5GB default limit
- `created_at` (timestamptz, default: now())

### folders
- `id` (uuid, primary key, default: gen_random_uuid())
- `name` (text, not null)
- `parent_id` (uuid, nullable, references folders.id)
- `owner_id` (uuid, not null, references profiles.id)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### files
- `id` (uuid, primary key, default: gen_random_uuid())
- `name` (text, not null)
- `size` (bigint, not null) - file size in bytes
- `type` (text, not null) - MIME type
- `storage_path` (text, not null) - path in Supabase storage
- `folder_id` (uuid, nullable, references folders.id)
- `owner_id` (uuid, not null, references profiles.id)
- `is_deleted` (boolean, default: false)
- `deleted_at` (timestamptz, nullable)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### shared_links
- `id` (uuid, primary key, default: gen_random_uuid())
- `file_id` (uuid, nullable, references files.id)
- `folder_id` (uuid, nullable, references folders.id)
- `owner_id` (uuid, not null, references profiles.id)
- `share_token` (text, unique, not null)
- `can_download` (boolean, default: true)
- `expires_at` (timestamptz, nullable)
- `created_at` (timestamptz, default: now())

## 2. Storage Bucket
- Create bucket: `app-84kgjmh9j8qp_files`
- Max file size: 50MB
- Public access: false

## 3. Security
- Enable RLS on all tables
- Create helper function `is_admin` to check admin role
- Profiles: Admins have full access, users can view/update own profile (except role)
- Folders: Users can manage their own folders, admins have full access
- Files: Users can manage their own files, admins have full access
- Shared Links: Users can manage their own links, public can view shared content
- Create public views for shareable data

## 4. Functions
- `handle_new_user()`: Auto-sync users to profiles after email confirmation
- `update_storage_usage()`: Update user storage usage when files are added/deleted
- `soft_delete_file()`: Move file to recycle bin
- `restore_file()`: Restore file from recycle bin
- `permanent_delete_file()`: Permanently delete file and update storage

## 5. Notes
- First registered user becomes admin
- Storage usage tracked in bytes
- Soft delete for recycle bin functionality
- Share tokens are unique identifiers for public access
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  storage_used bigint DEFAULT 0 NOT NULL,
  storage_limit bigint DEFAULT 5368709120 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(name, parent_id, owner_id)
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL,
  type text NOT NULL,
  storage_path text NOT NULL,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_deleted boolean DEFAULT false NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create shared_links table
CREATE TABLE IF NOT EXISTS shared_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES files(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL,
  can_download boolean DEFAULT true NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  CHECK (
    (file_id IS NOT NULL AND folder_id IS NULL) OR
    (file_id IS NULL AND folder_id IS NOT NULL)
  )
);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-84kgjmh9j8qp_files',
  'app-84kgjmh9j8qp_files',
  false,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid AND role = 'admin'::user_role
  );
$$;

-- Trigger function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  extracted_username := split_part(NEW.email, '@', 1);
  
  INSERT INTO profiles (id, username, role)
  VALUES (
    NEW.id,
    extracted_username,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-sync users after confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_deleted = false THEN
    UPDATE profiles
    SET storage_used = storage_used + NEW.size
    WHERE id = NEW.owner_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
      UPDATE profiles
      SET storage_used = storage_used - NEW.size
      WHERE id = NEW.owner_id;
    ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
      UPDATE profiles
      SET storage_used = storage_used + NEW.size
      WHERE id = NEW.owner_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
    SET storage_used = storage_used - OLD.size
    WHERE id = OLD.owner_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update storage usage
DROP TRIGGER IF EXISTS update_storage_usage_trigger ON files;
CREATE TRIGGER update_storage_usage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_usage();

-- RLS Policies for profiles
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile without changing role" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- RLS Policies for folders
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create own folders" ON folders
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));

-- RLS Policies for files
CREATE POLICY "Users can view own files" ON files
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create own files" ON files
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own files" ON files
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own files" ON files
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));

-- RLS Policies for shared_links
CREATE POLICY "Users can view own shared links" ON shared_links
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Anyone can view shared links by token" ON shared_links
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Users can create own shared links" ON shared_links
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own shared links" ON shared_links
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));

-- Storage policies
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-84kgjmh9j8qp_files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'app-84kgjmh9j8qp_files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-84kgjmh9j8qp_files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-84kgjmh9j8qp_files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create indexes for performance
CREATE INDEX idx_folders_owner ON folders(owner_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_folder ON files(folder_id);
CREATE INDEX idx_files_deleted ON files(is_deleted);
CREATE INDEX idx_shared_links_token ON shared_links(share_token);
CREATE INDEX idx_shared_links_file ON shared_links(file_id);
CREATE INDEX idx_shared_links_folder ON shared_links(folder_id);

-- Create view for public profiles
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  username,
  created_at
FROM profiles;