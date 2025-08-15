import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, Calendar, Clock, FileText, Plus, MoreHorizontal, Edit3, ChevronRight, ChevronDown, File, ChevronsDown, ChevronsUp, PenTool, FolderOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/app-layout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/use-projects';
import { useProjectData } from '@/hooks/use-project-data';
import { PROJECT_STATUS_LABELS, PROJECT_LABEL_LABELS, PROJECT_STATUS_COLORS } from '@/lib/types/project';

// Mock draft documents (outside chapters)
const mockDrafts = [
  { id: 'draft-1', title: 'Character Backstory Ideas', wordCount: 350, isCompleted: false, createdAt: '2024-01-15' },
  { id: 'draft-2', title: 'Plot Twist Notes', wordCount: 180, isCompleted: false, createdAt: '2024-01-14' },
  { id: 'draft-3', title: 'Dialogue Experiments', wordCount: 520, isCompleted: false, createdAt: '2024-01-13' },
];

// Mock chapter and document data
const mockChapters = [
  {
    id: '1',
    title: 'Chapter 1: The Beginning',
    wordCount: 2500,
    isCompleted: true,
    documents: [
      { id: '1-1', title: 'Opening Scene', wordCount: 1200, isCompleted: true },
      { id: '1-2', title: 'Character Introduction', wordCount: 800, isCompleted: true },
      { id: '1-3', title: 'World Building', wordCount: 500, isCompleted: true },
    ]
  },
  {
    id: '2',
    title: 'Chapter 2: Rising Action',
    wordCount: 3200,
    isCompleted: true,
    documents: [
      { id: '2-1', title: 'Conflict Introduction', wordCount: 1500, isCompleted: true },
      { id: '2-2', title: 'Character Development', wordCount: 1100, isCompleted: true },
      { id: '2-3', title: 'Plot Advancement', wordCount: 600, isCompleted: true },
    ]
  },
  {
    id: '3',
    title: 'Chapter 3: The Discovery',
    wordCount: 2800,
    isCompleted: false,
    documents: [
      { id: '3-1', title: 'The Revelation', wordCount: 1800, isCompleted: true },
      { id: '3-2', title: 'Consequences', wordCount: 1000, isCompleted: false },
      { id: '3-3', title: 'New Questions', wordCount: 0, isCompleted: false },
    ]
  },
  {
    id: '4',
    title: 'Chapter 4: Complications',
    wordCount: 0,
    isCompleted: false,
    documents: [
      { id: '4-1', title: 'Rising Tension', wordCount: 0, isCompleted: false },
      { id: '4-2', title: 'Character Challenges', wordCount: 0, isCompleted: false },
    ]
  },
  {
    id: '5',
    title: 'Chapter 5: Climax',
    wordCount: 0,
    isCompleted: false,
    documents: [
      { id: '5-1', title: 'The Confrontation', wordCount: 0, isCompleted: false },
      { id: '5-2', title: 'Resolution', wordCount: 0, isCompleted: false },
    ]
  },
  {
    id: '6',
    title: 'Chapter 6: Resolution',
    wordCount: 0,
    isCompleted: false,
    documents: [
      { id: '6-1', title: 'Aftermath', wordCount: 0, isCompleted: false },
      { id: '6-2', title: 'New Beginning', wordCount: 0, isCompleted: false },
    ]
  },
];

