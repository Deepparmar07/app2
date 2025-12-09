import type { File } from '@/types';
import { storageApi } from '@/db/api';
import { Button } from '@/components/ui/button';
import { formatFileSize, isImageFile, isVideoFile, downloadBlob } from '@/lib/fileUtils';
import { Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FilePreviewDialogProps {
  file: File;
  open: boolean;
  onClose: () => void;
}

export default function FilePreviewDialog({ file, open, onClose }: FilePreviewDialogProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
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

    if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-[60vh] bg-muted rounded-lg">
          <iframe
            src={storageApi.getPublicUrl(file.storage_path)}
            className="w-full h-full rounded-lg"
            title={file.name}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download to View
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {renderPreview()}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <p>Size: {formatFileSize(file.size)}</p>
              <p>Type: {file.type}</p>
              <p>Created: {new Date(file.created_at).toLocaleString()}</p>
            </div>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
