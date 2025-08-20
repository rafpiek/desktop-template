import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { X, Plus, ChevronRight } from 'lucide-react';
import { DocumentEditorV2 } from '@/components/editor/v2/document-editor-v2';
import { DocumentDropdownMenu } from '@/components/project/document-dropdown-menu';
import { useProject } from '@/contexts/project-context';
import { useGoalsContext } from '@/contexts/goals-context';
import { useLastAccessed } from '@/contexts/last-accessed-context';
import type { DocumentStatus } from '@/lib/types/project';
import { DOCUMENT_STATUS_LABELS } from '@/lib/types/project';

export function DocumentView() {
  const { id: projectId, chapterId: _chapterId, documentId, draftId } = useParams<{
    id: string;
    chapterId?: string;
    documentId?: string;
    draftId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { getDocument, getChapter, updateDocument, deleteDocument } = useProject();
  const { trackDocumentChange } = useGoalsContext();
  const { setLastDocument } = useLastAccessed();
  const [focusEditor, setFocusEditor] = useState<(() => void) | null>(null);
  const [textStats, setTextStats] = useState<{
    wordCount: number;
    charactersWithSpaces: number;
    charactersWithoutSpaces: number;
  }>({ wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 });

  // Check if this is a new document
  const isNewDocument = searchParams.get('new') === 'true';

  // Determine which document we're viewing
  const document = draftId
    ? getDocument(draftId)
    : documentId
      ? getDocument(documentId)
      : null;

  // Track document access
  useEffect(() => {
    if (!document || !projectId) return;

    const docId = draftId || documentId;
    if (docId) {
      setLastDocument(
        docId,
        document.title || 'Untitled Document',
        projectId,
        _chapterId
      );
    }
  }, [document, draftId, documentId, projectId, _chapterId, setLastDocument]);

  // Initialize text stats when document changes - load from localStorage first
  React.useEffect(() => {
    if (!document) return;


    const loadStoredTextStats = (documentId: string) => {
      try {
        const storageKey = `document-data-${documentId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const documentData = JSON.parse(saved);
          return {
            wordCount: documentData.wordCount || 0,
            charactersWithSpaces: documentData.charactersWithSpaces || 0,
            charactersWithoutSpaces: documentData.charactersWithoutSpaces || 0
          };
        }
      } catch (error) {
      }

      // Fallback to document model data
      return {
        wordCount: document?.wordCount || 0,
        charactersWithSpaces: 0,
        charactersWithoutSpaces: 0
      };
    };

    const storedStats = loadStoredTextStats(document.id);
    setTextStats(storedStats);
  }, [document?.id, document?.wordCount]);

  // Function to clear the new document flag
  const clearNewDocumentFlag = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('new');
    const newUrl = `${location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
    navigate(newUrl, { replace: true });
  };

  if (!projectId) {
    return <div>Project not found</div>;
  }

  if (!document) {
    return <div>Document not found</div>;
  }

  const handleContentChange = React.useCallback((content: any, stats: {
    wordCount: number;
    charactersWithSpaces: number;
    charactersWithoutSpaces: number;
  }) => {

    // Update local state for immediate UI display
    setTextStats(stats);

    // Track the change for goals (calculate word delta)
    const previousWordCount = document.wordCount || 0;
    const wordDelta = stats.wordCount - previousWordCount;

    // Only track positive changes (words added, not deleted)
    if (wordDelta > 0) {
      trackDocumentChange(
        document.id,
        projectId,
        wordDelta,
        stats.charactersWithSpaces - (previousWordCount * 5) // Rough estimate of char delta
      );
    }

    // Update document with content AND text statistics
    updateDocument(document.id, {
      content: content,  // IMPORTANT: Save the actual content!
      wordCount: stats.wordCount,
      // Note: You might want to store character counts in document model too
      // charactersWithSpaces: stats.charactersWithSpaces,
      // charactersWithoutSpaces: stats.charactersWithoutSpaces
    });
  }, [document.id, document.wordCount, projectId, trackDocumentChange, updateDocument]);

  // Get chapter info if document belongs to a chapter
  const chapter = document.chapterId ? getChapter(document.chapterId) : null;

  // Create comprehensive stats subtitle
  const formatStats = () => {
    const parts = [];

    // Words
    parts.push(`${textStats.wordCount.toLocaleString()} words`);

    // Always show characters if we have any content (even if 0 to debug)
    if (textStats.wordCount > 0) {
      parts.push(`${textStats.charactersWithSpaces.toLocaleString()} chars`);
      parts.push(`${textStats.charactersWithoutSpaces.toLocaleString()} chars (no spaces)`);
    }

    return parts.join(' • ');
  };

  const subtitle = chapter
    ? `Document from ${chapter.title} • ${formatStats()}`
    : `Draft document • ${formatStats()}`;

  const handleDocumentDelete = (documentId: string) => {
    // Navigate away from the deleted document
    if (document.chapterId) {
      // Navigate to chapter overview
      navigate(`/projects/${projectId}/chapters/${document.chapterId}`);
    } else {
      // Navigate to drafts overview
      navigate(`/projects/${projectId}/drafts`);
    }

    // Delete the document
    deleteDocument(documentId);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header - No padding on container, padding inside */}
      <div className="flex-shrink-0 border-b px-6 pt-6 pb-4">
        <DocumentHeader
          document={document}
          subtitle={subtitle}
          updateDocument={updateDocument}
          focusEditor={focusEditor}
          isNewDocument={isNewDocument}
          clearNewDocumentFlag={clearNewDocumentFlag}
          onDocumentDelete={handleDocumentDelete}
          setLastDocument={setLastDocument}
          projectId={projectId}
          chapterId={_chapterId}
          documentId={draftId || documentId}
        />
      </div>

      {/* Scrollable Editor Area - Takes remaining height, no padding */}
      <div className="flex-1 min-h-0">
        <TooltipProvider>
          <DocumentEditorV2
            documentId={document.id}
            onEditorReady={setFocusEditor}
            autoFocus={!isNewDocument}
            onContentChange={handleContentChange}
          />
        </TooltipProvider>
      </div>
    </div>
  );
}

interface DocumentHeaderProps {
  document: any; // Document type from our hooks
  subtitle: string;
  updateDocument: (id: string, updates: Partial<any>) => any;
  focusEditor: (() => void) | null;
  isNewDocument: boolean;
  clearNewDocumentFlag: () => void;
  onDocumentDelete: (documentId: string) => void;
  setLastDocument: (id: string, title: string, projectId: string, chapterId?: string) => void;
  projectId: string;
  chapterId?: string;
  documentId?: string;
}

function DocumentHeader({ document, subtitle, updateDocument, focusEditor, isNewDocument, clearNewDocumentFlag, onDocumentDelete, setLastDocument, projectId, chapterId, documentId }: DocumentHeaderProps) {
  const [title, setTitle] = useState(document.title || '');
  const [newTag, setNewTag] = useState('');
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title if it's empty or if this is a new document from navigation
  useEffect(() => {
    if (isNewDocument || !document.title || document.title === '') {
      setIsEditingTitle(true);
    }
  }, [document.title, isNewDocument]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      // Small delay to ensure input is fully rendered
      const timeoutId = setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
          titleInputRef.current.select();
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [isEditingTitle]);

  // Update local title when document changes
  useEffect(() => {
    setTitle(document.title || '');
  }, [document.title]);

  const handleTitleSubmit = () => {
    const finalTitle = title.trim();

    const updatedDocument = updateDocument(document.id, { title: finalTitle });
    if (updatedDocument) {
      setTitle(finalTitle);
      // Update last accessed with the new title
      if (projectId && documentId) {
        setLastDocument(
          documentId,
          finalTitle || 'Untitled Document',
          projectId,
          chapterId
        );
      }
    }
    setIsEditingTitle(false);

    // Clear the new document flag to prevent re-focusing
    if (isNewDocument) {
      clearNewDocumentFlag();
    }
  };

  const focusEditorAfterTitle = () => {
    if (focusEditor) {
      // Longer delay to ensure all state updates and DOM changes are complete
      setTimeout(() => {
        try {
          focusEditor();
        } catch (error) {
        }
      }, 200); // Increased delay for more reliability
    } else {
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSubmit();
      // Focus the editor after title submission with improved timing
      focusEditorAfterTitle();
    } else if (e.key === 'Escape') {
      setTitle(document.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleTitleBlur = () => {
    handleTitleSubmit();
    // Also focus editor when title loses focus (e.g., clicking away)
    if (isNewDocument) {
      focusEditorAfterTitle();
    }
  };

  const handleStatusChange = (newStatus: DocumentStatus) => {
    updateDocument(document.id, { status: newStatus });
  };

  const addTag = () => {
    if (newTag.trim()) {
      const newTagObj = {
        id: crypto.randomUUID(),
        name: newTag.trim(),
      };

      const updatedTags = [...document.tags, newTagObj];
      updateDocument(document.id, { tags: updatedTags });
      setNewTag('');
    }
  };

  const removeTag = (tagId: string) => {
    const updatedTags = document.tags.filter((tag: any) => tag.id !== tagId);
    updateDocument(document.id, { tags: updatedTags });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleBlur}
                placeholder="Enter document title..."
                className="text-3xl font-bold border-none p-0 h-auto text-foreground bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 mb-2"
                style={{ fontSize: '1.875rem', lineHeight: '2.25rem', minHeight: '2.25rem' }}
              />
            ) : (
              <h1
                className="text-3xl font-bold mb-2 cursor-pointer hover:text-muted-foreground transition-colors min-h-[2.25rem] flex items-center"
                onClick={() => setIsEditingTitle(true)}
                style={{ fontSize: '1.875rem', lineHeight: '2.25rem' }}
              >
                {title || (
                  <span className="text-muted-foreground/60">Enter document title...</span>
                )}
              </h1>
            )}
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex-shrink-0 group">
            <DocumentDropdownMenu
              document={document}
              onDelete={onDocumentDelete}
              className="opacity-100"
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isMetadataExpanded ? 'rotate-90' : ''}`}
          />
          Document Details {document.id}
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