export default function ProjectDetailPage() {
  const { id, chapterId, documentId, draftId } = useParams<{ 
    id: string; 
    chapterId?: string; 
    documentId?: string; 
    draftId?: string; 
  }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { createDocumentWithUpdates } = useProjectData();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['1']));
  const [isDraftsExpanded, setIsDraftsExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Derive current view from URL parameters
  const currentView = draftId ? 'draft-document' : 
                     documentId ? 'chapter-document' :
                     chapterId ? 'chapter' :
                     window.location.pathname.includes('/drafts') ? 'drafts' :
                     window.location.pathname.includes('/chapters') ? 'chapters' :
                     'project';

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </AppLayout>
    );
  }

  const statusColor = PROJECT_STATUS_COLORS[project.status];
  const completedChapters = mockChapters.filter(c => c.isCompleted).length;
  const totalWordCount = mockChapters.reduce((sum, c) => sum + c.wordCount, 0);
  const estimatedDaysLeft = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const toggleChapterExpand = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleDocumentSelect = (documentId: string, chapterId: string) => {
    navigate(`/projects/${id}/chapters/${chapterId}/documents/${documentId}`);
  };

  const handleChapterSelect = (chapterId: string) => {
    navigate(`/projects/${id}/chapters/${chapterId}`);
  };

  const collapseAll = () => {
    setExpandedChapters(new Set());
  };

  const expandAll = () => {
    setExpandedChapters(new Set(mockChapters.map(c => c.id)));
  };

  const handleDraftDocumentSelect = (draftId: string) => {
    navigate(`/projects/${id}/drafts/${draftId}`);
  };

  const handleDraftsAreaSelect = () => {
    navigate(`/projects/${id}/drafts`);
  };

  const handleChaptersAreaSelect = () => {
    navigate(`/projects/${id}/chapters`);
  };

  const createNewDraft = () => {
    if (!id) return;
    
    try {
      console.log('Creating new draft document for project:', id);
      const newDocument = createDocumentWithUpdates({
        title: '',
        projectId: id,
        // No chapterId means it's a draft document
      });
      
      console.log('Created document:', newDocument);
      
      // Navigate to the new document page with flag to auto-focus title
      navigate(`/projects/${id}/drafts/${newDocument.id}?new=true`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleCreateDocumentInChapter = (chapterId: string) => {
    if (!id) return;
    
    try {
      console.log('Creating new document for chapter:', chapterId);
      const newDocument = createDocumentWithUpdates({
        title: '',
        projectId: id,
        chapterId: chapterId,
      });
      
      console.log('Created document:', newDocument);
      
      // Navigate to the new document with a flag to auto-focus title
      navigate(`/projects/${id}/chapters/${chapterId}/documents/${newDocument.id}?new=true`);
    } catch (error) {
      console.error('Error creating document in chapter:', error);
    }
  };


  const projectStats = [
    {
      title: 'Total Words',
      value: totalWordCount.toLocaleString(),
      icon: FileText,
      description: 'Words written'
    },
    {
      title: 'Chapters',
      value: `${completedChapters}/${mockChapters.length}`,
      icon: BookOpen,
      description: 'Completed chapters'
    },
    {
      title: 'Progress',
      value: project.targetWordCount ? `${Math.round((totalWordCount / project.targetWordCount) * 100)}%` : 'N/A',
      icon: Target,
      description: 'Of target goal'
    },
    {
      title: 'Days Left',
      value: estimatedDaysLeft !== null ? (estimatedDaysLeft > 0 ? estimatedDaysLeft.toString() : 'Overdue') : 'No deadline',
      icon: Calendar,
      description: estimatedDaysLeft !== null ? 'Until deadline' : 'Set a deadline'
    },
  ];

  return (
    <AppLayout maxWidth="full">
      <div className="flex h-[calc(100vh-6rem)] relative">
        {/* Sidebar */}
        <div className={cn(
          "border-r bg-muted/30 flex flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-0" : "w-80"
        )}>
          <div className={cn(
            "w-80 flex flex-col h-full transition-all duration-300 overflow-hidden",
            isSidebarCollapsed ? "opacity-0 translate-x-[-100%]" : "opacity-100 translate-x-0"
          )}>

          {/* Sidebar content - hidden when collapsed */}
          <div className={cn(
            "flex flex-col h-full transition-all duration-300",
            isSidebarCollapsed ? "invisible" : "visible"
          )}>
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold truncate">{project.name}</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 hover:bg-muted"
                title="Hide Sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${statusColor}20`,
                  color: statusColor,
                  border: `1px solid ${statusColor}40`
                }}
              >
                {PROJECT_STATUS_LABELS[project.status]}
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                {PROJECT_LABEL_LABELS[project.label]}
              </span>
            </div>

            {project.description && (
              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
            )}

            <Button 
              className="w-full gap-2" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                console.log('Start Writing button clicked!');
                createNewDraft();
              }}
            >
              <Edit3 className="h-4 w-4" />
              Start Writing
            </Button>
          </div>

          {/* Drafts */}
          <div className="border-b p-4">
            <div
              className={cn(
                "p-3 rounded-lg transition-all duration-200 group cursor-pointer",
                currentView === 'drafts' || draftId
                  ? "bg-amber-100 dark:bg-amber-950/30 border-2 border-amber-400 shadow-md"
                  : "border border-border hover:bg-muted/50"
              )}
              onClick={handleDraftsAreaSelect}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDraftsExpanded(!isDraftsExpanded);
                    }}
                  >
                    {isDraftsExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <p className="font-medium text-sm flex items-center gap-2">
                      <PenTool className="h-4 w-4 text-amber-600" />
                      Drafts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mockDrafts.length} documents • {mockDrafts.reduce((sum, d) => sum + d.wordCount, 0).toLocaleString()} words
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Drafts plus button clicked!');
                    createNewDraft();
                  }}
                  title="Create New Draft"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Draft Documents */}
            <div
              className={cn(
                "ml-6 overflow-hidden transition-all duration-300 ease-in-out",
                isDraftsExpanded
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              )}
            >
              <div className="space-y-1 pt-1">
                {mockDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className={cn(
                      "p-2 rounded-md cursor-pointer transition-all duration-200 group",
                      draftId === draft.id
                        ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-2 border-amber-400 shadow-md"
                        : "bg-muted/40 border border-muted-foreground/20 hover:bg-muted/60 hover:border-muted-foreground/40 hover:shadow-sm"
                    )}
                    onClick={() => handleDraftDocumentSelect(draft.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="h-3 w-3 text-amber-600 transition-colors duration-200" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{draft.title || 'Untitled Document'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {draft.wordCount.toLocaleString()} words
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(draft.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-2 w-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Move to Chapter</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border",
                    currentView === 'chapters'
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-muted/30 border-border hover:bg-muted hover:border-primary/50 hover:shadow-sm"
                  )}
                  onClick={handleChaptersAreaSelect}
                >
                  <BookOpen className="h-4 w-4" />
                  <h2 className="font-semibold">Chapters</h2>
                  <FolderOpen className="h-3 w-3" />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAll}
                    title="Expand All Chapters"
                    className="h-7 px-2"
                  >
                    <ChevronsDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAll}
                    title="Collapse All Chapters"
                    className="h-7 px-2"
                  >
                    <ChevronsUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                {mockChapters.map((chapter) => (
                  <div key={chapter.id} className="space-y-1">
                    {/* Chapter Header */}
                    <div
                      className={cn(
                        "p-3 rounded-lg transition-all duration-200 group",
                        chapterId === chapter.id && !documentId
                          ? "bg-primary/20 border-4 border-primary shadow-lg ring-2 ring-primary/30"
                          : "border border-border hover:bg-muted/50 hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChapterExpand(chapter.id);
                          }}
                          title="Expand/Collapse Documents"
                        >
                          {expandedChapters.has(chapter.id) ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                          )}
                        </Button>
                        <div
                          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleChapterSelect(chapter.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{chapter.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {chapter.wordCount.toLocaleString()} words
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {chapter.documents.length} documents
                              </span>
                              {chapter.isCompleted && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  ✓ Complete
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleChapterSelect(chapter.id)}
                            title="View Chapter Details"
                          >
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Chapter</DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateDocumentInChapter(chapter.id);
                              }}
                            >
                              Add Document
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    <div
                      className={cn(
                        "ml-6 overflow-hidden transition-all duration-300 ease-in-out",
                        expandedChapters.has(chapter.id)
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="space-y-1 pt-1">
                        {chapter.documents.map((document) => (
                          <div
                            key={document.id}
                            className={cn(
                              "p-2 rounded-md cursor-pointer transition-all duration-200 group",
                              documentId === document.id
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-400 shadow-md"
                                : "bg-muted/40 border border-muted-foreground/20 hover:bg-muted/60 hover:border-muted-foreground/40 hover:shadow-sm"
                            )}
                            onClick={() => handleDocumentSelect(document.id, chapter.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <File className="h-3 w-3 text-muted-foreground transition-colors duration-200" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{document.title || 'Untitled Document'}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-muted-foreground">
                                      {document.wordCount.toLocaleString()} words
                                    </span>
                                    {document.isCompleted && (
                                      <span className="text-xs text-green-600 dark:text-green-400">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-2 w-2" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit Document</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Floating Show Sidebar Button - only when collapsed */}
        {isSidebarCollapsed && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="absolute left-4 top-6 z-10 h-8 w-8 bg-background shadow-lg border"
            title="Show Sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <>
              {currentView === 'draft-document' && draftId ? (
                /* Draft Document View */
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">
                    {mockDrafts.find(d => d.id === draftId)?.title}
                  </h1>
                  <p className="text-muted-foreground">
                    Draft document • {mockDrafts.find(d => d.id === draftId)?.wordCount} words
                  </p>
                </div>
              ) : currentView === 'chapter-document' && documentId && chapterId ? (
                /* Chapter Document View */
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">
                    {mockChapters.find(c => c.id === chapterId)?.documents.find(d => d.id === documentId)?.title}
                  </h1>
                  <p className="text-muted-foreground">
                    Document from {mockChapters.find(c => c.id === chapterId)?.title}
                  </p>
                </div>
              ) : currentView === 'drafts' ? (
                /* Drafts Overview */
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">Drafts</h1>
                  <p className="text-muted-foreground">
                    Manage your draft documents and ideas
                  </p>

                  {/* Drafts Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Drafts</CardTitle>
                        <PenTool className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockDrafts.length}</div>
                        <p className="text-xs text-muted-foreground">Documents</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockDrafts.reduce((sum, d) => sum + d.wordCount, 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">In drafts</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {Math.floor((Date.now() - new Date(mockDrafts[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                        </div>
                        <p className="text-xs text-muted-foreground">Last update</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Drafts Grid */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">All Drafts</h2>
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('New Draft button clicked!');
                          createNewDraft();
                        }} 
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        New Draft
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockDrafts.map((draft) => (
                        <Card
                          key={draft.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            draftId === draft.id && "ring-2 ring-amber-400/30"
                          )}
                          onClick={() => handleDraftDocumentSelect(draft.id)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <PenTool className="h-4 w-4 text-amber-600" />
                              {draft.title || 'Untitled Document'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Words:</span>
                                <span className="font-medium">{draft.wordCount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Created:</span>
                                <span className="font-medium">{new Date(draft.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-medium text-amber-600">Draft</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : currentView === 'chapters' ? (
                /* Chapters Overview */
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">Chapters</h1>
                  <p className="text-muted-foreground">
                    Manage your chapters and track writing progress
                  </p>

                  {/* Chapters Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 mb-8">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockChapters.length}</div>
                        <p className="text-xs text-muted-foreground">Chapters</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockChapters.reduce((sum, c) => sum + c.wordCount, 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">In chapters</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockChapters.filter(c => c.isCompleted).length}</div>
                        <p className="text-xs text-muted-foreground">Finished</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Documents</CardTitle>
                        <File className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{mockChapters.reduce((sum, c) => sum + c.documents.length, 0)}</div>
                        <p className="text-xs text-muted-foreground">Total docs</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Chapters Grid */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">All Chapters</h2>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Chapter
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockChapters.map((chapter) => (
                        <Card
                          key={chapter.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            chapterId === chapter.id && "ring-2 ring-primary/20"
                          )}
                          onClick={() => handleChapterSelect(chapter.id)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              {chapter.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Words:</span>
                                <span className="font-medium">{chapter.wordCount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Documents:</span>
                                <span className="font-medium">{chapter.documents.length}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress:</span>
                                <span className={cn(
                                  "font-medium",
                                  chapter.isCompleted ? "text-green-600" : "text-yellow-600"
                                )}>
                                  {chapter.isCompleted ? 'Complete' : `${chapter.documents.filter(d => d.isCompleted).length}/${chapter.documents.length}`}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <span className={cn(
                                  "font-medium",
                                  chapter.isCompleted ? "text-green-600" : "text-blue-600"
                                )}>
                                  {chapter.isCompleted ? '✓ Complete' : '⏳ In Progress'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : currentView === 'chapter' && chapterId ? (
                /* Chapter View */
                (() => {
                const chapter = mockChapters.find(c => c.id === chapterId);
                if (!chapter) return null;

                const completedDocs = chapter.documents.filter(d => d.isCompleted).length;

                return (
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
                    <p className="text-muted-foreground">
                      Chapter overview and document management
                    </p>

                    {/* Chapter Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-8">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{chapter.wordCount.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">In this chapter</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Documents</CardTitle>
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{completedDocs}/{chapter.documents.length}</div>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Progress</CardTitle>
                          <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{Math.round((completedDocs / chapter.documents.length) * 100)}%</div>
                          <p className="text-xs text-muted-foreground">Complete</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Status</CardTitle>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{chapter.isCompleted ? '✓' : '⏳'}</div>
                          <p className="text-xs text-muted-foreground">{chapter.isCompleted ? 'Complete' : 'In Progress'}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Documents Grid */}
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Documents</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chapter.documents.map((document) => (
                          <Card
                            key={document.id}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              documentId === document.id && "ring-2 ring-primary/20"
                            )}
                            onClick={() => handleDocumentSelect(document.id, chapter.id)}
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <File className="h-4 w-4" />
                                {document.title || 'Untitled Document'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Words:</span>
                                  <span className="font-medium">{document.wordCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Status:</span>
                                  <span className={cn(
                                    "font-medium",
                                    document.isCompleted ? "text-green-600" : "text-yellow-600"
                                  )}>
                                    {document.isCompleted ? 'Complete' : 'In Progress'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Project Overview */
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Project Overview</h1>
                <p className="text-muted-foreground">
                  Track your progress and manage your writing project
                </p>
              </div>
            )}

            {/* Project Statistics Cards - only show in project overview */}
            {currentView === 'project' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {projectStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.title}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.title}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Progress Overview - only show in project overview */}
            {currentView === 'project' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Word Count Progress */}
              {project.targetWordCount && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Writing Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-bold">{totalWordCount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            of {project.targetWordCount.toLocaleString()} words
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">
                            {Math.round((totalWordCount / project.targetWordCount) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((totalWordCount / project.targetWordCount) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chapter Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Chapter Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-bold">{completedChapters}</p>
                        <p className="text-sm text-muted-foreground">
                          of {mockChapters.length} chapters
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">
                          {Math.round((completedChapters / mockChapters.length) * 100)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(completedChapters / mockChapters.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Recent Activity - only show in project overview */}
            {currentView === 'project' && (
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Chapter 2 completed</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Added 500 words to Chapter 3</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Chapter 1 completed</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              </Card>
            )}
            </>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
