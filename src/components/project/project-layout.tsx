import React, { useState } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context';
import { ProjectProvider, useProject } from '@/contexts/project-context';
import { ArrowLeft, BookOpen, Plus, MoreHorizontal, Edit3, ChevronRight, ChevronDown, File, ChevronsDown, ChevronsUp, PenTool, FolderOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PROJECT_STATUS_LABELS, PROJECT_LABEL_LABELS, PROJECT_STATUS_COLORS } from '@/lib/types/project';
import { DeleteChapterDialog } from './delete-chapter-dialog';
import { DeleteDocumentDialog } from './delete-document-dialog';
import { DocumentDropdownMenu } from './document-dropdown-menu';



function ProjectLayoutInner() {
  const { id, chapterId, documentId, draftId } = useParams<{ 
    id: string; 
    chapterId?: string; 
    documentId?: string; 
    draftId?: string; 
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    getProject, 
    getDocument,
    getDraftDocuments, 
    getProjectChapters, 
    getChapterDocuments,
    createDocumentWithUpdates,
    createChapter,
    deleteChapter,
    deleteDocument,
    getProjectStats
  } = useProject();
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isDraftsExpanded, setIsDraftsExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
  const [deleteDocumentDialogOpen, setDeleteDocumentDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { isCollapsed: isSidebarCollapsed, toggle: toggleSidebar } = useSidebar();

  // Auto-expand relevant section when viewing a document
  React.useEffect(() => {
    if (draftId) {
      // If viewing a draft document, expand the drafts section
      console.log('📂 Auto-expanding drafts section for draftId:', draftId);
      setIsDraftsExpanded(true);
    } else if (chapterId) {
      // If viewing a chapter document, expand that chapter
      console.log('📂 Auto-expanding chapter for chapterId:', chapterId);
      setExpandedChapters(prev => new Set(prev).add(chapterId));
    }
  }, [draftId, chapterId]);

  const project = getProject(id!);
  const draftDocuments = id ? getDraftDocuments(id) : [];
  const projectChapters = id ? getProjectChapters(id) : [];
  const stats = id ? getProjectStats(id) : { totalDrafts: 0, draftWords: 0 };
  
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

  const handleDraftDocumentSelect = (draftId: string) => {
    navigate(`/projects/${id}/drafts/${draftId}`);
  };

  const handleDraftsAreaSelect = () => {
    navigate(`/projects/${id}/drafts`);
  };

  const handleChaptersAreaSelect = () => {
    navigate(`/projects/${id}/chapters`);
  };

  const collapseAll = () => {
    setExpandedChapters(new Set());
  };

  const expandAll = () => {
    setExpandedChapters(new Set(projectChapters.map(c => c.id)));
  };

  const handleCreateNewChapter = () => {
    if (!id) return;
    
    // Generate unique chapter title
    const existingChapters = getProjectChapters(id);
    const chapterNumber = existingChapters.length + 1;
    const defaultTitle = `Chapter ${chapterNumber}`;
    
    const newChapter = createChapter({
      projectId: id,
      title: defaultTitle,
    });
    navigate(`/projects/${id}/chapters/${newChapter.id}?new=true`);
  };

  const createNewDraft = () => {
    if (!id) {
      console.error('No project ID found');
      return;
    }
    
    try {
      console.log('Creating new draft document for project:', id);
      console.log('Current draft documents before creation:', getDraftDocuments(id));
      
      const newDocument = createDocumentWithUpdates({
        title: '',
        projectId: id,
        // No chapterId means it's a draft document
      });
      
      console.log('Created document:', newDocument);
      console.log('Current draft documents after creation:', getDraftDocuments(id));
      console.log('localStorage documents:', JSON.parse(localStorage.getItem('zeyn-documents') || '[]'));
      
      const targetUrl = `/projects/${id}/drafts/${newDocument.id}?new=true`;
      console.log('Navigating to:', targetUrl);
      
      // Navigate to the new document page with flag to auto-focus title
      navigate(targetUrl);
      
      console.log('Navigation completed');
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapterToDelete(chapterId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (deleteDocuments: boolean) => {
    if (chapterToDelete) {
      deleteChapter(chapterToDelete, deleteDocuments);
      setChapterToDelete(null);
      setDeleteDialogOpen(false);
      // Navigate back to project overview if we were viewing the deleted chapter
      if (chapterId === chapterToDelete) {
        navigate(`/projects/${id}`);
      }
    }
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
      
      // Navigate to the new document with flag to auto-focus title
      navigate(`/projects/${id}/chapters/${chapterId}/documents/${newDocument.id}?new=true`);
    } catch (error) {
      console.error('Error creating document in chapter:', error);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDocumentDialogOpen(true);
  };

  const handleConfirmDeleteDocument = () => {
    if (documentToDelete) {
      const document = getDocument(documentToDelete);
      if (document) {
        deleteDocument(documentToDelete);
        
        // Navigate away if we were viewing the deleted document
        if (documentId === documentToDelete) {
          if (document.chapterId) {
            // Navigate to chapter overview
            navigate(`/projects/${id}/chapters/${document.chapterId}`);
          } else {
            // Navigate to drafts overview
            navigate(`/projects/${id}/drafts`);
          }
        }
      }
      
      setDocumentToDelete(null);
      setDeleteDocumentDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen relative">
        {/* Sidebar */}
        <div className={cn(
          "border-r bg-muted/30 flex flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-0" : "w-80"
        )}>
          <div className={cn(
            "w-80 flex flex-col h-full transition-all duration-300 overflow-hidden",
            isSidebarCollapsed ? "opacity-0 translate-x-[-100%]" : "opacity-100 translate-x-0"
          )}>
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 
                    className="text-xl font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/projects/${id}`)}
                    title="View project overview"
                  >
                    {project.name}
                  </h1>
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

              <Button className="w-full gap-2" size="sm" onClick={createNewDraft}>
                <Edit3 className="h-4 w-4" />
                Start Writing
              </Button>
            </div>

            {/* Drafts */}
            <div className="border-b p-4">
              <div
                className={cn(
                  "p-3 rounded-lg transition-all duration-200 group cursor-pointer",
                  location.pathname.includes('/drafts')
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
                        {stats.totalDrafts} documents • {stats.draftWords.toLocaleString()} words
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
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
                    ? "max-h-[60vh] opacity-100 overflow-y-auto" 
                    : "max-h-0 opacity-0"
                )}
              >
                <div className="space-y-1 pt-1">
                  {draftDocuments.map((draft) => (
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
                        <DocumentDropdownMenu 
                          document={draft}
                          onDelete={handleDeleteDocument}
                          size="sm"
                        />
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
                      location.pathname.includes('/chapters') && !documentId
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCreateNewChapter}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {projectChapters.map((chapter) => {
                    const chapterDocuments = getChapterDocuments(chapter.id);
                    return (
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
                            {chapterDocuments.length > 0 ? (
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
                            ) : (
                              <div className="h-6 w-6" />
                            )}
                            <div 
                              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                              onClick={() => handleChapterSelect(chapter.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "font-medium text-sm truncate",
                                  !chapter.title && "text-muted-foreground/60 italic"
                                )}>
                                  {chapter.title || 'New Chapter'}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {chapter.wordCount.toLocaleString()} words
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {chapterDocuments.length} documents
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
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateDocumentInChapter(chapter.id);
                                    }}
                                  >
                                    Add Document
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteChapter(chapter.id);
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
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
                              ? "max-h-[50vh] opacity-100 overflow-y-auto" 
                              : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="space-y-1 pt-1">
                            {chapterDocuments.map((document) => (
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
                                  <DocumentDropdownMenu 
                                    document={document}
                                    onDelete={handleDeleteDocument}
                                    size="sm"
                                  />
                                  </div>
                              </div>
                            ))}
                            
                            {/* Add Document Button */}
                            <div className="pt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateDocumentInChapter(chapter.id)}
                                className="w-full justify-start h-8 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Add Document
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
            className="absolute left-4 top-4 z-10 h-8 w-8 bg-background shadow-lg border"
            title="Show Sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        )}

        {/* Main Content */}
        <div className="flex-1 h-screen overflow-hidden">
          <div className={cn(
            "h-full flex flex-col",
            isSidebarCollapsed && "pl-16"
          )}>
            <Outlet />
          </div>
        </div>
      </div>

      {/* Delete Chapter Dialog */}
      {chapterToDelete && (
        <DeleteChapterDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          chapterTitle={projectChapters.find(c => c.id === chapterToDelete)?.title || 'Unknown Chapter'}
          documentCount={getChapterDocuments(chapterToDelete).length}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Delete Document Dialog */}
      {documentToDelete && (
        <DeleteDocumentDialog
          open={deleteDocumentDialogOpen}
          onOpenChange={setDeleteDocumentDialogOpen}
          documentTitle={getDocument(documentToDelete)?.title || ''}
          wordCount={getDocument(documentToDelete)?.wordCount || 0}
          onConfirm={handleConfirmDeleteDocument}
        />
      )}
    </div>
  );
}

export function ProjectLayout() {
  return (
    <ProjectProvider>
      <SidebarProvider>
        <ProjectLayoutInner />
      </SidebarProvider>
    </ProjectProvider>
  );
}