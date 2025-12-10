import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sharedLinkApi, fileApi, storageApi } from '@/db/api';
import type { SharedLink, File } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatFileSize, getFileIcon, downloadBlob, isImageFile, isVideoFile } from '@/lib/fileUtils';
import { Download, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SharedViewPage() {
  const { token } = useParams<{ token: string }>();
  const [shareLink, setShareLink] = useState<SharedLink | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;

    const loadSharedContent = async () => {
      setLoading(true);
      try {
        const link = await sharedLinkApi.getShareLink(token);
        
        if (!link) {
          setError('Share link not found or has expired');
          return;
        }

        if (link.expires_at && new Date(link.expires_at) < new Date()) {
          setError('This share link has expired');
          return;
        }

        setShareLink(link);

        if (link.file_id) {
          const fileData = await fileApi.getFile(link.file_id);
          if (fileData && !fileData.is_deleted) {
            setFile(fileData);
          } else {
            setError('File not found or has been deleted');
          }
        }
      } catch (err) {
        setError('Failed to load shared content');
      } finally {
        setLoading(false);
      }
    };

    loadSharedContent();
  }, [token]);

  const handleDownload = async () => {
    if (!file || !shareLink?.can_download) return;

    try {
      const blob = await storageApi.downloadFile(file.storage_path);
      downloadBlob(blob, file.name);
      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const renderPreview = () => {
    if (!file) return null;

    if (isImageFile(file.type)) {
      return (
        <div className="flex items-center justify-center bg-muted rounded-lg p-4">
          <img
            src={storageApi.getPublicUrl(file.storage_path)}
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>
      );
    }

    if (isVideoFile(file.type)) {
      return (
        <div className="flex items-center justify-center bg-muted rounded-lg p-4">
          <video
            src={storageApi.getPublicUrl(file.storage_path)}
            controls
            className="max-w-full max-h-[60vh]"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl mb-4">
          {getFileIcon(file.type)}
        </div>
        <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
        {shareLink?.can_download && (
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download to View
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EpicBox</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto p-6">
          {file && (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{file.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Size: {formatFileSize(file.size)} • Type: {file.type}
                  </p>
                </div>
                {shareLink?.can_download && (
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>

              {renderPreview()}

              {!shareLink?.can_download && (
                <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Downloads are disabled for this shared file
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
