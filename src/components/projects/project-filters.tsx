import { useState } from 'react';
import { Search, Filter, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type {
  ProjectFilters as Filters,
  ProjectSort,
  ProjectStatus,
  ProjectLabel,
} from '@/lib/types/project';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_LABEL_LABELS,
  DEFAULT_PROJECT_TAGS,
} from '@/lib/types/project';

interface ProjectFiltersProps {
  filters: Filters;
  sort: ProjectSort;
  onFiltersChange: (filters: Filters) => void;
  onSortChange: (sort: ProjectSort) => void;
  className?: string;
}

export function ProjectFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  className,
}: ProjectFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: value || undefined,
    });
  };

  const handleStatusToggle = (status: ProjectStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleLabelToggle = (label: ProjectLabel) => {
    const currentLabels = filters.label || [];
    const newLabels = currentLabels.includes(label)
      ? currentLabels.filter(l => l !== label)
      : [...currentLabels, label];
    
    onFiltersChange({
      ...filters,
      label: newLabels.length > 0 ? newLabels : undefined,
    });
  };

  const handleTagToggle = (tagId: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId];
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  const handleFavoriteToggle = () => {
    onFiltersChange({
      ...filters,
      isFavorite: filters.isFavorite ? undefined : true,
    });
  };

  const handleArchivedToggle = () => {
    onFiltersChange({
      ...filters,
      isArchived: filters.isArchived ? undefined : true,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.status?.length ||
    filters.label?.length ||
    filters.tags?.length ||
    filters.isFavorite ||
    filters.isArchived ||
    filters.searchQuery
  );

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={filters.searchQuery || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={filters.isFavorite ? "default" : "outline"}
          size="sm"
          onClick={handleFavoriteToggle}
          className="gap-2"
        >
          <Star className={cn(
            "h-4 w-4",
            filters.isFavorite && "fill-current"
          )} />
          Favorites
        </Button>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-background text-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {(filters.status?.length || 0) + 
                   (filters.label?.length || 0) + 
                   (filters.tags?.length || 0) +
                   (filters.isFavorite ? 1 : 0) +
                   (filters.isArchived ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2 text-muted-foreground">STATUS</h5>
                <div className="space-y-2">
                  {Object.entries(PROJECT_STATUS_LABELS).map(([status, label]) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status?.includes(status as ProjectStatus) || false}
                        onCheckedChange={() => handleStatusToggle(status as ProjectStatus)}
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2 text-muted-foreground">PROJECT TYPE</h5>
                <div className="space-y-2">
                  {Object.entries(PROJECT_LABEL_LABELS).map(([label, labelText]) => (
                    <div key={label} className="flex items-center space-x-2">
                      <Checkbox
                        id={`label-${label}`}
                        checked={filters.label?.includes(label as ProjectLabel) || false}
                        onCheckedChange={() => handleLabelToggle(label as ProjectLabel)}
                      />
                      <label
                        htmlFor={`label-${label}`}
                        className="text-sm cursor-pointer"
                      >
                        {labelText}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2 text-muted-foreground">TAGS</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {DEFAULT_PROJECT_TAGS.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={filters.tags?.includes(tag.id) || false}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium mb-2 text-muted-foreground">OTHER</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="archived"
                      checked={filters.isArchived || false}
                      onCheckedChange={handleArchivedToggle}
                    />
                    <label htmlFor="archived" className="text-sm cursor-pointer">
                      Show Archived
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <select
          value={`${sort.by}-${sort.order}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-');
            onSortChange({ by: by as any, order: order as 'asc' | 'desc' });
          }}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="updatedAt-desc">Recently Updated</option>
          <option value="createdAt-desc">Recently Created</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="wordCount-desc">Highest Word Count</option>
          <option value="wordCount-asc">Lowest Word Count</option>
          <option value="deadline-asc">Deadline (Soon)</option>
          <option value="status-asc">Status</option>
        </select>
      </div>
    </div>
  );
}