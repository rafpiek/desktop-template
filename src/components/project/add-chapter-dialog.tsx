import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddChapterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function AddChapterDialog({ isOpen, onClose, onSubmit }: AddChapterDialogProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Chapter</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Chapter Title"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Chapter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}