# EpicBox - College Presentation Workflow

## Overview
EpicBox is an encrypted cloud file storage application built with modern web technologies, Supabase backend, and end-to-end encryption.

---

## Part 1: Introduction (2-3 minutes)

### What is SecureBox?
- A **secure, privacy-first file storage platform**
- Alternative to Google Drive/Dropbox with built-in encryption
- Web-based, accessible from any browser
- End-to-end encrypted file storage

### Why Build It?
- Privacy concerns with mainstream cloud storage
- Learning full-stack web development
- Database design & security best practices
- Real-world authentication & encryption

---

## Part 2: Architecture Overview (3-4 minutes)

### Tech Stack
```
Frontend: React + TypeScript + Vite + Tailwind CSS
Backend: Supabase (Firebase alternative)
  ├─ Authentication (email/password signup & login)
  ├─ PostgreSQL Database (files, folders, shares)
  ├─ Storage Bucket (encrypted file uploads)
  └─ Row-Level Security (RLS policies)
Security: AES-256 Encryption (browser-side)
Deployment: Vercel/Netlify ready
```

### System Architecture
```
┌─────────────────────────────────────────────┐
│         Browser (React App)                 │
│  ├─ Login/Register                          │
│  ├─ File Upload (encrypt locally)           │
│  ├─ File Download (decrypt locally)         │
│  └─ Share & Folder Management               │
└────────────────┬────────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────┐
│         Supabase Backend                    │
│  ├─ Auth Service (JWT tokens)               │
│  ├─ PostgreSQL DB (RLS policies)            │
│  │  ├─ profiles table                       │
│  │  ├─ files table                          │
│  │  ├─ folders table                        │
│  │  └─ shared_links table                   │
│  └─ Storage Bucket (encrypted blobs)        │
└─────────────────────────────────────────────┘
```

### Key Features
1. **User Authentication** - Email/password signup with email confirmation
2. **File Management** - Upload, download, rename, delete
3. **Folder Structure** - Organize files in nested folders
4. **Sharing** - Create public share links with optional passwords
5. **Encryption** - AES-256 browser-side encryption
6. **Recycle Bin** - Soft-delete with recovery
7. **Admin Panel** - User management & storage monitoring
8. **Favorites** - Star important files

---

## Part 3: Live Demo Workflow (5-7 minutes)

### Demo Account Setup (Before Presentation)
Create test account: `demo@example.com` / password with pre-populated files

### Step 1: Login Flow (1 minute)
```
1. Go to app homepage
2. Show registration page
   └─ Email validation
   └─ Password strength requirements
3. Login with demo account
   └─ Show JWT token in localStorage (DevTools)
   └─ Show authenticated user profile
```

### Step 2: Dashboard Tour (1.5 minutes)
```
1. Show main dashboard
   ├─ File grid view with thumbnails
   ├─ Folder navigation (breadcrumbs)
   ├─ Search functionality
   ├─ Filter by file type
   └─ Sort options
2. Highlight sidebar
   ├─ Recent Files
   ├─ Favorites
   ├─ Shared Links
   ├─ Recycle Bin
   └─ Settings
```

### Step 3: File Operations (2 minutes)
```
1. Upload a file
   └─ Drag & drop or file picker
   └─ Show progress bar
   └─ File encrypted before upload (show in Network tab)
   └─ File appears in grid

2. Download & decrypt
   └─ Click file → shows preview/details
   └─ Click download button
   └─ Show browser console: file decrypted in-memory
   └─ File saved to downloads folder (decrypted)

3. Create folder & organize
   └─ New folder dialog
   └─ Move files into folder
   └─ Navigate folder hierarchy
```

### Step 4: Sharing Feature (1.5 minutes)
```
1. Click Share button on a file
   └─ Dialog shows:
      - Share link generation
      - Can disable download
      - Optional password protection
      - Expiration date (optional)

2. Copy & share link
   └─ Open link in new tab (incognito/different browser)
   └─ Show public view (no auth required)
   └─ Enter password if set
   └─ View/download file without account

3. Go back to account
   └─ Show "Shared Links" section
   └─ View link stats (views/downloads)
   └─ Revoke link
```

### Step 5: Admin/Settings (1 minute)
```
1. Click Settings
   └─ Profile info
   └─ Storage usage bar (GB used / limit)
   └─ Password reset option

2. (Optional) Show Admin Panel (if first user)
   └─ All users list
   └─ Total storage used
   └─ User management
```

---

## Part 4: Code Highlights (3-4 minutes)

### Show Key Code Snippets

**1. Encryption Implementation**
```typescript
// File: src/lib/encryption.ts
- AES-256 encryption/decryption
- Uses browser's SubtleCrypto API
- File encrypted locally before upload
```

**2. Supabase Integration**
```typescript
// File: src/db/api.ts
- File CRUD operations
- Folder management
- Share link creation
```

