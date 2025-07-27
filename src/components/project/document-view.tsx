import { useParams } from 'react-router-dom';

const mockChapters = [
  { id: '1', title: 'Chapter 1: The Beginning', documents: [
    { id: '1-1', title: 'Opening Scene', wordCount: 1200, isCompleted: true },
    { id: '1-2', title: 'Character Introduction', wordCount: 800, isCompleted: true },
    { id: '1-3', title: 'World Building', wordCount: 500, isCompleted: true },
  ]},
  { id: '2', title: 'Chapter 2: Rising Action', documents: [
    { id: '2-1', title: 'Conflict Introduction', wordCount: 1500, isCompleted: true },
    { id: '2-2', title: 'Character Development', wordCount: 1100, isCompleted: true },
    { id: '2-3', title: 'Plot Advancement', wordCount: 600, isCompleted: true },
  ]},
  { id: '3', title: 'Chapter 3: The Discovery', documents: [
    { id: '3-1', title: 'The Revelation', wordCount: 1800, isCompleted: true },
    { id: '3-2', title: 'Consequences', wordCount: 1000, isCompleted: false },
    { id: '3-3', title: 'New Questions', wordCount: 0, isCompleted: false },
  ]},
];

const mockDrafts = [
  { id: 'draft-1', title: 'Character Backstory Ideas', wordCount: 350, isCompleted: false },
  { id: 'draft-2', title: 'Plot Twist Notes', wordCount: 180, isCompleted: false },
  { id: 'draft-3', title: 'Dialogue Experiments', wordCount: 520, isCompleted: false },
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
        <h1 className="text-3xl font-bold mb-2">{draft.title}</h1>
        <p className="text-muted-foreground">
          Draft document • {draft.wordCount} words
        </p>
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
        <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
        <p className="text-muted-foreground">
          Document from {chapter.title} • {document.wordCount} words
        </p>
        <div className="mt-8 p-6 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Document editor would go here...</p>
        </div>
      </div>
    );
  }

  return <div>No document selected</div>;
}