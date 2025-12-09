import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fileApi, folderApi } from '@/db/api';
import type { File, Folder, ViewMode } from '@/types';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FileGrid from '@/components/files/FileGrid';
import FileList from '@/components/files/FileList';
import Breadcrumbs from '@/components/files/Breadcrumbs';
import UploadButton from '@/components/files/UploadButton';
import CreateFolderDialog from '@/components/files/CreateFolderDialog';
import FilePreviewDialog from '@/components/files/FilePreviewDialog';
import ShareDialog from '@/components/files/ShareDialog';
import { Button } from '@/components/ui/button';
import { Grid3x3, List, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFolderId = searchParams.get('folder');
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareItem, setShareItem] = useState<{ type: 'file' | 'folder'; id: string } | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const loadData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const [filesData, foldersData] = await Promise.all([
        fileApi.getFiles(currentFolderId),
        folderApi.getFolders(currentFolderId),
      ]);
      setFiles(filesData);
      setFolders(foldersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load files and folders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentFolderId, profile]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const results = await fileApi.searchFiles(searchQuery);
      setFiles(results);
      setFolders([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Search failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderId: string) => {
    setSearchParams({ folder: folderId });
    setSearchQuery('');
  };

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileApi.softDeleteFile(fileId);
      toast({
        title: 'Success',
        description: 'File moved to recycle bin',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await folderApi.deleteFolder(folderId);
      toast({
        title: 'Success',
        description: 'Folder deleted',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete folder',
        variant: 'destructive',
      });
    }
  };

  const handleUploadComplete = () => {
    loadData();
  };

  const handleFolderCreated = () => {
    loadData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <Breadcrumbs currentFolderId={currentFolderId} onNavigate={handleFolderClick} />
          <div className="flex items-center gap-2">
            <div className="relative flex-1 xl:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadButton currentFolderId={currentFolderId} onUploadComplete={handleUploadComplete} />
            <CreateFolderDialog
              currentFolderId={currentFolderId}
              onFolderCreated={handleFolderCreated}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <FileGrid
                files={files}
                folders={folders}
                onFileClick={handleFileClick}
                onFolderClick={handleFolderClick}
                onDeleteFile={handleDeleteFile}
                onDeleteFolder={handleDeleteFolder}
                onShareFile={(id) => setShareItem({ type: 'file', id })}
                onShareFolder={(id) => setShareItem({ type: 'folder', id })}
              />
            ) : (
              <FileList
                files={files}
                folders={folders}
                onFileClick={handleFileClick}
                onFolderClick={handleFolderClick}
                onDeleteFile={handleDeleteFile}
                onDeleteFolder={handleDeleteFolder}
                onShareFile={(id) => setShareItem({ type: 'file', id })}
                onShareFolder={(id) => setShareItem({ type: 'folder', id })}
              />
            )}
          </>
        )}

        {!loading && files.length === 0 && folders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No files or folders here</p>
            <p className="text-sm text-muted-foreground">
              Upload files or create folders to get started
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <FilePreviewDialog
          file={selectedFile}
          open={!!selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {shareItem && (
        <ShareDialog
          type={shareItem.type}
          itemId={shareItem.id}
          open={!!shareItem}
          onClose={() => setShareItem(null)}
        />
      )}
    </DashboardLayout>
  );
}
