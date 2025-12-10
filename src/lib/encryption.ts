/**
 * AES-256-GCM Encryption/Decryption utilities for file security
 */

// Generate a secure encryption key from user's password or use a default key
const getEncryptionKey = async (userKey?: string): Promise<CryptoKey> => {
  const keyMaterial = userKey || import.meta.env.VITE_ENCRYPTION_KEY || 'default-secure-key-change-this';
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyMaterial.padEnd(32, '0').substring(0, 32));
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt file data using AES-256-GCM
 */
export const encryptFile = async (file: File, userKey?: string): Promise<Blob> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const key = await getEncryptionKey(userKey);
    
    // Generate a random initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the file data
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      arrayBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return new Blob([combined], { type: 'application/octet-stream' });
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Decrypt file data using AES-256-GCM
 */
export const decryptFile = async (encryptedBlob: Blob, originalType: string, userKey?: string): Promise<Blob> => {
  try {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const key = await getEncryptionKey(userKey);
    
    // Extract IV and encrypted data
    const iv = new Uint8Array(arrayBuffer.slice(0, 12));
    const encryptedData = arrayBuffer.slice(12);
    
    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    return new Blob([decryptedData], { type: originalType });
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
};

/**
 * Generate a secure random encryption key
 */
export const generateEncryptionKey = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
