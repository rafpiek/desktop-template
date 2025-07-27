import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Clock, Target } from 'lucide-react';
import { uuidv7 } from 'uuidv7';

const mockChapters = [
  { 
    id: uuidv7(), 
    title: 'Chapter 1: The Beginning', 
    wordCount: 2500, 
    isCompleted: true,
    documents: [
      { id: uuidv7(), title: 'Opening Scene', wordCount: 1200, isCompleted: true },
      { id: uuidv7(), title: 'Character Introduction', wordCount: 800, isCompleted: true },
      { id: uuidv7(), title: 'World Building', wordCount: 500, isCompleted: true },
    ]
  },
  { 
    id: uuidv7(), 
    title: 'Chapter 2: Rising Action', 
    wordCount: 3200, 
    isCompleted: true,
    documents: [
      { id: uuidv7(), title: 'Conflict Introduction', wordCount: 1500, isCompleted: true },
      { id: uuidv7(), title: 'Character Development', wordCount: 1100, isCompleted: true },
      { id: uuidv7(), title: 'Plot Advancement', wordCount: 600, isCompleted: true },
    ]
  },
  { 
    id: uuidv7(), 
    title: 'Chapter 3: The Discovery', 
    wordCount: 2800, 
    isCompleted: false,
    documents: [
      { id: uuidv7(), title: 'The Revelation', wordCount: 1800, isCompleted: true },
      { id: uuidv7(), title: 'Consequences', wordCount: 1000, isCompleted: false },
      { id: uuidv7(), title: 'New Questions', wordCount: 0, isCompleted: false },
    ]
  },
];

export function ChaptersOverview() {
  const totalWords = mockChapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const completedChapters = mockChapters.filter(c => c.isCompleted).length;
  const totalChapters = mockChapters.length;

  const chaptersStats = [
    {
      title: 'Total Chapters',
      value: totalChapters.toString(),
      icon: BookOpen,
      description: 'Total chapters'
    },
    {
      title: 'Completed',
      value: `${completedChapters}/${totalChapters}`,
      icon: Target,
      description: 'Chapters completed'
    },
    {
      title: 'Total Words',
      value: totalWords.toLocaleString(),
      icon: FileText,
      description: 'Words in all chapters'
    },
    {
      title: 'Progress',
      value: `${Math.round((completedChapters / totalChapters) * 100)}%`,
      icon: Clock,
      description: 'Overall completion'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Chapters</h1>
        <p className="text-muted-foreground">
          Overview of all chapters in your project
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {chaptersStats.map((stat) => {
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

      {/* Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Chapters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockChapters.map((chapter) => (
              <div key={chapter.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{chapter.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {chapter.wordCount.toLocaleString()} words
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {chapter.documents.length} documents
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    chapter.isCompleted 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {chapter.isCompleted ? 'Complete' : 'In Progress'}
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