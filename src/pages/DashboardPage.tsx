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
import { Grid3x3, List, Search, Image, Video, FileText, Music, Archive, FileIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getFileCategory, type FileCategory } from '@/lib/fileUtils';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFolderId = searchParams.get('folder');
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareItem, setShareItem] = useState<{ type: 'file' | 'folder'; id: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FileCategory>('all');
  const { profile } = useAuth();
  const { toast } = useToast();

  const fileCategories = [
    { id: 'all' as FileCategory, label: 'All Files', icon: FileIcon },
    { id: 'photos' as FileCategory, label: 'Photos', icon: Image },
    { id: 'videos' as FileCategory, label: 'Videos', icon: Video },
    { id: 'documents' as FileCategory, label: 'Documents', icon: FileText },
    { id: 'audio' as FileCategory, label: 'Audio', icon: Music },
    { id: 'archives' as FileCategory, label: 'Archives', icon: Archive },
    { id: 'others' as FileCategory, label: 'Others', icon: FileIcon },
  ];

  const loadData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const [filesData, foldersData] = await Promise.all([
        fileApi.getFiles(currentFolderId),
        folderApi.getFolders(currentFolderId),
      ]);
      setAllFiles(filesData);
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
    setActiveFilter('all');
  }, [currentFolderId, profile]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFiles(allFiles);
    } else {
      const filtered = allFiles.filter(file => getFileCategory(file.type) === activeFilter);
      setFiles(filtered);
    }
  }, [activeFilter, allFiles]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const results = await fileApi.searchFiles(searchQuery);
      setAllFiles(results);
      setFiles(results);
      setFolders([]);
      setActiveFilter('all');
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

        {/* File Type Filters */}
        <div className="border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {fileCategories.map((category) => {
              const Icon = category.icon;
              const count = category.id === 'all' 
                ? allFiles.length 
                : allFiles.filter(f => getFileCategory(f.type) === category.id).length;
              
              return (
                <Button
                  key={category.id}
                  variant={activeFilter === category.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter(category.id)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeFilter === category.id 
                        ? 'bg-primary-foreground/20' 
                        : 'bg-muted'
                    }`}>
                      {count}
                    </span>
                  )}
                </Button>
              );
            })}
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
