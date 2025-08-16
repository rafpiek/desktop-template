import React from 'react';
import { MoreHorizontal, FolderOpen, FileText, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { useProject } from '@/contexts/project-context';
import type { Document } from '@/lib/types/project';

interface DocumentDropdownMenuProps {
  document: Document;
  onDelete?: (documentId: string) => void;
  onDuplicate?: (documentId: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function DocumentDropdownMenu({ 
  document, 
  onDelete, 
  onDuplicate,
  className = "",
  size = 'md'
}: DocumentDropdownMenuProps) {
  const { updateDocument, getProjectChapters } = useProject();
  
  // Get all chapters for the document's project
  const projectChapters = getProjectChapters(document.projectId);
  
  const handleMoveToChapter = (chapterId: string) => {
    console.log(`📁 Moving document ${document.id} to chapter ${chapterId}`);
    updateDocument(document.id, { chapterId });
  };
  
  const handleMoveToDrafts = () => {
    console.log(`📁 Moving document ${document.id} to drafts`);
    updateDocument(document.id, { chapterId: null });
  };
  
  const handleDuplicate = () => {
    console.log(`📄 Duplicating document ${document.id}`);
    if (onDuplicate) {
      onDuplicate(document.id);
    }
    // TODO: Implement document duplication logic
  };
  
  const handleDelete = () => {
    console.log(`🗑️ Deleting document ${document.id}`);
    if (onDelete) {
      onDelete(document.id);
    }
  };
  
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  const iconClass = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`${buttonSize} opacity-60 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className={iconClass} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50" sideOffset={5}>
        {/* Move to Chapter - only show if there are chapters and document is not already in a chapter */}
        {projectChapters.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderOpen className={iconSize} />
              <span>Move to Chapter</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {projectChapters.map((chapter) => (
                <DropdownMenuItem 
                  key={chapter.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveToChapter(chapter.id);
                  }}
                  disabled={chapter.id === document.chapterId}
                >
                  <FileText className={iconSize} />
                  <span>{chapter.title || 'Untitled Chapter'}</span>
                  {chapter.id === document.chapterId && (
                    <span className="ml-auto text-xs text-muted-foreground">Current</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        
        {/* Move to Drafts - only show if document is currently in a chapter */}
        {document.chapterId && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              handleMoveToDrafts();
            }}
          >
            <FileText className={iconSize} />
            <span>Move to Drafts</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleDuplicate();
          }}
        >
          <Copy className={iconSize} />
          <span>Duplicate</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Trash2 className={iconSize} />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}