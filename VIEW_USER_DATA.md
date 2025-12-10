# 📊 How to View User Data in EpicBox

## 🔐 Your Current Setup

**Storage Provider:** AWS S3  
**Bucket:** epicbox1  
**Region:** eu-north-1  
**Status:** ✅ Configured and ready to use

## 📍 Where to View User Data

### 1. **Admin Panel (In-App)**

Access the admin panel to view all users:

**URL:** `http://127.0.0.1:5174/admin`

**What You Can See:**
- ✅ All registered users
- ✅ Username for each user
- ✅ User role (Admin/User)
- ✅ Storage used per user
- ✅ Join date
- ✅ Change user roles

**How to Access:**
1. Log in with your admin account (first registered user)
2. Click "Admin" in the sidebar
3. View the user list with all details

---

### 2. **Supabase Database (User Profiles)**

View user profiles and metadata:

**URL:** https://wszgopucksmjcgoakxmt.supabase.co

**Steps:**
1. Go to Supabase Dashboard
2. Select your project
3. Click "Table Editor" in sidebar
4. Select `profiles` table

**Data Available:**
- User ID
- Username
- Role (user/admin)
- Storage used
- Storage limit
- Created date

---

### 3. **Supabase Database (User Files)**

View file metadata (NOT the actual files, as they're in S3):

**Steps:**
1. In Supabase Dashboard → Table Editor
2. Select `files` table

**Data Available:**
- File name
- File size
- File type
- Storage path (S3 path)
- Owner ID
- Folder ID
- Upload date
- Favorite status
- Deleted status

---

### 4. **AWS S3 Bucket (Actual Files)**

View encrypted files stored in S3:

**URL:** https://s3.console.aws.amazon.com/s3/buckets/epicbox1

**Steps:**
1. Log into AWS Console: https://console.aws.amazon.com/
2. Navigate to S3 service
3. Click on bucket: `epicbox1`
4. Browse folders by user ID

**Folder Structure:**
```
epicbox1/
├── {user-id-1}/
│   ├── 1733864521_x7k2m.jpg.enc
│   ├── 1733864622_a9n3p.pdf.enc
│   └── ...
├── {user-id-2}/
│   ├── 1733864723_b2k8q.mp4.enc
│   └── ...
```

**Note:** All files have `.enc` extension (encrypted with AES-256)

---

### 5. **AWS S3 Console Features**

In the S3 Console you can:

✅ **View Files:**
- List all uploaded files
- See file sizes
- Check upload dates
- View storage paths

✅ **Download Encrypted Files:**
- Download `.enc` files (but they're encrypted)
- Files need to be decrypted through the app

✅ **Storage Analytics:**
- View total storage usage
- Monitor upload/download activity
- Check storage costs

✅ **Access Logs:**
- See who accessed which files
- Track download activity
- Monitor API calls

---

## 🔍 View Specific User's Files

### Method 1: In-App (Coming Soon)
We can add a feature to the admin panel to view files by user.

### Method 2: Database Query
In Supabase SQL Editor, run:

```sql
-- View all files for a specific user
SELECT 
  f.name,
  f.size,
  f.type,
  f.storage_path,
  f.created_at,
  p.username
FROM files f
JOIN profiles p ON f.owner_id = p.id
WHERE p.username = 'specific-username';

-- View storage usage by user
SELECT 
  p.username,
  p.storage_used,
  p.storage_limit,
  COUNT(f.id) as file_count
FROM profiles p
LEFT JOIN files f ON f.owner_id = p.id AND f.deleted_at IS NULL
GROUP BY p.id
ORDER BY p.storage_used DESC;
```

### Method 3: AWS S3 by User ID
1. Get user ID from Supabase `profiles` table
2. Go to S3 bucket
3. Navigate to folder: `{user-id}/`
4. View all encrypted files for that user

---

## 📊 Quick Access Guide

| What to View | Where to Go |
|--------------|-------------|
| **User List** | Admin Panel (`/admin`) |
| **User Profiles** | Supabase → `profiles` table |
| **File Metadata** | Supabase → `files` table |
| **Actual Files** | AWS S3 → `epicbox1` bucket |
| **Storage Stats** | Admin Panel or Supabase |
| **Access Logs** | AWS S3 → Server Access Logging |

---

## 🚀 Start the App to View Data

**Step 1: Start the Server**
```powershell
cd C:\Users\jenil\Downloads\Epic1\app2
npx vite --host 127.0.0.1
```

**Step 2: Access the App**
```
URL: http://127.0.0.1:5174/
```

**Step 3: Login as Admin**
- Use your admin account (first user registered)

**Step 4: View Users**
- Click "Admin" in the sidebar
- See all users and their data

---

## 🔐 Important Notes

### About Encrypted Files
- Files in S3 have `.enc` extension
- They are encrypted with AES-256-GCM
- Cannot be viewed directly from S3
- Must be decrypted through the app

### About User Privacy
- Each user's files are in separate folders
- Files are encrypted before upload
- Even S3 administrators can't read the content
- Only the app with the encryption key can decrypt

### About AWS S3 Access
**Your AWS Credentials:**
- Access Key ID: `AKIA6JJ6ZM2ODGGWY7XY`
- Region: `eu-north-1`
- Bucket: `epicbox1`

**To view in AWS Console:**
1. Go to: https://console.aws.amazon.com/
2. Sign in with your AWS account
3. Navigate to S3 service
4. Select `epicbox1` bucket

---

## 📈 Additional Admin Features

### Current Features:
✅ View all users  
✅ See storage usage per user  
✅ Change user roles  
✅ View join dates  

### Can Be Added:
- [ ] View files per user in admin panel
- [ ] Delete user files from admin panel
- [ ] Download user data export
- [ ] User activity logs
- [ ] Storage usage charts

---

## 🛠️ Need More Admin Features?

Let me know if you want me to add:
1. User file viewer in admin panel
2. User activity tracking
3. File download from admin panel
4. User data export functionality
5. Advanced storage analytics

---

## 📞 Quick Links

- **App:** http://127.0.0.1:5174/
- **Admin Panel:** http://127.0.0.1:5174/admin
- **Supabase Dashboard:** https://wszgopucksmjcgoakxmt.supabase.co
- **AWS S3 Console:** https://s3.console.aws.amazon.com/s3/buckets/epicbox1
- **AWS Console:** https://console.aws.amazon.com/

---

## ✅ Your Setup Summary

```
✅ AWS S3 Configured
   - Bucket: epicbox1
   - Region: eu-north-1
   - Status: Active

✅ AES-256 Encryption Enabled
   - All uploads encrypted
   - All downloads decrypted
   
✅ Admin Panel Available
   - View all users
   - Manage roles
   - Monitor storage

✅ Database: Supabase
   - User profiles
   - File metadata
   - Authentication
```

Just restart your server to use AWS S3! 🚀
