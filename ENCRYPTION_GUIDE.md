# 🔐 AES-256 Encryption Implementation

## Overview
SecureBox now includes **client-side AES-256-GCM encryption** for all file uploads. Files are encrypted before being sent to the server and decrypted when downloaded, ensuring end-to-end security.

## How It Works

### Encryption Process
1. **User uploads a file** → Client-side encryption happens in the browser
2. **AES-256-GCM algorithm** encrypts the file using your secret key
3. **Encrypted file** is uploaded to Supabase storage (stored as `.enc` files)
4. **Original file metadata** is stored in database (name, size, type)

### Decryption Process
1. **User downloads/previews a file** → Encrypted file is fetched from storage
2. **Client-side decryption** happens in the browser using the same key
3. **Original file** is restored and displayed/downloaded to the user

## Security Features

### ✅ What's Protected
- **All file contents** are encrypted with AES-256-GCM
- **Files at rest** on the server are encrypted
- **Files in transit** are protected by HTTPS + encryption
- **Zero-knowledge architecture** - Server never sees unencrypted files

### 🔑 Encryption Key
- Default key: `SecureBox2025FileEncryptionKey32`
- Location: `.env` file → `VITE_ENCRYPTION_KEY`
- Algorithm: AES-256-GCM (256-bit key, 96-bit IV)
- Each file gets a unique random IV for additional security

## Configuration

### Change Your Encryption Key

**Important:** Change the default key for production use!

1. Open `.env` file
2. Update `VITE_ENCRYPTION_KEY` with your custom 32-character key:
```env
VITE_ENCRYPTION_KEY=YourCustom32CharacterKeyHere123
```

3. Restart the development server

### Generate a Secure Key

Use the built-in generator in your browser console:
```javascript
import { generateEncryptionKey } from '@/lib/encryption';
console.log(generateEncryptionKey());
```

Or use this command:
```javascript
Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
```

## Technical Details

### Algorithm Specifications
- **Cipher**: AES-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits
- **IV Size**: 96 bits (12 bytes)
- **Authentication**: Built-in GMAC authentication tag
- **Browser API**: Web Crypto API (native browser encryption)

### File Structure
Encrypted files contain:
```
[12 bytes IV] + [Encrypted Data] + [16 bytes Auth Tag]
```

### Code Location
- **Encryption utilities**: `src/lib/encryption.ts`
- **Storage API**: `src/db/api.ts` (uploadFile, downloadFile)
- **Upload component**: `src/components/files/UploadButton.tsx`

## Benefits

✅ **End-to-End Encryption** - Files encrypted on client before upload  
✅ **Zero-Knowledge** - Server cannot read file contents  
✅ **Automatic** - Transparent to users, works seamlessly  
✅ **Standards-Based** - Uses Web Crypto API (FIPS compliant)  
✅ **Performance** - Hardware-accelerated encryption in modern browsers  
✅ **Authenticated** - GCM mode provides integrity protection  

## Important Notes

⚠️ **Key Management**
- Store your encryption key securely
- Never commit `.env` to version control (already in `.gitignore`)
- If you lose the key, encrypted files cannot be recovered
- Changing the key will make old encrypted files unreadable

⚠️ **Compatibility**
- Requires modern browser with Web Crypto API support
- Works on Chrome, Firefox, Safari, Edge (latest versions)
- Files uploaded before encryption was enabled won't be encrypted

## Migration Notice

Files uploaded **before** this encryption implementation will still work but are **not encrypted**. For maximum security:
1. Re-upload sensitive files after encryption is enabled
2. Delete old unencrypted versions from recycle bin

## Testing

To verify encryption is working:
1. Upload a file
2. Check Supabase storage - files will have `.enc` extension
3. Download/preview the file - it should work normally
4. Try downloading the `.enc` file directly from storage - it will be gibberish

## Future Enhancements

- [ ] Per-user encryption keys
- [ ] Password-protected shared links with separate keys
- [ ] File encryption status indicator in UI
- [ ] Re-encryption with key rotation
- [ ] Encrypted file search (homomorphic encryption)
