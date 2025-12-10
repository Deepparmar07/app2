# EpicBox - Architecture & Demo Checklist

## Visual Architecture

### System Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React App (Vite)                                        │   │
│  │  ├─ Login/Register Pages                                │   │
│  │  ├─ Dashboard (File Grid)                               │   │
│  │  ├─ Upload Form (drag-drop)                             │   │
│  │  ├─ File Preview                                        │   │
│  │  ├─ Folder Navigator                                    │   │
│  │  └─ Share Dialog                                        │   │
│  └─────────────┬──────────────────────────────────────────┘   │
│                │ JavaScript Crypto API                         │
│  ┌─────────────▼──────────────────────────────────────────┐   │
│  │  Encryption Layer                                      │   │
│  │  ├─ AES-256 Encryption (before upload)                │   │
│  │  └─ AES-256 Decryption (after download)               │   │
│  └─────────────┬──────────────────────────────────────────┘   │
└────────────────┼─────────────────────────────────────────────────┘
                 │ HTTPS (TLS 1.3)
                 │
    ┌────────────┴──────────────┐
    │                           │
    ▼                           ▼
┌──────────────────┐  ┌──────────────────┐
│ Supabase Auth    │  │ Supabase Storage │
│ ├─ Email/Pass    │  │ └─ Encrypted     │
│ ├─ JWT Token     │  │    File Bucket   │
│ └─ Session Mgmt  │  └──────────────────┘
└────────┬─────────┘
         │ Authenticated Requests
         ▼
    ┌──────────────────────────────────┐
    │  PostgreSQL Database (Supabase)  │
    │  ├─ profiles table               │
    │  │  ├─ id (user ID)              │
    │  │  ├─ username                  │
    │  │  ├─ role (user/admin)         │
    │  │  ├─ storage_used              │
    │  │  └─ storage_limit             │
    │  ├─ folders table                │
    │  │  ├─ id                        │
    │  │  ├─ name                      │
    │  │  ├─ parent_id (nesting)       │
    │  │  └─ owner_id                  │
    │  ├─ files table                  │
    │  │  ├─ id                        │
    │  │  ├─ name                      │
    │  │  ├─ size                      │
    │  │  ├─ storage_path (location)   │
    │  │  ├─ folder_id                 │
    │  │  ├─ owner_id                  │
    │  │  ├─ is_deleted                │
    │  │  └─ created_at                │
    │  └─ shared_links table           │
    │     ├─ id                        │
    │     ├─ file_id/folder_id         │
    │     ├─ share_token (public link) │
    │     ├─ can_download              │
    │     ├─ password (optional)       │
    │     └─ expires_at                │
    └──────────────────────────────────┘
         │ RLS Policies (enforce row security)
         └─ Users see only own files/folders
```

### Data Flow: File Upload
```
1. User selects file → browser
                ▼
2. JavaScript reads file (File API)
                ▼
3. Generate random AES-256 key
                ▼
4. Encrypt file with key (SubtleCrypto)
                ▼
5. Upload encrypted blob to Supabase Storage
   (with user_id in path: /userId/filename.enc)
                ▼
6. Storage bucket accepts (RLS policy checks):
   - Is authenticated? ✓
   - Does path start with user's ID? ✓
   - File size < 50MB? ✓
                ▼
7. Save file metadata in DB:
   - name, size, storage_path, owner_id, folder_id
                ▼
8. Return success to UI
```

### Data Flow: File Download
```
1. User clicks download → browser
                ▼
2. Fetch encrypted file from Storage bucket
   (RLS checks: is this your file?)
                ▼
3. Decrypt file in browser (using stored key)
                ▼
4. Create Blob URL
                ▼
5. Trigger browser download
                ▼
6. File saved to user's Downloads folder (decrypted)
   ← Never sent to server in plaintext
```

### Data Flow: File Sharing
```
1. User clicks "Share" → shows dialog
                ▼
