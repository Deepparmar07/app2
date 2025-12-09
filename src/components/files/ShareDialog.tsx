import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sharedLinkApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ShareDialogProps {
  type: 'file' | 'folder';
  itemId: string;
  open: boolean;
  onClose: () => void;
}

export default function ShareDialog({ type, itemId, open, onClose }: ShareDialogProps) {
  const [shareLink, setShareLink] = useState('');
  const [canDownload, setCanDownload] = useState(true);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const generateShareLink = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const link = await sharedLinkApi.createShareLink(
        type === 'file' ? itemId : null,
        type === 'folder' ? itemId : null,
        profile.id,
        canDownload
      );

      if (link) {
        const url = `${window.location.origin}/shared/${link.share_token}`;
        setShareLink(url);
        toast({
          title: 'Success',
          description: 'Share link created successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create share link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: 'Copied',
      description: 'Share link copied to clipboard',
    });
  };

  useEffect(() => {
    if (open) {
      setShareLink('');
      setCanDownload(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {type === 'file' ? 'File' : 'Folder'}</DialogTitle>
          <DialogDescription>
            Create a shareable link for this {type}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="canDownload">Allow downloads</Label>
            <Switch
              id="canDownload"
              checked={canDownload}
              onCheckedChange={setCanDownload}
              disabled={!!shareLink}
            />
          </div>

          {!shareLink ? (
            <Button onClick={generateShareLink} disabled={loading} className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              {loading ? 'Generating...' : 'Generate Share Link'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly />
                <Button onClick={copyToClipboard} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can {canDownload ? 'view and download' : 'view'} this {type}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
