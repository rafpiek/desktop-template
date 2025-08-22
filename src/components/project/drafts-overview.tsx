import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, FileText, Clock, Target, Plus } from 'lucide-react';
import { useProject } from '@/contexts/project-context';

export function DraftsOverview() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDraftDocuments, createDocumentWithUpdates } = useProject();
  
  if (!projectId) {
    return <div>Project not found</div>;
  }

  const draftDocuments = getDraftDocuments(projectId);
  const totalWords = draftDocuments.reduce((sum, draft) => sum + draft.wordCount, 0);
  const totalDrafts = draftDocuments.length;

  const handleCreateNewDocument = () => {
    console.log('Creating new document for project:', projectId);
    try {
      const newDocument = createDocumentWithUpdates({
        title: '',
        projectId,
        // No chapterId means it's a draft document
      });
      
      console.log('Created document:', newDocument);
      
      // Navigate to the new document page
      navigate(`/projects/${projectId}/drafts/${newDocument.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const draftsStats = [
    {
      title: 'Total Drafts',
      value: totalDrafts.toString(),
      icon: FileText,
      description: 'Draft documents'
    },
    {
      title: 'Total Words',
      value: totalWords.toLocaleString(),
      icon: PenTool,
      description: 'Words in drafts'
    },
    {
      title: 'Average Words',
      value: totalDrafts > 0 ? Math.round(totalWords / totalDrafts).toLocaleString() : '0',
      icon: Target,
      description: 'Per draft'
    },
    {
      title: 'Recent Activity',
      value: 'Today',
      icon: Clock,
      description: 'Last updated'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Draft Documents</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your draft documents and ideas
          </p>
        </div>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            console.log('Button clicked!');
            handleCreateNewDocument();
          }} 
          className="gap-2 self-start"
        >
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {draftsStats.map((stat) => {
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

      {/* Drafts List */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PenTool className="h-5 w-5 flex-shrink-0" />
            All Draft Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-3">
            {draftDocuments.length === 0 ? (
              <div className="text-center py-12 px-6 text-muted-foreground">
                <PenTool className="h-16 w-16 mx-auto mb-6 opacity-40" />
                <p className="text-xl font-medium mb-3">No draft documents yet</p>
                <p className="text-sm mb-6 text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
                  Start writing by creating your first draft document to capture ideas and experiment with concepts
                </p>
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
              draftDocuments.map((draft) => (
                <div 
                  key={draft.id} 
                  className="group relative transition-all duration-200 border-2 border-border bg-card hover:border-primary/30 hover:shadow-sm rounded-lg cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/projects/${projectId}/drafts/${draft.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold group-hover:text-foreground transition-colors duration-200">
                            {draft.title || 'Untitled Document'}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-muted-foreground/60" />
                            <p className="text-sm font-medium text-muted-foreground">
                              {draft.wordCount.toLocaleString()} words
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-muted-foreground/60" />
                            <p className="text-sm font-medium text-muted-foreground">
                              Created {new Date(draft.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-6">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                          ✍ {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                        </span>
                      </div>
                    </div>
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