2. Generate crypto.randomUUID() → share_token
                ▼
3. Insert into shared_links:
   - share_token (public, unguessable)
   - file_id (which file to share)
   - owner_id (who owns it)
   - can_download (true/false)
   - password (optional)
   - expires_at (optional)
                ▼
4. Copy public link: domain/share/[share_token]
                ▼
5. Anyone can visit link (no auth needed)
                ▼
6. If password set: prompt for password
                ▼
7. If allowed: fetch encrypted file + decrypt in browser
   (still encrypted end-to-end, share link doesn't grant key access)
```

---

## Security Model

### Defense in Depth
```
Layer 1: Transport Security
├─ HTTPS/TLS 1.3
└─ All data encrypted in transit

Layer 2: Authentication
├─ Email confirmation required
├─ JWT tokens (short-lived)
└─ Sessions stored client-side

Layer 3: Database Security
├─ Row-Level Security (RLS) policies
├─ Users can only query own rows
└─ Admin role for management

Layer 4: File Encryption
├─ AES-256 encryption in browser
├─ Encrypted before leaving browser
├─ Server never sees plaintext
└─ Decrypted only on authorized client

Layer 5: Storage Access Control
├─ Private bucket (not public)
├─ RLS policies on storage.objects
└─ Path-based isolation (user_id prefix)
```

### RLS Policy Example (files table)
```sql
CREATE POLICY "Users can view own files" ON files
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR is_admin(auth.uid()));
```
→ Even if SQL injection happens, user can only see their own files

---

## Database Schema Summary

### profiles
```
id (uuid, PK) → auth.users.id
username (text, unique)
role (enum: 'user' | 'admin') - first user is admin
storage_used (bigint) - bytes
storage_limit (bigint) - default 5GB
created_at (timestamptz)
```

### folders
```
id (uuid, PK)
name (text)
parent_id (uuid, FK) - self-referencing for nesting
owner_id (uuid, FK) → profiles.id
created_at, updated_at (timestamptz)
```

### files
```
id (uuid, PK)
name (text)
size (bigint) - bytes
type (text) - MIME type (image/png, etc.)
storage_path (text) - path in bucket
folder_id (uuid, FK, nullable)
owner_id (uuid, FK)
is_deleted (boolean) - soft delete for recycle bin
deleted_at (timestamptz, nullable)
is_favorite (boolean) - for favorites feature
created_at, updated_at (timestamptz)
```

### shared_links
```
id (uuid, PK)
file_id (uuid, FK, nullable)
folder_id (uuid, FK, nullable) - one or other
owner_id (uuid, FK)
share_token (text, unique) - public identifier
can_download (boolean)
password (text, nullable)
expires_at (timestamptz, nullable)
created_at (timestamptz)
```

---

## Demo Checklist

### Pre-Demo Preparation (Day Before)

#### ✓ App Setup
- [ ] App runs without errors (`pnpm dev` works)
- [ ] Supabase bucket `app-84kgjmh9j8qp_files` exists
- [ ] Storage RLS policies are in place (4 policies)
- [ ] All database tables created (profiles, files, folders, shared_links)
- [ ] Environment variables set correctly (.env has valid Supabase URL & key)

#### ✓ Test Account
- [ ] Create demo account (demo@college.example.com / strong password)
- [ ] Email confirmed in Supabase Auth
- [ ] Profile created in profiles table
- [ ] Upload 3-5 sample files (images, PDF, doc) to bucket
- [ ] Create 2-3 sample folders
- [ ] Organize files into folders
- [ ] Create 1-2 share links (test both password-protected & not)

#### ✓ Browser/Environment
- [ ] Clear browser cache (`Ctrl+Shift+Delete`)
- [ ] Clear localStorage (`F12 → Application → localStorage → clear`)
- [ ] Disable browser extensions (can interfere with dev)
- [ ] Set browser zoom to 100% (for consistent display)
- [ ] Test on smallest supported screen resolution (1024x768 min)

#### ✓ Network
- [ ] WiFi connection stable
- [ ] Have backup hotspot (phone tethering)
- [ ] Test connection speed (at least 5 Mbps)
- [ ] Know WiFi password for presentation venue

#### ✓ Presentation Materials
- [ ] Slides prepared with key screenshots
- [ ] Demo script written & practiced
- [ ] Backup screenshots (in case live fails)
- [ ] Notes on key talking points
- [ ] Business cards / GitHub QR code printed

#### ✓ Equipment
- [ ] Laptop battery charged (100%)
- [ ] Bring power adapter
- [ ] HDMI/USB-C adapter for projector
- [ ] Mouse (trackpad can be unreliable with projector)
- [ ] Have demo video recorded as fallback

---

### During Demo (10-15 minutes)

#### Step 1: Show Homepage (30 seconds)
- [ ] Open browser, navigate to app
- [ ] Point out clean UI, hero section
- [ ] Click "Sign In" / "Sign Up"

#### Step 2: Login with Demo Account (1 minute)
```
Actions:
  [ ] Enter demo email
  [ ] Enter password
  [ ] Click Sign In
  
