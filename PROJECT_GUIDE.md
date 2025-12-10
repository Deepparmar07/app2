# SecureBox File Storage System

## Overview
SecureBox is a secure cloud-based file storage platform that provides users with safe and reliable file storage, management, and sharing capabilities. Built with modern web technologies and featuring a beautiful deep blue design theme.

## Features

### 🔐 Authentication & Security
- User registration and login system
- Secure password-based authentication
- First user automatically becomes admin
- Role-based access control (User/Admin)

### 📁 File Management
- Upload files with drag-and-drop support
- Automatic file compression for images
- File size limit: 1MB per file
- Supported formats: Documents, Images, Videos, Audio, Archives
- Grid and List view options
- File preview for images, videos, and PDFs
- File download functionality
- Search files by name
- Filter files by type

### 📂 Folder Organization
- Create nested folder structures
- Navigate through folders with breadcrumbs
- Move files between folders
- Delete folders (moves to recycle bin)

### 🔗 File Sharing
- Generate shareable links for files and folders
- Set access permissions (view-only or download)
- Public access page for shared content
- Manage all shared links in one place

### ♻️ Recycle Bin
- Soft delete for files and folders
- Restore deleted items
- Permanent delete option
- View deletion timestamps

### 💾 Storage Management
- 5GB default storage quota per user
- Real-time storage usage tracking
- Visual storage usage display
- Automatic storage calculation

### 👥 Admin Panel
- View all registered users
- Manage user roles (User/Admin)
- Monitor storage usage across users
- View user registration dates

### ⚙️ Settings
- **Profile Management**
  - Update username
  - View account type and member since date
  - Manage preferences (auto-compress, notifications)
- **Security**
  - Change password
  - View security status
  - Account deletion option
- **Appearance**
  - Light/Dark theme toggle
  - Visual theme preview
- **Storage**
  - Detailed storage usage statistics
  - Storage alerts when running low
  - File and folder count tracking

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage buckets
  - Row Level Security (RLS)

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Route guard
│   ├── files/
│   │   ├── Breadcrumbs.tsx         # Navigation breadcrumbs
│   │   ├── CreateFolderDialog.tsx  # Folder creation
│   │   ├── FileGrid.tsx            # Grid view
│   │   ├── FileList.tsx            # List view
│   │   ├── FilePreviewDialog.tsx   # File preview modal
│   │   ├── ShareDialog.tsx         # Share link generator
│   │   └── UploadButton.tsx        # File upload with progress
│   ├── layout/
│   │   └── DashboardLayout.tsx     # Main layout with sidebar
│   ├── ui/                         # shadcn/ui components
│   └── LoadingPage.tsx             # Startup loading screen
├── contexts/
│   └── AuthContext.tsx             # Authentication state
├── db/
│   ├── api.ts                      # API wrapper functions
│   └── supabase.ts                 # Supabase client
├── hooks/
│   ├── use-theme.tsx               # Theme management
│   └── use-toast.tsx               # Toast notifications
├── lib/
│   └── fileUtils.ts                # File utility functions
├── pages/
│   ├── AdminPage.tsx               # Admin dashboard
│   ├── DashboardPage.tsx           # Main file manager
│   ├── LoginPage.tsx               # Login form
│   ├── RecycleBinPage.tsx          # Deleted files
│   ├── RegisterPage.tsx            # Registration form
│   ├── SettingsPage.tsx            # User settings
│   ├── SharedLinksPage.tsx         # Manage shared links
│   └── SharedViewPage.tsx          # Public share view
├── types/
│   └── index.ts                    # TypeScript definitions
├── App.tsx                         # App root
└── routes.tsx                      # Route configuration
```

## Database Schema

### Tables

#### profiles
- User profile information
- Storage usage tracking
- Role management (user/admin)

#### folders
- Folder hierarchy
- Soft delete support
- Owner tracking

#### files
- File metadata
- Storage path references
- Soft delete support
- Size tracking

#### shared_links
- Shareable link tokens
- Access permissions
- Expiration support

## Getting Started

### First User Setup
1. Register a new account - this user will automatically become an admin
2. Login with your credentials
3. Start uploading files and creating folders

### Admin Features
- Access the Admin Panel from the sidebar
- Manage user roles
- Monitor system usage

### File Upload
1. Click the "Upload" button
2. Select files (max 1MB each)
3. Files are automatically compressed if they're images
4. Upload progress is displayed

### Sharing Files
1. Right-click on a file or folder
2. Select "Share"
3. Choose access permissions
4. Generate and copy the share link
5. Share the link with others

### Managing Settings
1. Click "Settings" in the sidebar
2. Navigate through tabs:
   - **Profile**: Update username and preferences
   - **Security**: Change password and manage account
   - **Appearance**: Switch between light/dark themes
   - **Storage**: Monitor storage usage and statistics
3. Changes are saved automatically or with confirmation

### Storage Limits
- Default: 5GB per user
- Admins can view all users' storage usage
- Storage is calculated automatically on file upload/delete

## Security Features

- Password-based authentication
- Row Level Security (RLS) policies
- Secure file storage in Supabase buckets
- Protected API endpoints
- Role-based access control

## Design System

### Colors
- **Primary**: Deep Blue (#2C3E50) - Security and trust
- **Secondary**: Light Blue (#3498DB) - Interactive elements
- **Background**: Clean White with subtle gray accents

### Typography
- Clean, modern sans-serif fonts
- Clear hierarchy
- Readable sizes

### Components
- Rounded corners (8px)
- Subtle shadows for depth
- Smooth transitions
- Responsive design

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance
- Lazy loading for images
- Optimized file compression
- Efficient database queries
- Pagination support

## Future Enhancements
- Bulk file operations
- Advanced search filters
- File versioning
- Collaborative features
- Mobile app
- Increased storage tiers
