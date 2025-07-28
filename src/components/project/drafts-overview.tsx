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
        title: 'New Document',
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
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Draft Documents</h1>
          <p className="text-muted-foreground">
            Manage your draft documents and ideas
          </p>
        </div>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            console.log('Button clicked!');
            handleCreateNewDocument();
          }} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {draftsStats.map((stat) => {
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

      {/* Drafts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            All Draft Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {draftDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No draft documents yet</p>
                <p className="text-sm mb-4">Start writing by creating your first draft document</p>
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
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/projects/${projectId}/drafts/${draft.id}`)}
                >
                  <div>
                    <h3 className="font-medium">{draft.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {draft.wordCount.toLocaleString()} words
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(draft.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                      {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
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