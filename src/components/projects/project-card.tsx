import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Star, Archive, Copy, Trash2, Clock, Target, Calendar, ArrowUpRight, BookOpen, TrendingUp } from 'lucide-react';
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
  isLastUsed?: boolean;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onToggleArchive,
  isLastUsed = false,
}: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
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
      "group relative transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/30 h-full",
      project.isFavorite && "ring-2 ring-yellow-400/30 shadow-lg shadow-yellow-400/10 border-yellow-400/30",
      isLastUsed && "ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-400/15 border-emerald-400/40 bg-gradient-to-br from-emerald-950/20 to-card/50",
      project.isArchived && "opacity-60 hover:opacity-80",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-transparent before:to-primary/5 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
    )}>      
      {/* Shimmer effect - matches home page cards */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 overflow-hidden rounded-lg"></div>
      
      {/* Floating Last Used Label */}
      {isLastUsed && (
        <div className="absolute -top-3 -left-3 z-20">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/50">
            ✨ you wrote last words here
          </span>
        </div>
      )}
      <CardHeader className="relative z-10 pb-3">
        {/* Header with Title and Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {project.isFavorite && (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              )}
              <CardTitle className="text-lg font-semibold truncate group-hover:text-foreground transition-colors duration-200">
                {project.name}
              </CardTitle>
            </div>
            {project.description && (
              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-1 mb-2">
                {project.description}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <CardAction>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-primary/10"
                onClick={() => navigate(`/projects/${project.id}`)}
                title="Open Project"
              >
                <ArrowUpRight className="h-3 w-3" />
              </Button>
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
            </div>
          </CardAction>
        </div>
        
        {/* Status and Type Badges */}
        <div className="flex items-center gap-1.5 mb-3">
          <span 
            className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
            style={{ 
              backgroundColor: `${statusColor}15`, 
              color: statusColor,
              border: `1px solid ${statusColor}30`
            }}
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
          <span className="inline-flex items-center rounded bg-muted/50 px-2 py-0.5 text-xs font-medium">
            {PROJECT_LABEL_LABELS[project.label]}
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        {/* Key Metrics - Compact */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span className="text-xs">Words</span>
            </div>
            <div className="text-xl font-bold">{project.wordCount.toLocaleString()}</div>
          </div>
          
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Updated</span>
            </div>
            <div className="text-xs font-medium">
              {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
            </div>
          </div>
        </div>

        {/* Progress Bar - Only if has target */}
        {project.targetWordCount && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">Progress</span>
              </div>
              <span className="text-xs font-bold">
                {Math.round((project.wordCount / project.targetWordCount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min((project.wordCount / project.targetWordCount) * 100, 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom info - Only show if exists */}
        <div className="space-y-2 text-xs text-muted-foreground border-t pt-3">
          {project.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue ? "text-destructive" : ""}>
                Due {new Date(project.deadline).toLocaleDateString()}
                {isOverdue && " (Overdue)"}
              </span>
            </div>
          )}
          {project.genre && (
            <div>Genre: {project.genre}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}