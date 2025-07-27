import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, FileText, Clock, Target } from 'lucide-react';

const mockDrafts = [
  { id: '019424ec-a96a-7000-8000-00000000000d', title: 'Character Backstory Ideas', wordCount: 350, isCompleted: false, createdAt: '2024-01-15' },
  { id: '019424ec-a96a-7000-8000-00000000000e', title: 'Plot Twist Notes', wordCount: 180, isCompleted: false, createdAt: '2024-01-14' },
  { id: '019424ec-a96a-7000-8000-00000000000f', title: 'Dialogue Experiments', wordCount: 520, isCompleted: false, createdAt: '2024-01-13' },
];

export function DraftsOverview() {
  const totalWords = mockDrafts.reduce((sum, draft) => sum + draft.wordCount, 0);
  const totalDrafts = mockDrafts.length;

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
      value: Math.round(totalWords / totalDrafts).toLocaleString(),
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Draft Documents</h1>
        <p className="text-muted-foreground">
          Manage your draft documents and ideas
        </p>
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
            {mockDrafts.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    Draft
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