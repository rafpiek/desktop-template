import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, FileText, Clock, Target, Plus } from 'lucide-react';
import { useProjectData } from '@/hooks/use-project-data';
import { useProject } from '@/contexts/project-context';
import { useLastAccessed } from '@/contexts/last-accessed-context';

export function ChapterOverview() {
  const { id: projectId, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { chapters, documents } = useProjectData();
  const { createDocumentWithUpdates, updateChapter } = useProject();
  const { setLastChapter } = useLastAccessed();
  
  const searchParams = new URLSearchParams(location.search);
  const isNewChapter = searchParams.get('new') === 'true';
  
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(isNewChapter);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const chapter = chapterId ? chapters.getChapter(chapterId) : null;
  const chapterDocuments = chapterId ? documents.getDocumentsByChapter(chapterId) : [];
  
  // Track chapter access
  useEffect(() => {
    if (chapter && projectId && chapterId && !isNewChapter) {
      setLastChapter(chapterId, chapter.title || 'Untitled Chapter', projectId);
    }
    // Only run once when navigating to a chapter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, projectId]);

  // Update local title when chapter changes
  useEffect(() => {
    if (isNewChapter && titleInputRef.current && chapter) {
      setTitle('');
      setIsEditingTitle(true);
      titleInputRef.current.focus();
      titleInputRef.current.select();
      
      // Remove the 'new' query parameter from URL
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('new');
      const newSearch = newSearchParams.toString();
      navigate(`/projects/${projectId}/chapters/${chapterId}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    } else if (chapter) {
      setTitle(chapter.title || '');
    }
  }, [chapter?.title, isNewChapter, navigate, projectId, chapterId, location.search, chapter]);
  
  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  if (!projectId || !chapterId) {
    return <div>Chapter not found</div>;
  }

  if (!chapter) {
    return <div>Chapter not found</div>;
  }

  const completedDocuments = chapterDocuments.filter(d => d.isCompleted).length;
  const totalDocuments = chapterDocuments.length;

  const handleTitleSubmit = () => {
    const finalTitle = title.trim() || 'New Chapter';
    console.log('Chapter title update requested:', finalTitle);
    
    updateChapter(chapter.id, { title: finalTitle });
    setTitle(finalTitle);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const finalTitle = title.trim() || 'New Chapter';
      updateChapter(chapter.id, { title: finalTitle });
      setTitle(finalTitle);
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setTitle(chapter.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleCreateNewDocument = () => {
    console.log('Creating new document for chapter:', chapterId);
    try {
      const newDocument = createDocumentWithUpdates({
        title: '',
        projectId,
        chapterId,
      });
      
      console.log('Created document:', newDocument);
      
      // Navigate to the new document page
      navigate(`/projects/${projectId}/chapters/${chapterId}/documents/${newDocument.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const chapterStats = [
    {
      title: 'Total Words',
      value: chapter.wordCount.toLocaleString(),
      icon: FileText,
      description: 'Words in chapter'
    },
    {
      title: 'Documents',
      value: `${completedDocuments}/${totalDocuments}`,
      icon: BookOpen,
      description: 'Completed documents'
    },
    {
      title: 'Progress',
      value: `${Math.round((completedDocuments / totalDocuments) * 100)}%`,
      icon: Target,
      description: 'Chapter completion'
    },
    {
      title: 'Status',
      value: chapter.isCompleted ? 'Complete' : 'In Progress',
      icon: Clock,
      description: 'Current status'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          {isEditingTitle ? (
            <Input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleSubmit}
              placeholder="New Chapter"
              className="text-2xl sm:text-3xl font-bold border-none p-0 h-auto text-foreground bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 mb-2 placeholder:text-muted-foreground/50"
              style={{ fontSize: '1.875rem', lineHeight: '2.25rem' }}
              autoFocus
            />
          ) : (
            <h1 
              className={cn(
                "text-2xl sm:text-3xl font-bold mb-2 cursor-pointer hover:text-muted-foreground transition-colors",
                !title && "text-muted-foreground/50"
              )}
              onClick={() => setIsEditingTitle(true)}
            >
              {title || 'New Chapter'}
            </h1>
          )}
          <p className="text-muted-foreground text-sm sm:text-base">
            Chapter details and progress tracking
          </p>
        </div>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            console.log('Button clicked!');
            handleCreateNewDocument();
          }} 
          className="flex items-center gap-2 self-start"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Document</span>
          <span className="sm:hidden">New Doc</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {chapterStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Documents List */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-5 w-5 flex-shrink-0" />
            Documents in this Chapter
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-4">
            {chapterDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No documents in this chapter yet</p>
                <p className="text-sm mb-4">Add documents to start writing this chapter</p>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Create First Document clicked!');
                    handleCreateNewDocument();
                  }} 
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create First Document
                </Button>
              </div>
            ) : (
              chapterDocuments.map((document) => (
                <div 
                  key={document.id} 
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/projects/${projectId}/chapters/${chapterId}/documents/${document.id}`)}
                >
                  <div>
                    <h3 className="font-medium">{document.title || 'Untitled Document'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {document.wordCount.toLocaleString()} words
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.isCompleted && (
                      <span className="text-green-600 dark:text-green-400 text-sm">
                        ✓ Complete
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      document.isCompleted 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {document.isCompleted ? 'Done' : document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}