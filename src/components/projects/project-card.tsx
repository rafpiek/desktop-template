import { useState } from 'react';
import { MoreHorizontal, Star, Archive, Copy, Trash2, Clock, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/types/project';
import { PROJECT_STATUS_LABELS, PROJECT_LABEL_LABELS, PROJECT_STATUS_COLORS } from '@/lib/types/project';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleArchive?: (id: string) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onToggleArchive,
}: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleEdit = () => {
    onEdit?.(project);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete?.(project.id);
    setIsMenuOpen(false);
  };

  const handleDuplicate = () => {
    onDuplicate?.(project.id);
    setIsMenuOpen(false);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite?.(project.id);
    setIsMenuOpen(false);
  };

  const handleToggleArchive = () => {
    onToggleArchive?.(project.id);
    setIsMenuOpen(false);
  };

  const statusColor = PROJECT_STATUS_COLORS[project.status];
  const daysAgo = Math.floor((Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = project.deadline && new Date(project.deadline) < new Date();

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      project.isFavorite && "ring-2 ring-yellow-200 dark:ring-yellow-800",
      project.isArchived && "opacity-75"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {project.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
              <span className="truncate">{project.name}</span>
            </CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <CardAction>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleFavorite}>
                  {project.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  {project.isArchived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
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

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : 'var(--muted)',
                  color: tag.color || 'var(--muted-foreground)',
                  border: `1px solid ${tag.color ? `${tag.color}40` : 'var(--border)'}`
                }}
              >
                {tag.name}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{project.wordCount.toLocaleString()}</span>
                <span className="text-muted-foreground">words</span>
              </div>
            </div>
          </div>

          {project.targetWordCount && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>Progress</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round((project.wordCount / project.targetWordCount) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min((project.wordCount / project.targetWordCount) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {project.deadline && (
            <div className={cn(
              "flex items-center gap-1 text-sm",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              <Calendar className="h-3 w-3" />
              <span>
                Due {new Date(project.deadline).toLocaleDateString()}
                {isOverdue && " (Overdue)"}
              </span>
            </div>
          )}

          {project.genre && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Genre:</span> {project.genre}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}