import { v7 as uuidv7 } from 'uuid';
import type { Project, Document, Chapter } from '@/lib/types/project';
import { createEmptyProject, createEmptyDocument, createEmptyChapter } from '@/lib/types/project';

export function simpleTestSeed() {
  console.log('🧪 Running simple test seed...');
  
  const now = new Date().toISOString();
  
  // Create a simple project
  const project = createEmptyProject({
    name: 'TEST PROJECT',
    description: 'Testing if content saves',
    label: 'novel',
    status: 'draft',
    tags: [],
  });
  
  // Create a simple chapter
  const chapter = createEmptyChapter({
    title: 'TEST CHAPTER',
    projectId: project.id,
    order: 1,
  });
  
  // Create a simple document with explicit TipTap content
  const document: Document = {
    id: uuidv7(),
    title: 'TEST DOCUMENT',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is test content. If you can see this, the seeder is working correctly. Lorem ipsum dolor sit amet.'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Second paragraph with more content to verify everything is saving properly.'
            }
          ]
        }
      ]
    },
    wordCount: 25,
    status: 'draft',
    tags: [],
    createdAt: now,
    updatedAt: now,
    projectId: project.id,
    chapterId: chapter.id,
    isCompleted: false,
  };
  
  chapter.documentIds = [document.id];
  project.chapterIds = [chapter.id];
  
  console.log('Test document content:', document.content);
  
  // Save to localStorage
  localStorage.setItem('zeyn-projects', JSON.stringify([project]));
  localStorage.setItem('zeyn-chapters', JSON.stringify([chapter]));
  localStorage.setItem('zeyn-documents', JSON.stringify([document]));
  localStorage.setItem('zeyn-tags', JSON.stringify([]));
  
  console.log('✅ Simple test seed complete');
  console.log('Document saved to localStorage:', document);
  
  // Verify what was saved
  const savedDocs = localStorage.getItem('zeyn-documents');
  console.log('Verification - saved documents:', savedDocs);
  
  return { project, chapter, document };
}