Show:
  [ ] Loading indicator (briefly)
  [ ] Redirect to dashboard
  [ ] User avatar with name appears
  [ ] "Logged in as [demo user]" visible
```

#### Step 3: Dashboard Tour (2 minutes)
```
Actions:
  [ ] Click through file grid
  [ ] Point out:
    - Recent files list (sidebar)
    - Favorites section
    - Folder breadcrumbs
    - Search bar
    - Filter dropdowns
    - Upload area (drag-drop zone)
  [ ] Navigate into one folder (double-click)
  [ ] Go back using breadcrumbs
  
Show:
  [ ] Multiple file types (images, PDFs, docs)
  [ ] Folder hierarchy works
  [ ] No errors in console (F12)
```

#### Step 4: File Operations (3 minutes)
```
Actions:
  [ ] Pick one file
  [ ] Click on it → preview dialog shows
  [ ] Show file details:
    - File name
    - File size
    - Upload date
    - File type icon
  [ ] Click Download button
    - Watch file download to Downloads
    - Show downloaded file is readable/decrypted
  [ ] Close dialog
  
  [ ] Pick another file → click 3-dot menu
    [ ] Rename file
    [ ] Mark as favorite (star icon)
    [ ] Move to different folder
    [ ] Delete (soft delete to recycle)
  
Show:
  [ ] File operations complete without errors
  [ ] State updates immediately
```

#### Step 5: Upload a File (2 minutes)
```
Actions:
  [ ] Drag a new file onto the upload area
    OR click Upload button → select file
  [ ] Watch progress bar
  [ ] File appears in grid after upload
  
  [ ] Open DevTools (F12)
  [ ] Go to Network tab
  [ ] Show encrypted blob upload:
    - Request to Supabase Storage
    - Content is binary/encrypted
    - File size matches
    - Status 200 OK
  
Show:
  [ ] File encrypted before upload (Network tab proves it)
  [ ] Server never sees plaintext
  [ ] Upload progress feedback works
```

#### Step 6: Create & Share Link (3 minutes)
```
Actions:
  [ ] Pick a file
  [ ] Click Share button
  [ ] Dialog appears with:
    - Share link (copy button)
    - "Can Download" toggle
    - Password field
    - Expiration date picker
  
  [ ] Enable password protection
    [ ] Set password = "demo123"
  [ ] Copy share link
  
  [ ] Open NEW INCOGNITO TAB (Ctrl+Shift+N)
  [ ] Paste share link
  [ ] WITHOUT logging in, page shows file preview
  [ ] Try to download → prompted for password
  [ ] Enter wrong password → error
  [ ] Enter correct password ("demo123") → download works
  
  [ ] Go back to original tab
  [ ] Show Shared Links section (sidebar)
  [ ] Click on shared link → shows:
    - Number of views
    - Number of downloads
    - Link status (active/expired)
    - Option to revoke link
  
