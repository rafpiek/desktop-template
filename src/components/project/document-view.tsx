import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { uuidv7 } from 'uuidv7';

const mockChapters = [
  { id: uuidv7(), title: 'Chapter 1: The Beginning', documents: [
    { id: uuidv7(), title: 'Opening Scene', wordCount: 1200, isCompleted: true },
    { id: uuidv7(), title: 'Character Introduction', wordCount: 800, isCompleted: true },
    { id: uuidv7(), title: 'World Building', wordCount: 500, isCompleted: true },
  ]},
  { id: uuidv7(), title: 'Chapter 2: Rising Action', documents: [
    { id: uuidv7(), title: 'Conflict Introduction', wordCount: 1500, isCompleted: true },
    { id: uuidv7(), title: 'Character Development', wordCount: 1100, isCompleted: true },
    { id: uuidv7(), title: 'Plot Advancement', wordCount: 600, isCompleted: true },
  ]},
  { id: uuidv7(), title: 'Chapter 3: The Discovery', documents: [
    { id: uuidv7(), title: 'The Revelation', wordCount: 1800, isCompleted: true },
    { id: uuidv7(), title: 'Consequences', wordCount: 1000, isCompleted: false },
    { id: uuidv7(), title: 'New Questions', wordCount: 0, isCompleted: false },
  ]},
];

const mockDrafts = [
  { id: uuidv7(), title: 'Character Backstory Ideas', wordCount: 350, isCompleted: false },
  { id: uuidv7(), title: 'Plot Twist Notes', wordCount: 180, isCompleted: false },
  { id: uuidv7(), title: 'Dialogue Experiments', wordCount: 520, isCompleted: false },
];

export function DocumentView() {
  const { chapterId, documentId, draftId } = useParams<{
    chapterId?: string;
    documentId?: string;
    draftId?: string;
  }>();

  if (draftId) {
    const draft = mockDrafts.find(d => d.id === draftId);
    if (!draft) return <div>Draft not found</div>;

    return (
      <div className="mb-8">
        <DocumentHeader title={draft.title} subtitle={`Draft document • ${draft.wordCount} words`} />
        <div className="mt-8 p-6 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Document editor would go here...</p>
        </div>
      </div>
    );
  }

  if (chapterId && documentId) {
    const chapter = mockChapters.find(c => c.id === chapterId);
    const document = chapter?.documents.find(d => d.id === documentId);
    
    if (!document || !chapter) return <div>Document not found</div>;

    return (
      <div className="mb-8">
        <DocumentHeader title={document.title} subtitle={`Document from ${chapter.title} • ${document.wordCount} words`} />
        <div className="mt-8 p-6 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Document editor would go here...</p>
        </div>
      </div>
    );
  }

  return <div>No document selected</div>;
}

function DocumentHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const [tags, setTags] = useState<string[]>(['scene', 'dialogue']);
  const [newTag, setNewTag] = useState('');
  const [status, setStatus] = useState('draft');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">Status:</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Tags:</label>
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-32 h-8"
            />
            <button
              onClick={addTag}
              className="p-1 hover:bg-accent rounded-md"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}