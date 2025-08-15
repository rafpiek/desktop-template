import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  wordCount: number;
  onConfirm: () => void;
}

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  documentTitle,
  wordCount,
  onConfirm,
}: DeleteDocumentDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const displayTitle = documentTitle || 'Untitled Document';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Document
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{displayTitle}"?
            {wordCount > 0 && (
              <span className="block mt-2">
                This document contains {wordCount.toLocaleString()} word{wordCount !== 1 ? 's' : ''}.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Warning</span>
          </div>
          <p className="text-sm text-destructive mt-1">
            All content from this document will be lost permanently. This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}