Show:
  [ ] Public sharing works without account
  [ ] Password protection works
  [ ] Anyone can download (only on public link)
  [ ] Main account still has control
```

#### Step 7: Recycle Bin (1 minute)
```
Actions:
  [ ] Go to Recycle Bin (sidebar)
  [ ] Shows deleted files
  [ ] Click on one → Restore button
  [ ] Restore to dashboard
  [ ] File reappears in main dashboard
  
Show:
  [ ] Soft delete works (data preserved)
  [ ] Recovery is instant
  [ ] No data loss
```

#### Step 8: Settings/Admin (1 minute, optional)
```
Actions:
  [ ] Click Settings (gear icon, top-right)
  [ ] Show:
    - Username
    - Storage usage (pie chart / progress bar)
    - Storage quota remaining
    - "Change Password" button
    - (Optional) Admin panel if user is admin
  
Show:
  [ ] User data is persisted
  [ ] Storage tracking works
```

---

### Post-Demo Checklist

- [ ] Log out (cleanup)
- [ ] Thank audience
- [ ] Share links:
  - [ ] GitHub repo
  - [ ] Demo URL (if deployed)
  - [ ] QR code (if printed)
- [ ] Collect feedback (survey/forms)
- [ ] Note any bugs encountered (fix for next time)

---

### Demo Failure Scenarios & Fixes

| Scenario | Fix |
|----------|-----|
| **App won't load** | Hard refresh (Ctrl+Shift+R), clear cache, try incognito |
| **Login fails** | Check Supabase Auth email confirmed, restart `pnpm dev` |
| **Upload stuck** | Check DevTools Network tab, file size limits, bucket RLS policies |
| **File won't download** | Check browser downloads permission, encryption key availability |
| **Share link 404** | Verify shared_links table has data, token is valid, DB connection |
| **Slow performance** | Check network speed, close other tabs, disable extensions |
| **Console errors** | Screenshot error, restart app, check .env variables |
| **Projector resolution mismatch** | Use browser zoom (100%), adjust window size, restart browser |

### Fallback Plan (If Live Demo Fails)
- [ ] Have recorded screen capture of full demo (5-10 min video)
- [ ] Have 10+ labeled screenshots of key flows
- [ ] Printed slides with UI mockups
- [ ] Walk through code on screen (show architecture, key files)
- [ ] Discuss features verbally while showing screenshots

---

## Day-Of Tips

### Timing
- Arrive 15 min early
- Test projector connection 10 min before start
- Do a dry run of demo (login → upload → share) 5 min before

### Speaking
- Narrate what you're doing ("Now I'll click Upload...")
- Point at screen/slides (use mouse cursor)
- Pause after each action (let people digest)
- Make eye contact with audience, not just screen
- Speak clearly, not too fast

### Handle Questions
- **Q: Why not use Google Drive?**
  - A: Google can see files. Our encryption means only you can.
- **Q: Is this secure?**
  - A: AES-256 encryption + HTTPS + RLS policies = multiple layers.
- **Q: Can I use this for production?**
  - A: Yes, with proper monitoring and scaling (Supabase handles 100K+ users).
- **Q: How do you make money?**
  - A: This is a learning project, but could use freemium model.

### Energy & Confidence
- Smile & show enthusiasm for your project
- You built something cool—own it!
- It's okay if something glitches (shows real dev work)
- Audience wants you to succeed

---

## Post-Presentation Follow-Up

- [ ] Share GitHub repo link
- [ ] Offer to send demo video
- [ ] Connect on LinkedIn / Twitter / Discord
- [ ] Collect contact info for networking
- [ ] Ask feedback: "What feature would you like to see next?"
- [ ] Mention you're open to collaboration/hiring questions

---

Good luck with your presentation! 🚀

