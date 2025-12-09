export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  storage_used: number;
  storage_limit: number;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  storage_path: string;
  folder_id: string | null;
  owner_id: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedLink {
  id: string;
  file_id: string | null;
  folder_id: string | null;
  owner_id: string;
  share_token: string;
  can_download: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface FileWithOwner extends File {
  owner?: {
    username: string;
  };
}

export interface FolderWithOwner extends Folder {
  owner?: {
    username: string;
  };
}

export type ViewMode = 'grid' | 'list';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}
