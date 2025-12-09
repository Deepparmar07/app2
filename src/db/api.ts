import { supabase } from './supabase';
import type { Profile, Folder, File, SharedLink } from '@/types';

export const profileApi = {
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

export const folderApi = {
  async getFolders(parentId: string | null = null): Promise<Folder[]> {
    let query = supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true });

    if (parentId === null) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getFolder(id: string): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createFolder(name: string, parentId: string | null, ownerId: string): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        parent_id: parentId,
        owner_id: ownerId,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getFolderPath(folderId: string | null): Promise<Folder[]> {
    if (!folderId) return [];

    const path: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = await this.getFolder(currentId);
      if (!folder) break;
      path.unshift(folder);
      currentId = folder.parent_id;
    }

    return path;
  },
};

export const fileApi = {
  async getFiles(folderId: string | null = null, includeDeleted = false): Promise<File[]> {
    let query = supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (folderId === null) {
      query = query.is('folder_id', null);
    } else {
      query = query.eq('folder_id', folderId);
    }

    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getDeletedFiles(): Promise<File[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getFile(id: string): Promise<File | null> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createFile(file: Omit<File, 'id' | 'created_at' | 'updated_at' | 'is_deleted' | 'deleted_at'>): Promise<File | null> {
    const { data, error } = await supabase
      .from('files')
      .insert(file)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async softDeleteFile(id: string): Promise<File | null> {
    const { data, error } = await supabase
      .from('files')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async restoreFile(id: string): Promise<File | null> {
    const { data, error } = await supabase
      .from('files')
      .update({
        is_deleted: false,
        deleted_at: null,
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async permanentDeleteFile(id: string): Promise<void> {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async searchFiles(query: string): Promise<File[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('is_deleted', false)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

export const sharedLinkApi = {
  async createShareLink(
    fileId: string | null,
    folderId: string | null,
    ownerId: string,
    canDownload = true,
    expiresAt: string | null = null
  ): Promise<SharedLink | null> {
    const shareToken = crypto.randomUUID();

    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        file_id: fileId,
        folder_id: folderId,
        owner_id: ownerId,
        share_token: shareToken,
        can_download: canDownload,
        expires_at: expiresAt,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getShareLink(token: string): Promise<SharedLink | null> {
    const { data, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('share_token', token)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getUserShareLinks(userId: string): Promise<SharedLink[]> {
    const { data, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async deleteShareLink(id: string): Promise<void> {
    const { error } = await supabase
      .from('shared_links')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const storageApi = {
  async uploadFile(
    file: globalThis.File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from('app-84kgjmh9j8qp_files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return filePath;
  },

  async downloadFile(path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('app-84kgjmh9j8qp_files')
      .download(path);

    if (error) throw error;
    return data;
  },

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('app-84kgjmh9j8qp_files')
      .remove([path]);

    if (error) throw error;
  },

  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from('app-84kgjmh9j8qp_files')
      .getPublicUrl(path);

    return data.publicUrl;
  },
};
