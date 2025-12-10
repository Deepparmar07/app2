/**
 * Storage Provider Interface - Supports multiple cloud storage backends
 * Currently supports: Supabase Storage, AWS S3
 */

import { encryptFile, decryptFile } from './encryption';

export interface StorageProvider {
  name: string;
  uploadFile(file: Blob, path: string): Promise<string>;
  downloadFile(path: string): Promise<Blob>;
  deleteFile(path: string): Promise<void>;
  getPublicUrl(path: string): string | null;
}

/**
 * AWS S3 Storage Provider
 */
export class S3StorageProvider implements StorageProvider {
  name = 'AWS S3';
  private bucket: string;
  private region: string;
  // Note: These are stored for potential future use with proper AWS signature signing
  // For now, using public bucket access or CORS-enabled bucket
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private accessKeyId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private secretAccessKey: string;

  constructor() {
    this.bucket = import.meta.env.VITE_S3_BUCKET || '';
    this.region = import.meta.env.VITE_S3_REGION || 'us-east-1';
    this.accessKeyId = import.meta.env.VITE_S3_ACCESS_KEY_ID || '';
    this.secretAccessKey = import.meta.env.VITE_S3_SECRET_ACCESS_KEY || '';
  }

  async uploadFile(file: Blob, path: string): Promise<string> {
    try {
      const endpoint = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed: ${response.statusText}`);
      }

      return path;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }

  async downloadFile(path: string): Promise<Blob> {
    try {
      const endpoint = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`S3 download failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('S3 download error:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const endpoint = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`S3 delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('S3 delete error:', error);
      throw error;
    }
  }

  getPublicUrl(path: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
  }
}

/**
 * Supabase Storage Provider
 */
export class SupabaseStorageProvider implements StorageProvider {
  name = 'Supabase';
  private supabase: any;
  private bucketName: string;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    this.bucketName = 'app-84kgjmh9j8qp_files';
  }

  async uploadFile(file: Blob, path: string): Promise<string> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return path;
  }

  async downloadFile(path: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(path);

    if (error) throw error;
    return data;
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) throw error;
  }

  getPublicUrl(path: string): string | null {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data?.publicUrl || null;
  }
}

/**
 * Storage Manager - Handles multiple storage providers with encryption
 */
export class StorageManager {
  private provider: StorageProvider;

  constructor(provider: StorageProvider) {
    this.provider = provider;
  }

  async uploadFile(file: File, userId: string): Promise<string> {
    // Encrypt the file before upload
    const encryptedBlob = await encryptFile(file);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}.enc`;
    const filePath = `${userId}/${fileName}`;

    await this.provider.uploadFile(encryptedBlob, filePath);
    return filePath;
  }

  async downloadFile(path: string, fileType: string): Promise<Blob> {
    const encryptedBlob = await this.provider.downloadFile(path);
    
    // Decrypt the file after download
    const decryptedBlob = await decryptFile(encryptedBlob, fileType);
    return decryptedBlob;
  }

  async deleteFile(path: string): Promise<void> {
    await this.provider.deleteFile(path);
  }

  getPublicUrl(path: string): string | null {
    return this.provider.getPublicUrl(path);
  }

  getProviderName(): string {
    return this.provider.name;
  }
}

/**
 * Create storage manager based on environment configuration
 */
export function createStorageManager(supabaseClient?: any): StorageManager {
  const storageType = import.meta.env.VITE_STORAGE_PROVIDER || 'supabase';

  let provider: StorageProvider;

  switch (storageType.toLowerCase()) {
    case 's3':
    case 'aws':
      provider = new S3StorageProvider();
      break;
    case 'supabase':
    default:
      if (!supabaseClient) {
        throw new Error('Supabase client is required for Supabase storage provider');
      }
      provider = new SupabaseStorageProvider(supabaseClient);
      break;
  }

  return new StorageManager(provider);
}
