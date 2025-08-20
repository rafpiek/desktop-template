import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, BookOpen, FolderOpen, Clock, Sparkles, Zap } from 'lucide-react';
import { useLastAccessed } from '@/contexts/last-accessed-context';
import { cn } from '@/lib/utils';

export function ContinueOnSection() {
  const { lastAccessed } = useLastAccessed();

  // Get current titles directly from localStorage
  const getCurrentTitle = (type: 'project' | 'document' | 'chapter', item: any) => {
    try {
      if (type === 'project') {
        const projects = JSON.parse(localStorage.getItem('zeyn-projects') || '[]');
        const currentProject = projects.find((p: any) => p.id === item.id);
        // If we find the project and it has a valid name (not empty, not "Untitled Project"), use it
        if (currentProject?.name && currentProject.name !== 'Untitled Project') {
          return currentProject.name;
        }
        // Otherwise fallback to cached name if it's valid
        if (item.name && item.name !== 'Untitled Project') {
          return item.name;
        }
        return 'Untitled Project';
      } else if (type === 'document') {
        const documents = JSON.parse(localStorage.getItem('zeyn-documents') || '[]');
        const currentDocument = documents.find((d: any) => d.id === item.id);
        if (currentDocument?.title && currentDocument.title !== 'Untitled Document') {
          return currentDocument.title;
        }
        if (item.title && item.title !== 'Untitled Document') {
          return item.title;
        }
        return 'Untitled Document';
      } else if (type === 'chapter') {
        const chapters = JSON.parse(localStorage.getItem('zeyn-chapters') || '[]');
        const currentChapter = chapters.find((c: any) => c.id === item.id);
        if (currentChapter?.title && currentChapter.title !== 'Untitled Chapter') {
          return currentChapter.title;
        }
        if (item.title && item.title !== 'Untitled Chapter') {
          return item.title;
        }
        return 'Untitled Chapter';
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
    return item.title || 'Untitled';
  };

  // Check if we have any last accessed items
  const hasAnyLastAccessed = lastAccessed.project || lastAccessed.chapter || lastAccessed.document;

  if (!hasAnyLastAccessed) {
    return null;
  }

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <section className="space-y-8 relative">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <Zap className="h-4 w-4 mr-2 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Pick up where you left off</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Continue Your Story
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your creative momentum awaits. Jump back into your latest work.
        </p>
      </div>

      {/* Recent Work Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {lastAccessed.document && (
          <Link
            to={
              lastAccessed.document.chapterId
                ? `/projects/${lastAccessed.document.projectId}/chapters/${lastAccessed.document.chapterId}/documents/${lastAccessed.document.id}`
                : `/projects/${lastAccessed.document.projectId}/drafts/${lastAccessed.document.id}`
            }
            className="group block"
          >
            <Card className={cn(
              "h-full border border-border/60 bg-card/90 backdrop-blur-sm hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            )}>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-blue-500/30 text-blue-600">
                    {formatRelativeTime(lastAccessed.document.timestamp)}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                  {getCurrentTitle('document', lastAccessed.document)}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  Document • Ready to edit
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Continue writing</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {lastAccessed.chapter && (
          <Link
            to={`/projects/${lastAccessed.chapter.projectId}/chapters/${lastAccessed.chapter.id}`}
            className="group block"
          >
            <Card className={cn(
              "h-full border border-border/60 bg-card/90 backdrop-blur-sm hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            )}>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-5 w-5 text-emerald-500" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-emerald-500/30 text-emerald-600">
                    {formatRelativeTime(lastAccessed.chapter.timestamp)}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
                  {getCurrentTitle('chapter', lastAccessed.chapter)}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  Chapter • In progress
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Open chapter</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {lastAccessed.project && (
          <Link to={`/projects/${lastAccessed.project.id}`} className="group block">
            <Card className={cn(
              "h-full border border-border/60 bg-card/90 backdrop-blur-sm hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            )}>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FolderOpen className="h-5 w-5 text-purple-500" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-purple-500/30 text-purple-600">
                    {formatRelativeTime(lastAccessed.project.timestamp)}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                  {getCurrentTitle('project', lastAccessed.project)}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  Project • Active workspace
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">View project</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </section>
  );
}
