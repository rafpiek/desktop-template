import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Clock, Target } from 'lucide-react';

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
];

export function ChapterOverview() {
  const { chapterId } = useParams<{ chapterId: string }>();
  
  const chapter = mockChapters.find(c => c.id === chapterId);
  
  if (!chapter) {
    return <div>Chapter not found</div>;
  }

  const completedDocuments = chapter.documents.filter(d => d.isCompleted).length;
  const totalDocuments = chapter.documents.length;

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
            {chapter.documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    {document.isCompleted ? 'Done' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}