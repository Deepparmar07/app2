import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/fileUtils';
import {
  HardDrive,
  Home,
  Trash2,
  Share2,
  Settings,
  LogOut,
  Shield,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Progress } from '@/components/ui/progress';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const storagePercentage = profile
    ? (profile.storage_used / profile.storage_limit) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">SecureBox</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <Home className="mr-2 h-4 w-4" />
              My Files
            </Button>
          </Link>
          <Link to="/recycle-bin">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <Trash2 className="mr-2 h-4 w-4" />
              Recycle Bin
            </Button>
          </Link>
          <Link to="/shared">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <Share2 className="mr-2 h-4 w-4" />
              Shared Links
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          {profile?.role === 'admin' && (
            <Link to="/admin">
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          )}
        </nav>

        <div className="p-4 space-y-4 border-t border-sidebar-border">
          {profile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-sidebar-foreground">
                <span>Storage</span>
                <span className="font-medium">
                  {formatFileSize(profile.storage_used)} / {formatFileSize(profile.storage_limit)}
                </span>
              </div>
              <Progress value={storagePercentage} className="h-2" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {profile && (
            <div className="text-xs text-sidebar-foreground/70 text-center">
              Signed in as <span className="font-medium">{profile.username}</span>
            </div>
          )}
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
