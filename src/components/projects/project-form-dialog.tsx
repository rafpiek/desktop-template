import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStatus,
  ProjectLabel,
  ProjectTag,
} from '@/lib/types/project';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_LABEL_LABELS,
  DEFAULT_PROJECT_TAGS,
} from '@/lib/types/project';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
}: ProjectFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    label: 'novel' as ProjectLabel,
    status: 'draft' as ProjectStatus,
    tags: [] as ProjectTag[],
    targetWordCount: '',
    deadline: '',
    genre: '',
    notes: '',
  });

  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [customTagInput, setCustomTagInput] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        label: project.label,
        status: project.status,
        tags: project.tags,
        targetWordCount: project.targetWordCount?.toString() || '',
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        genre: project.genre || '',
        notes: project.notes || '',
      });
      setSelectedTags(new Set(project.tags.map(tag => tag.id)));
    } else {
      setFormData({
        name: '',
        description: '',
        label: 'novel',
        status: 'draft',
        tags: [],
        targetWordCount: '',
        deadline: '',
        genre: '',
        notes: '',
      });
      setSelectedTags(new Set());
    }
    setCustomTagInput('');
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedTagObjects = Array.from(selectedTags).map(tagId => {
      const existingTag = DEFAULT_PROJECT_TAGS.find(tag => tag.id === tagId);
      if (existingTag) return existingTag;
      
      const projectTag = formData.tags.find(tag => tag.id === tagId);
      return projectTag!;
    });

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      label: formData.label,
      status: formData.status,
      tags: selectedTagObjects,
      targetWordCount: formData.targetWordCount ? parseInt(formData.targetWordCount) : undefined,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      genre: formData.genre || undefined,
      notes: formData.notes || undefined,
    };

    if (project) {
      onSubmit({ id: project.id, ...data } as UpdateProjectInput);
    } else {
      onSubmit(data as CreateProjectInput);
    }

    onOpenChange(false);
  };

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(tagId)) {
      newSelectedTags.delete(tagId);
    } else {
      newSelectedTags.add(tagId);
    }
    setSelectedTags(newSelectedTags);
  };

  const handleAddCustomTag = () => {
    if (customTagInput.trim()) {
      const customTag: ProjectTag = {
        id: customTagInput.toLowerCase().replace(/\s+/g, '-'),
        name: customTagInput.trim(),
        color: '#6b7280',
      };
      
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag]
      }));
      
      setSelectedTags(prev => new Set([...prev, customTag.id]));
      setCustomTagInput('');
    }
  };

  const allAvailableTags = [...DEFAULT_PROJECT_TAGS, ...formData.tags];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project 
              ? 'Update your project details below.'
              : 'Fill out the details for your new writing project.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your project..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Type *
                </label>
                <select
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value as ProjectLabel }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  {Object.entries(PROJECT_LABEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {allAvailableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        selectedTags.has(tag.id)
                          ? "border-2"
                          : "border border-input hover:bg-accent"
                      )}
                      style={{
                        backgroundColor: selectedTags.has(tag.id) 
                          ? `${tag.color}20` 
                          : 'transparent',
                        color: selectedTags.has(tag.id) 
                          ? tag.color 
                          : 'var(--foreground)',
                        borderColor: selectedTags.has(tag.id) 
                          ? tag.color 
                          : 'var(--border)'
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Add custom tag..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomTag}
                    size="sm"
                    variant="outline"
                    disabled={!customTagInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Word Count
                </label>
                <Input
                  type="number"
                  value={formData.targetWordCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetWordCount: e.target.value }))}
                  placeholder="e.g., 80000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Deadline
                </label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Genre
              </label>
              <Input
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                placeholder="e.g., Science Fiction, Romance, Mystery..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about your project..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}