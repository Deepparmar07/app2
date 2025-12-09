import { useEffect, useState } from 'react';
import { folderApi } from '@/db/api';
import type { Folder } from '@/types';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbsProps {
  currentFolderId: string | null;
  onNavigate: (folderId: string | null) => void;
}

export default function Breadcrumbs({ currentFolderId, onNavigate }: BreadcrumbsProps) {
  const [path, setPath] = useState<Folder[]>([]);

  useEffect(() => {
    if (currentFolderId) {
      folderApi.getFolderPath(currentFolderId).then(setPath);
    } else {
      setPath([]);
    }
  }, [currentFolderId]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(null)}
        className="gap-2"
      >
        <Home className="h-4 w-4" />
        My Files
      </Button>

      {path.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(folder.id)}
            className={index === path.length - 1 ? 'font-medium' : ''}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
