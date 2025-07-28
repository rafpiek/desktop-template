import { useEffect } from 'react';
import { useProjectData } from './use-project-data';
import type { CreateProjectInput, CreateChapterInput, CreateDocumentInput } from '@/lib/types/project';

const MOCK_DATA_LOADED_KEY = 'zeyn-mock-data-loaded';

// Hardcoded project ID to prevent duplicates
const MOCK_PROJECT_ID = '019424ec-a96a-7000-8000-000000000001';

export function useMockDataLoader() {
  const { projects, createDocumentWithUpdates, chapters } = useProjectData();

  useEffect(() => {
    // Check if we've already loaded mock data
    if (localStorage.getItem(MOCK_DATA_LOADED_KEY)) {
      return;
    }

    // Check if mock project already exists
    const mockProjectExists = projects.projects.find(p => p.id === MOCK_PROJECT_ID);
    
    if (mockProjectExists) {
      localStorage.setItem(MOCK_DATA_LOADED_KEY, 'true');
      return;
    }

    console.log('Loading mock data - creating single mock project');

    // Clear localStorage first to prevent duplicates
    localStorage.removeItem('zeyn-projects');
    localStorage.removeItem('zeyn-chapters');
    localStorage.removeItem('zeyn-documents');

    // Create a sample project with hardcoded ID
    const sampleProject = projects.createProject({
      name: 'My Novel Project',
      description: 'A sample writing project with chapters and drafts',
      label: 'novel',
      status: 'in-progress',
      genre: 'Fantasy',
    });

    // Update the project with our hardcoded ID
    projects.updateProject({
      id: sampleProject.id,
      ...sampleProject,
      id: MOCK_PROJECT_ID,
    });

    // Create chapters for the project
    const chapter1 = chapters.createChapter({
      title: 'Chapter 1: The Beginning',
      description: 'Opening chapter of the story',
      projectId: MOCK_PROJECT_ID,
      order: 1,
    });

    const chapter2 = chapters.createChapter({
      title: 'Chapter 2: Rising Action',
      description: 'Building tension and character development',
      projectId: MOCK_PROJECT_ID,
      order: 2,
    });

    const chapter3 = chapters.createChapter({
      title: 'Chapter 3: The Discovery',
      description: 'Key revelations and plot advancement',
      projectId: MOCK_PROJECT_ID,
      order: 3,
    });

    const chapter4 = chapters.createChapter({
      title: 'Chapter 4: Complications',
      description: 'New challenges arise',
      projectId: MOCK_PROJECT_ID,
      order: 4,
    });

    const chapter5 = chapters.createChapter({
      title: 'Chapter 5: Climax',
      description: 'The final confrontation',
      projectId: MOCK_PROJECT_ID,
      order: 5,
    });

    const chapter6 = chapters.createChapter({
      title: 'Chapter 6: Resolution',
      description: 'Tying up loose ends',
      projectId: MOCK_PROJECT_ID,
      order: 6,
    });

    // Create documents for chapters
    const chapter1Docs = [
      { title: 'Opening Scene', content: [{ type: 'p', children: [{ text: 'The story begins on a dark and stormy night...' }] }] },
      { title: 'Character Introduction', content: [{ type: 'p', children: [{ text: 'Meet our protagonist, a young writer with big dreams...' }] }] },
      { title: 'World Building', content: [{ type: 'p', children: [{ text: 'The setting is a small town where mysterious things happen...' }] }] },
    ];

    const chapter2Docs = [
      { title: 'Conflict Introduction', content: [{ type: 'p', children: [{ text: 'Suddenly, everything changes when...' }] }] },
      { title: 'Character Development', content: [{ type: 'p', children: [{ text: 'Our hero must face their deepest fears...' }] }] },
      { title: 'Plot Advancement', content: [{ type: 'p', children: [{ text: 'The stakes are raised as new challenges emerge...' }] }] },
    ];

    const chapter3Docs = [
      { title: 'The Revelation', content: [{ type: 'p', children: [{ text: 'The truth is finally revealed when...' }] }] },
      { title: 'Consequences', content: [{ type: 'p', children: [{ text: 'But this discovery comes at a great cost...' }] }] },
      { title: 'New Questions', content: [{ type: 'p', children: [{ text: 'Just when everything seemed clear, new mysteries arise...' }] }] },
    ];

    // Create chapter documents
    chapter1Docs.forEach(doc => {
      createDocumentWithUpdates({
        title: doc.title,
        content: doc.content,
        projectId: MOCK_PROJECT_ID,
        chapterId: chapter1.id,
        status: 'complete',
      });
    });

    chapter2Docs.forEach(doc => {
      createDocumentWithUpdates({
        title: doc.title,
        content: doc.content,
        projectId: MOCK_PROJECT_ID,
        chapterId: chapter2.id,
        status: 'complete',
      });
    });

    chapter3Docs.forEach((doc, index) => {
      createDocumentWithUpdates({
        title: doc.title,
        content: doc.content,
        projectId: MOCK_PROJECT_ID,
        chapterId: chapter3.id,
        status: index === 0 ? 'complete' : 'draft',
      });
    });

    // Create documents for additional chapters (empty for now)
    const chapter4Docs = [
      { title: 'Rising Tension', content: [{ type: 'p', children: [{ text: '' }] }] },
      { title: 'Character Challenges', content: [{ type: 'p', children: [{ text: '' }] }] },
    ];

    const chapter5Docs = [
      { title: 'The Confrontation', content: [{ type: 'p', children: [{ text: '' }] }] },
      { title: 'Final Battle', content: [{ type: 'p', children: [{ text: '' }] }] },
    ];

    const chapter6Docs = [
      { title: 'Aftermath', content: [{ type: 'p', children: [{ text: '' }] }] },
      { title: 'New Beginning', content: [{ type: 'p', children: [{ text: '' }] }] },
    ];

    chapter4Docs.forEach(doc => {
      createDocumentWithUpdates({
        title: doc.title,
        content: doc.content,
        projectId: MOCK_PROJECT_ID,
        chapterId: chapter4.id,
        status: 'draft',
      });
    });

    chapter5Docs.forEach(doc => {
      createDocumentWithUpdates({
        title: doc.title,
        content: doc.content,
        projectId: MOCK_PROJECT_ID,
        chapterId: chapter5.id,
        status: 'draft',
      });
    });

    chapter6Docs.forEach(doc => {
      createDocumentWithUpdates({
        title: doc.title,
        content: doc.content,
        projectId: MOCK_PROJECT_ID,
        chapterId: chapter6.id,
        status: 'draft',
      });
    });

    // Create draft documents (no chapter)
    const draftDocs = [
      { title: 'Character Backstory Ideas', content: [{ type: 'p', children: [{ text: 'Ideas for character development and background stories...' }] }] },
      { title: 'Plot Twist Notes', content: [{ type: 'p', children: [{ text: 'Potential plot twists and surprise elements...' }] }] },
      { title: 'Dialogue Experiments', content: [{ type: 'p', children: [{ text: 'Testing different dialogue styles and character voices...' }] }] },
    ];

    draftDocs.forEach(doc => {
      createDocumentWithUpdates({
        title: doc.title,
        content: doc.content,
        projectId: MOCK_PROJECT_ID,
        // No chapterId means it's a draft
        status: 'draft',
      });
    });

    // Mark that we've loaded the mock data
    localStorage.setItem(MOCK_DATA_LOADED_KEY, 'true');
  }, [projects, chapters, createDocumentWithUpdates]);
}