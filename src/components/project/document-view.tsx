import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { X, Plus, ChevronRight } from 'lucide-react';
import { PlateEditor } from '@/components/editor/plate-editor';
import { useProject } from '@/contexts/project-context';
import { FontSizeContext, type FontSize } from '@/hooks/use-font-size';
import type { DocumentStatus } from '@/lib/types/project';
import { DOCUMENT_STATUS_LABELS } from '@/lib/types/project';

export function DocumentView() {
  const { id: projectId, chapterId, documentId, draftId } = useParams<{
    id: string;
    chapterId?: string;
    documentId?: string;
    draftId?: string;
  }>();

  const { getDocument, getChapter } = useProject();
  const [fontSize, setFontSize] = useState<FontSize>('md');
  
  if (!projectId) {
    return <div>Project not found</div>;
  }

  // Determine which document we're viewing
  const document = draftId 
    ? getDocument(draftId)
    : documentId 
      ? getDocument(documentId) 
      : null;

  if (!document) {
    return <div>Document not found</div>;
  }

  // Get chapter info if document belongs to a chapter
  const chapter = document.chapterId ? getChapter(document.chapterId) : null;
  const subtitle = chapter 
    ? `Document from ${chapter.title} • ${document.wordCount} words`
    : `Draft document • ${document.wordCount} words`;

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      <div className="mb-8">
        <DocumentHeader 
          document={document}
          subtitle={subtitle}
        />
        <div className="mt-8">
          <TooltipProvider>
            <PlateEditor />
          </TooltipProvider>
        </div>
      </div>
    </FontSizeContext.Provider>
  );
}

interface DocumentHeaderProps {
  document: any; // Document type from our hooks
  subtitle: string;
}

function DocumentHeader({ document, subtitle }: DocumentHeaderProps) {
  const [title, setTitle] = useState(document.title || '');
  const [newTag, setNewTag] = useState('');
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title if it's empty (new document)
  useEffect(() => {
    if (!document.title || document.title === '') {
      setIsEditingTitle(true);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [document.title]);

  // Update local title when document changes
  useEffect(() => {
    setTitle(document.title || '');
  }, [document.title]);

  const handleTitleSubmit = () => {
    const finalTitle = title.trim() || 'New Document';
    // TODO: Implement document update through ProjectContext
    console.log('Title update requested:', finalTitle);
    setTitle(finalTitle);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSubmit();
      // TODO: Focus the editor when PlateEditor integration is complete
    } else if (e.key === 'Escape') {
      setTitle(document.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleStatusChange = (newStatus: DocumentStatus) => {
    // TODO: Implement document update through ProjectContext
    console.log('Status change requested:', newStatus);
  };

  const addTag = () => {
    if (newTag.trim()) {
      const newTagObj = {
        id: crypto.randomUUID(),
        name: newTag.trim(),
      };
      
      // TODO: Implement document update through ProjectContext
      console.log('Add tag requested:', newTagObj);
      setNewTag('');
    }
  };

  const removeTag = (tagId: string) => {
    // TODO: Implement document update through ProjectContext
    console.log('Remove tag requested:', tagId);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        {isEditingTitle ? (
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleTitleSubmit}
            placeholder="Enter document title..."
            className="text-3xl font-bold border-none p-0 h-auto text-foreground bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ fontSize: '1.875rem', lineHeight: '2.25rem' }}
          />
        ) : (
          <h1 
            className="text-3xl font-bold mb-2 cursor-pointer hover:text-muted-foreground transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            {title || 'New Document'}
          </h1>
        )}
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight 
            className={`h-4 w-4 transition-transform ${isMetadataExpanded ? 'rotate-90' : ''}`}
          />
          Document Details
        </button>

        {isMetadataExpanded && (
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-muted-foreground">Status:</label>
                <Select value={document.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tags:</label>
              <div className="flex flex-wrap gap-2 items-center">
                {document.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="w-32 h-8"
                  />
                  <button
                    onClick={addTag}
                    className="p-1 hover:bg-accent rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}