import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, BookOpen, FolderOpen, Clock } from 'lucide-react';
import { useLastAccessed } from '@/contexts/last-accessed-context';
import { cn } from '@/lib/utils';

export function ContinueOnSection() {
  const { lastAccessed } = useLastAccessed();
  
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
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Continue Writing</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {lastAccessed.document && (
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-blue-500" />
                <Badge variant="secondary" className="text-xs">
                  {formatRelativeTime(lastAccessed.document.timestamp)}
                </Badge>
              </div>
              <CardTitle className="text-base line-clamp-1">
                {lastAccessed.document.title}
              </CardTitle>
              <CardDescription className="text-xs">Document</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link 
                to={
                  lastAccessed.document.chapterId
                    ? `/projects/${lastAccessed.document.projectId}/chapters/${lastAccessed.document.chapterId}/documents/${lastAccessed.document.id}`
                    : `/projects/${lastAccessed.document.projectId}/drafts/${lastAccessed.document.id}`
                }
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-between px-2 h-8"
                  size="sm"
                >
                  <span className="text-sm">Continue writing</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {lastAccessed.chapter && (
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <BookOpen className="h-5 w-5 text-green-500" />
                <Badge variant="secondary" className="text-xs">
                  {formatRelativeTime(lastAccessed.chapter.timestamp)}
                </Badge>
              </div>
              <CardTitle className="text-base line-clamp-1">
                {lastAccessed.chapter.title}
              </CardTitle>
              <CardDescription className="text-xs">Chapter</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link 
                to={`/projects/${lastAccessed.chapter.projectId}/chapters/${lastAccessed.chapter.id}`}
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-between px-2 h-8"
                  size="sm"
                >
                  <span className="text-sm">Open chapter</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {lastAccessed.project && (
          <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FolderOpen className="h-5 w-5 text-purple-500" />
                <Badge variant="secondary" className="text-xs">
                  {formatRelativeTime(lastAccessed.project.timestamp)}
                </Badge>
              </div>
              <CardTitle className="text-base line-clamp-1">
                {lastAccessed.project.title}
              </CardTitle>
              <CardDescription className="text-xs">Project</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link to={`/projects/${lastAccessed.project.id}`}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between px-2 h-8"
                  size="sm"
                >
                  <span className="text-sm">View project</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}