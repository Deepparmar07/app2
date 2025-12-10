# 📊 How to View Supabase Database Data

## ✅ Your Supabase Configuration

**Project URL:** https://wszgopucksmjcgoakxmt.supabase.co  
**Database:** PostgreSQL  
**Region:** (Check your dashboard)  
**Status:** ✅ Connected and ready

---

## 🚀 Step 1: Access Supabase Dashboard

Go to: **https://supabase.com/dashboard**

1. Log in with your Supabase account
2. Select your project: Look for `app-84kgjmh9j8qp`
3. You should see your project in the list

---

## 📁 Step 2: View Your Database Tables

Once logged in, you'll see the sidebar on the left:

### **Navigate to Table Editor:**
1. Click **"Table Editor"** in the left sidebar
2. You'll see all your tables listed:
   - ✅ `profiles` - User information
   - ✅ `folders` - Folder structure
   - ✅ `files` - File metadata
   - ✅ `shared_links` - Shared file links
   - ✅ `auth.users` - Authentication users

---

## 📊 What Data You Can See

### **1. profiles Table**
**Shows:** User accounts and storage info

| Column | Description |
|--------|-------------|
| `id` | User ID (UUID) |
| `username` | Login username |
| `role` | 'admin' or 'user' |
| `storage_used` | Bytes used (0 initially) |
| `storage_limit` | 5GB (5368709120 bytes) |
| `created_at` | Registration date |

**How to view:**
1. Click "profiles" in table list
2. You'll see all registered users
3. Click any user to see details

---

### **2. files Table**
**Shows:** All uploaded file metadata (encrypted files in S3)

| Column | Description |
|--------|-------------|
| `id` | File ID (UUID) |
| `name` | File name (sanitized) |
| `size` | File size in bytes |
| `type` | MIME type (image/jpeg, etc.) |
| `storage_path` | AWS S3 path to encrypted file |
| `owner_id` | Who uploaded it |
| `folder_id` | Which folder it's in |
| `is_deleted` | Soft delete flag |
| `created_at` | Upload date |

**How to view:**
1. Click "files" in table list
2. All uploaded files appear here
3. `storage_path` points to encrypted file in AWS S3

---

### **3. folders Table**
**Shows:** Folder organization

| Column | Description |
|--------|-------------|
| `id` | Folder ID |
| `name` | Folder name |
| `parent_id` | Parent folder (for nested folders) |
| `owner_id` | Who owns it |
| `created_at` | Creation date |

---

### **4. shared_links Table**
**Shows:** Public share links

| Column | Description |
|--------|-------------|
| `id` | Link ID |
| `file_id` | Which file is shared |
| `share_token` | Unique share token |
| `can_download` | Download permission |
| `expires_at` | Expiration date (if set) |

---

## 🔍 Quick View Steps

### **To see all users:**
1. Open Supabase Dashboard
2. Click "Table Editor" → "profiles"
3. You'll see username, role, storage used

### **To see all files:**
1. Click "Table Editor" → "files"
2. See file names, sizes, upload dates
3. `storage_path` shows AWS S3 location

### **To see user's files:**
1. Click "Table Editor" → "files"
2. Look for files with your `owner_id`
3. Check which `folder_id` they're in

---

## 💻 Advanced: SQL Queries

You can also run SQL queries directly. Click **"SQL Editor"** in the sidebar:

### **View all users with storage info:**
```sql
SELECT 
  username,
  role,
  storage_used,
  storage_limit,
  created_at
FROM profiles
ORDER BY created_at DESC;
```

### **See all files by user:**
```sql
SELECT 
  f.name,
  f.size,
  f.type,
  p.username,
  f.created_at
FROM files f
JOIN profiles p ON f.owner_id = p.id
WHERE f.is_deleted = false
ORDER BY f.created_at DESC;
```

### **Count files per user:**
```sql
SELECT 
  p.username,
  COUNT(f.id) as file_count,
  SUM(f.size) as total_size
FROM profiles p
LEFT JOIN files f ON p.id = f.owner_id AND f.is_deleted = false
GROUP BY p.id
ORDER BY file_count DESC;
```

### **See storage usage details:**
```sql
SELECT 
  username,
  ROUND(storage_used / 1024.0 / 1024.0, 2) as used_mb,
  ROUND(storage_limit / 1024.0 / 1024.0 / 1024.0, 1) as limit_gb,
  ROUND((storage_used::float / storage_limit) * 100, 1) as percentage_used
FROM profiles
ORDER BY storage_used DESC;
```

---

## 🔐 Important Notes

### **About Encrypted Files:**
- Files are stored in AWS S3 bucket `epicbox1`
- They're encrypted with AES-256
- `storage_path` in database points to S3
- Files have `.enc` extension in S3
- **Cannot be read directly** from database (they're in S3)

### **Data Structure:**
```
Supabase Database (PostgreSQL)
├── profiles → User accounts
├── folders → Folder structure
├── files → File metadata (points to S3)
└── shared_links → Share permissions

AWS S3 (epicbox1 bucket)
├── {user-id}/
│   ├── encrypted-file-1.jpg.enc
│   ├── encrypted-file-2.pdf.enc
│   └── ...
```

---

## 🎯 Current Database Status

**Tables created:** ✅ YES  
**Sample data:** Check by running app at http://127.0.0.1:5174/  
**Storage:** AWS S3 (bucket: `epicbox1`)  
**Encryption:** AES-256 GCM  

---

## 📲 To View Your Data Now:

1. **Go to:** https://supabase.com/dashboard
2. **Select project:** Find your project
3. **Click:** "Table Editor"
4. **See:**
   - `profiles` → User list
   - `files` → All uploaded files
   - `folders` → Folder structure

---

## 🔗 Quick Links

| What | Link |
|------|------|
| **Dashboard** | https://supabase.com/dashboard |
| **Project** | https://wszgopucksmjcgoakxmt.supabase.co |
| **App** | http://127.0.0.1:5174/ |
| **Admin Panel** | http://127.0.0.1:5174/admin |
| **AWS S3** | https://s3.console.aws.amazon.com/s3/buckets/epicbox1 |

---

## ✅ Summary

Your Supabase database is set up with:
- ✅ `profiles` table for users
- ✅ `files` table for file metadata
- ✅ `folders` table for organization
- ✅ `shared_links` table for sharing
- ✅ Row Level Security (RLS) policies
- ✅ PostgreSQL functions for automation

All files are encrypted and stored in AWS S3. The database only stores metadata (names, sizes, paths, permissions).