**3. Storage Provider Pattern**
```typescript
// File: src/lib/storageProviders.ts
- Abstraction for multiple storage backends
- Supabase & S3 support
- Easy to swap providers
```

**4. Row-Level Security (RLS)**
```sql
-- File: supabase/migrations/00001_create_initial_schema.sql
- Database policies ensure users only access own files
- Encryption at rest + RLS = defense in depth
```

---

## Part 5: Security Highlights (2-3 minutes)

### What Makes It Secure?

1. **End-to-End Encryption**
   - Files encrypted in browser with AES-256
   - Server never sees plaintext (except metadata)
   - Even if database is compromised, files are unreadable

2. **Authentication**
   - Supabase Auth (JWT tokens)
   - Email confirmation required
   - No plaintext passwords stored

3. **Database Security**
   - Row-Level Security (RLS) policies
   - Users can only query/modify own records
   - Admin role for management

4. **Storage Security**
   - Private bucket (not public)
   - RLS on storage.objects table
   - Files organized by user ID path

5. **HTTPS**
   - All communication encrypted in transit
   - No man-in-the-middle attacks

---

## Part 6: Challenges & Solutions (2 minutes)

| Challenge | Solution |
|-----------|----------|
| Large file uploads | Chunked streaming (planned) |
| Client-side encryption overhead | Uses Web Crypto API (hardware-accelerated) |
| User password recovery | Email-based password reset via Supabase |
| Storage limits | Per-user quota in profiles table |
| Real-time sync | Planned: WebSockets for live collaboration |

---

## Part 7: Future Roadmap (1-2 minutes)

### Planned Features
- [ ] File versioning (keep edit history)
- [ ] Collaborative editing (real-time sync)
- [ ] Audit logs (track file access)
- [ ] Two-factor authentication (2FA)
- [ ] Team/organization support
- [ ] Mobile app (React Native)
- [ ] File compression
- [ ] Virus scanning integration

### Scalability Improvements
- CDN for faster downloads (Cloudflare)
- Database replication for redundancy
- Caching layer (Redis)
- Microservices for background jobs

---

## Part 8: Q&A Tips

**Common Questions:**

Q: *How do you handle large files?*
- Currently: up to 50MB per file
- Planned: chunked uploads for larger files

Q: *Is this production-ready?*
- Good for learning & small deployment
- Needs load testing & monitoring for production
- Can scale with Vercel + Supabase Pro

Q: *How is this different from Google Drive?*
- End-to-end encryption (we can't see files)
- Open-source (can self-host)
- Privacy-first design

Q: *How do you make money?*
- This is a learning project
- Could have premium storage tiers
- Or self-hosted enterprise license

---

## Part 9: Demo Troubleshooting

### If Upload Fails
```
1. Check browser console (F12)
2. Check Supabase bucket exists
3. Verify RLS policies are in place
4. Check storage quota not exceeded
5. Try smaller file (test with 1MB)
```

### If Login Doesn't Work
```
1. Verify email is confirmed in Supabase Auth
2. Check .env VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
3. Check browser localStorage for auth token
4. Try incognito mode (cache issues)
5. Clear Supabase client cache
```

### If Sharing Link Broken
```
1. Verify share_token exists in DB
2. Check file hasn't been deleted
3. Verify expiration_at is NULL or in future
4. Check RLS policies allow public access
```

---

## Presentation Timeline (20-25 minutes total)

| Section | Time | Notes |
|---------|------|-------|
| Intro | 2-3 min | What & why |
| Architecture | 3-4 min | Tech stack + diagram |
| Live Demo | 5-7 min | Main showcase |
| Code Highlights | 3-4 min | Key files & patterns |
| Security | 2-3 min | Why it's secure |
| Challenges | 2 min | Real problems solved |
| Future Roadmap | 1-2 min | Vision |
| Q&A | 5 min | Audience questions |

---

## Presentation Checklist

### Before Presentation Day
- [ ] Test app login & file upload 5+ times
- [ ] Create demo account with sample files
- [ ] Test share links work correctly
- [ ] Clear browser cache/cookies
- [ ] Have a backup WiFi hotspot
- [ ] Download presentation slides
- [ ] Practice demo script (time it)
- [ ] Prepare backup screenshots if live demo fails
- [ ] Test projector/screen sharing
- [ ] Have business cards or project link to share

### During Presentation
- [ ] Open DevTools (F12) to show console/network
- [ ] Speak clearly about what you're clicking
- [ ] Point out security features
- [ ] Engage audience with questions
- [ ] Be ready for "why not use X instead?"

### After Presentation
- [ ] Collect feedback
- [ ] Share GitHub repo link
- [ ] Mention future improvements
- [ ] Offer to demo on-demand

---

## Quick Links
- **Repository:** [GitHub link]
- **Live Demo:** [Deployment URL]
- **Supabase Dashboard:** https://app.supabase.com
- **Project Docs:** `/docs/prd.md`

