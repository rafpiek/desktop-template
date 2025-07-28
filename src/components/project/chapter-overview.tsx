import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Clock, Target } from 'lucide-react';
import { useProjectData } from '@/hooks/use-project-data';

export function ChapterOverview() {
  const { id: projectId, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  const { chapters, documents } = useProjectData();
  
  if (!projectId || !chapterId) {
    return <div>Chapter not found</div>;
  }

  const chapter = chapters.getChapter(chapterId);
  const chapterDocuments = documents.getDocumentsByChapter(chapterId);
  
  if (!chapter) {
    return <div>Chapter not found</div>;
  }

  const completedDocuments = chapterDocuments.filter(d => d.isCompleted).length;
  const totalDocuments = chapterDocuments.length;

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
        <p className="text-muted-foreground">
          Chapter details and progress tracking
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {chapterStats.map((stat) => {
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

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents in this Chapter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chapterDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No documents in this chapter yet</p>
                <p className="text-sm">Add documents to start writing this chapter</p>
              </div>
            ) : (
              chapterDocuments.map((document) => (
                <div 
                  key={document.id} 
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate(`/projects/${projectId}/chapters/${chapterId}/documents/${document.id}`)}
                >
                  <div>
                    <h3 className="font-medium">{document.title}</h3>
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