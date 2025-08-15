import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle, FileText } from 'lucide-react';

type DeleteOption = 'delete-all' | 'move-to-drafts';

interface DeleteChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterTitle: string;
  documentCount: number;
  onConfirm: (deleteDocuments: boolean) => void;
}

export function DeleteChapterDialog({
  open,
  onOpenChange,
  chapterTitle,
  documentCount,
  onConfirm,
}: DeleteChapterDialogProps) {
  const [deleteOption, setDeleteOption] = useState<DeleteOption>('delete-all');

  const handleConfirm = () => {
    const deleteDocuments = deleteOption === 'delete-all';
    onConfirm(deleteDocuments);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setDeleteOption('delete-all'); // Reset to default
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Chapter
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the chapter "{chapterTitle}"?
            {documentCount > 0 && (
              <span className="block mt-2">
                This chapter contains {documentCount} document{documentCount !== 1 ? 's' : ''}.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {documentCount > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">What should happen to the documents?</Label>
            <Select value={deleteOption} onValueChange={(value) => setDeleteOption(value as DeleteOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose what to do with documents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete-all">Delete all documents from this chapter</SelectItem>
                <SelectItem value="move-to-drafts">Move all documents to drafts</SelectItem>
              </SelectContent>
            </Select>
            
            {deleteOption === 'delete-all' && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Warning</span>
                </div>
                <p className="text-sm text-destructive mt-1">
                  All your content from this chapter will be lost permanently
                </p>
              </div>
            )}
            
            {deleteOption === 'move-to-drafts' && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Documents will be preserved and moved to the drafts section</span>
                </div>
              </div>
            )}
          </div>
        )}

        {documentCount === 0 && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">This chapter has no documents and will be deleted permanently.</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Chapter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}