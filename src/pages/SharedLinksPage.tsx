import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sharedLinkApi, fileApi, folderApi } from '@/db/api';
import type { SharedLink } from '@/types';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, File, Folder } from 'lucide-react';

interface SharedLinkWithDetails extends SharedLink {
  itemName?: string;
}

export default function SharedLinksPage() {
  const [links, setLinks] = useState<SharedLinkWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const loadLinks = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const data = await sharedLinkApi.getUserShareLinks(profile.id);
      
      const linksWithDetails = await Promise.all(
        data.map(async (link) => {
          let itemName = 'Unknown';
          if (link.file_id) {
            const file = await fileApi.getFile(link.file_id);
            itemName = file?.name || 'Unknown File';
          } else if (link.folder_id) {
            const folder = await folderApi.getFolder(link.folder_id);
            itemName = folder?.name || 'Unknown Folder';
          }
          return { ...link, itemName };
        })
      );

      setLinks(linksWithDetails);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load shared links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, [profile]);

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied',
      description: 'Share link copied to clipboard',
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await sharedLinkApi.deleteShareLink(id);
      toast({
        title: 'Success',
        description: 'Share link deleted',
      });
      loadLinks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete share link',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shared Links</h1>
          <p className="text-muted-foreground mt-1">
            Manage your shared files and folders
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No shared links</p>
            <p className="text-sm text-muted-foreground">
              Share files or folders to see them here
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium">
              <div className="col-span-5">Item</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Created</div>
              <div className="col-span-2"></div>
            </div>

            <div className="divide-y">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      {link.file_id ? (
                        <File className="w-4 h-4" />
                      ) : (
                        <Folder className="w-4 h-4 text-secondary" />
                      )}
                    </div>
                    <span className="font-medium truncate">{link.itemName}</span>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {link.file_id ? 'File' : 'Folder'}
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {new Date(link.created_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(link.share_token)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
