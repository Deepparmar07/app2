# ☁️ Cloud Storage Configuration Guide

## Overview
SecureBox now supports **multiple cloud storage providers** with seamless switching between:
- **Supabase Storage** (default)
- **AWS S3** (Amazon Simple Storage Service)

All files are automatically encrypted with AES-256-GCM before being uploaded to any cloud provider.

## 🏗️ Architecture

### Storage Provider System
```
┌─────────────────────────────────────────────────┐
│           SecureBox Application                 │
└─────────────────┬───────────────────────────────┘
                  │
          ┌───────▼───────┐
          │ Storage Manager│
          │  + Encryption  │
          └───────┬───────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼────┐
    │ Supabase │    │  AWS S3  │
    │ Provider │    │ Provider │
    └──────────┘    └──────────┘
```

## 📋 Current Configuration

### Default Provider: Supabase
Your system is currently configured to use **Supabase Storage** (no additional setup needed).

Location: `.env` → `VITE_STORAGE_PROVIDER=supabase`

## 🔄 Switch to AWS S3

### Step 1: Get AWS Credentials

1. **Create AWS Account**: https://aws.amazon.com/
2. **Create S3 Bucket**:
   - Go to AWS S3 Console
   - Click "Create bucket"
   - Choose a unique bucket name (e.g., `securebox-files-prod`)
   - Select your preferred region (e.g., `us-east-1`)
   - Keep default settings or configure as needed

3. **Create IAM User** for programmatic access:
   - Go to IAM Console
   - Create new user with "Programmatic access"
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save the **Access Key ID** and **Secret Access Key**

4. **Configure Bucket Permissions**:
   - Enable CORS if needed for web uploads
   - Set appropriate bucket policy for your use case

### Step 2: Update Environment Variables

Edit `.env` file:

```env
# Change storage provider to S3
VITE_STORAGE_PROVIDER=s3

# Add your AWS S3 credentials
VITE_S3_BUCKET=your-bucket-name
VITE_S3_REGION=us-east-1
VITE_S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
VITE_S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
VITE_S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
```

### Step 3: Restart Application

```powershell
# Stop current server (Ctrl+C)
# Restart with:
cd C:\Users\jenil\Downloads\Epic1\app2
npx vite --host 127.0.0.1
```

## 🔒 Security Features

### ✅ Encryption at Rest
- All files encrypted with AES-256-GCM **before** upload
- Cloud providers only store encrypted blobs
- Even if cloud storage is compromised, files remain secure

### ✅ Encryption in Transit
- HTTPS for all communications
- TLS 1.2+ encryption for S3 connections
- Secure API authentication

### ✅ Access Control
- AWS IAM policies for S3 access control
- Supabase RLS (Row Level Security) policies
- User-specific file paths (`userId/filename.enc`)

## 📊 Provider Comparison

| Feature | Supabase Storage | AWS S3 |
|---------|-----------------|---------|
| **Setup Complexity** | ✅ Easy (already configured) | ⚠️ Moderate (AWS setup) |
| **Cost** | Free tier: 1GB | Free tier: 5GB (12 months) |
| **Scalability** | Good | Excellent |
| **Geographic Distribution** | Limited | Global (multiple regions) |
| **Upload Speed** | Fast | Very Fast |
| **Management** | Simple dashboard | AWS Console |
| **Additional Features** | Built-in auth integration | Extensive AWS ecosystem |

## 🛠️ Advanced Configuration

### S3-Compatible Storage Providers

The system also works with S3-compatible services:

**DigitalOcean Spaces:**
```env
VITE_STORAGE_PROVIDER=s3
VITE_S3_BUCKET=your-space-name
VITE_S3_REGION=nyc3
VITE_S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
VITE_S3_ACCESS_KEY_ID=your-key
VITE_S3_SECRET_ACCESS_KEY=your-secret
```

**Cloudflare R2:**
```env
VITE_STORAGE_PROVIDER=s3
VITE_S3_BUCKET=your-bucket
VITE_S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
VITE_S3_ACCESS_KEY_ID=your-key
VITE_S3_SECRET_ACCESS_KEY=your-secret
```

**MinIO (Self-hosted):**
```env
VITE_STORAGE_PROVIDER=s3
VITE_S3_BUCKET=your-bucket
VITE_S3_ENDPOINT=http://your-minio-server:9000
VITE_S3_ACCESS_KEY_ID=minioadmin
VITE_S3_SECRET_ACCESS_KEY=minioadmin
```

## 🔍 Verify Storage Provider

Check which provider is active:

1. Open browser console (F12)
2. Run:
```javascript
// The storage provider name will be logged
console.log('Storage Provider:', storageApi.getStorageProvider());
```

Or check your uploads - S3 files will be visible in AWS S3 Console, Supabase files in Supabase Storage dashboard.

## 📝 File Naming Convention

All encrypted files use this pattern:
```
{userId}/{timestamp}_{random}.{ext}.enc

Example:
123e4567-e89b-12d3-a456-426614174000/1733864521_x7k2m.jpg.enc
```

## 🔧 Troubleshooting

### S3 Upload Fails

**Problem:** `S3 upload failed: 403 Forbidden`
- **Solution:** Check IAM user has S3 write permissions
- Verify bucket name and region are correct
- Ensure Access Key ID and Secret are valid

### CORS Errors

**Problem:** Browser blocks S3 requests
- **Solution:** Configure S3 bucket CORS policy:

```json
[
  {
    "AllowedOrigins": ["http://127.0.0.1:5174"],
    "AllowedMethods": ["GET", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

### Supabase Storage Errors

**Problem:** `Storage bucket not found`
- **Solution:** Verify Supabase project is active
- Check bucket name: `app-84kgjmh9j8qp_files`
- Ensure RLS policies are configured

## 💰 Cost Considerations

### Supabase Pricing
- **Free tier**: 1GB storage
- **Pro**: $25/month (100GB included)
- Additional: $0.021/GB/month

### AWS S3 Pricing
- **Free tier**: 5GB for 12 months (new accounts)
- **Standard**: ~$0.023/GB/month
- **Data transfer**: First 100GB/month free
- **Requests**: $0.0004 per 1,000 GET requests

### Recommendation
- **Start with Supabase** (easier setup, free tier sufficient for testing)
- **Scale to S3** when needed (better pricing for large storage)

## 🚀 Future Enhancements

Planned storage features:
- [ ] Google Cloud Storage support
- [ ] Azure Blob Storage support
- [ ] Automatic failover between providers
- [ ] Multi-cloud redundancy (store in multiple providers)
- [ ] CDN integration for faster downloads
- [ ] Storage usage analytics per provider

## 📚 Code Structure

```
src/lib/
├── storageProviders.ts    # Storage provider implementations
├── encryption.ts          # AES encryption utilities

src/db/
└── api.ts                 # Storage API with provider abstraction
```

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` file** (already in `.gitignore`)
2. ✅ **Rotate S3 credentials regularly** (every 90 days recommended)
3. ✅ **Use IAM roles** for production deployments
4. ✅ **Enable S3 bucket versioning** for backup/recovery
5. ✅ **Monitor access logs** for suspicious activity
6. ✅ **Keep encryption key secure** and backed up
7. ✅ **Use separate buckets** for dev/staging/production

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review error logs in browser console
3. Verify environment variables are set correctly
4. Ensure cloud provider services are active and accessible
