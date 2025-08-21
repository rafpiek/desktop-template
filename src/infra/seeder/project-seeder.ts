import { v7 as uuidv7 } from 'uuid';
import type {
  Project,
  Document,
  Chapter,
  ProjectStatus,
  ProjectTag
} from '@/lib/types/project';
import { createEmptyProject, createEmptyDocument, createEmptyChapter } from '@/lib/types/project';
import type { SeededData, SeededProjectConfig } from './types';
import { getGenreTemplate, generateChapterContent, generateDraftDocument } from './content-generator';

/**
 * Main project seeder - creates all 5 demo projects with realistic content
 */
export async function seedProjects(): Promise<SeededData> {
  console.log('📚 Generating demo projects...');

  const projects: Project[] = [];
  const chapters: Chapter[] = [];
  const documents: Document[] = [];
  const allTags: ProjectTag[] = [];

  // Define our 5 demo projects based on user requirements
  const projectConfigs = getProjectConfigurations();

  for (const config of projectConfigs) {
    console.log(`   Creating ${config.name}...`);

    const { project, projectChapters, projectDocuments } = await createProject(config);

    projects.push(project);
    chapters.push(...projectChapters);
    documents.push(...projectDocuments);

    // Collect unique tags
    config.tags.forEach(tag => {
      if (!allTags.find(t => t.id === tag.id)) {
        allTags.push(tag);
      }
    });
  }

  console.log(`✅ Generated ${projects.length} projects with ${chapters.length} chapters and ${documents.length} documents`);

  return {
    projects,
    chapters,
    documents,
    tags: allTags,
    goals: { goals: [], progress: [], settings: {} as any, historicalActivity: [] }
  };
}

/**
 * Project configurations based on user requirements
 */
function getProjectConfigurations(): SeededProjectConfig[] {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const threeWeeksFromNow = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  return [
    // 1. Completed Literary Fiction (~50k words)
    {
      name: 'The Last Echo',
      description: 'A contemplative novel about memory, loss, and the stories we tell ourselves to make sense of the past.',
      status: 'completed' as ProjectStatus,
      label: 'novel' as const,
      genre: 'literary',
      tags: getGenreTemplate('literary').tags,
      targetWordCount: 50000,
      deadline: oneWeekAgo.toISOString(), // Successfully met past deadline
      chapters: generateChapterConfigs('literary', 12, true, 4200), // ~50k words total
      drafts: generateDraftConfigs('literary', 3, [800, 300, 500]),
      totalWords: 50000
    },

    // 2. Completed Mystery/Thriller (~50k words)
    {
      name: 'Shadows of Blackmoor',
      description: 'A gripping mystery set in a small English village where ancient secrets refuse to stay buried.',
      status: 'completed' as ProjectStatus,
      label: 'novel' as const,
      genre: 'mystery',
      tags: getGenreTemplate('mystery').tags,
      targetWordCount: 48000,
      deadline: twoMonthsAgo.toISOString(), // Successfully met past deadline
      chapters: generateChapterConfigs('mystery', 15, true, 3200), // ~48k words total
      drafts: generateDraftConfigs('mystery', 4, [600, 150, 900, 400]),
      totalWords: 48000
    },

    // 3. In-progress Fantasy (~10k words, deadline in 3 weeks)
    {
      name: 'The Quantum Garden',
      description: 'A young woman discovers she can manipulate reality through quantum magic, but every change comes with a price.',
      status: 'in-progress' as ProjectStatus,
      label: 'novel' as const,
      genre: 'fantasy',
      tags: getGenreTemplate('fantasy').tags,
      targetWordCount: 75000,
      deadline: threeWeeksFromNow.toISOString(),
      chapters: generateChapterConfigs('fantasy', 12, false, 800), // ~10k words, partially completed
      drafts: generateDraftConfigs('fantasy', 3, [400, 250, 600]),
      totalWords: 10000
    },

    // 4. Draft project (~3k words)
    {
      name: 'Growing Up on Maple Street',
      description: 'A memoir about childhood, family, and the small moments that shape who we become.',
      status: 'draft' as ProjectStatus,
      label: 'essay' as const,
      genre: 'memoir',
      tags: getGenreTemplate('memoir').tags,
      targetWordCount: 35000,
      deadline: undefined, // No deadline set
      chapters: generateChapterConfigs('memoir', 10, false, 300, 3), // Only first 3 chapters started
      drafts: generateDraftConfigs('memoir', 3, [800, 200, 400]),
      totalWords: 3000
    },

    // 5. Draft project (~500 words, overdue)
    {
      name: 'Summer at Ridgemont High',
      description: 'A teenage romance about first love, friendship, and finding yourself during the most important summer of your life.',
      status: 'draft' as ProjectStatus,
      label: 'novel' as const,
      genre: 'romance',
      tags: getGenreTemplate('romance').tags,
      targetWordCount: 60000,
      deadline: oneMonthAgo.toISOString(), // Overdue deadline to show reality
      chapters: generateChapterConfigs('romance', 14, false, 35, 1), // Just one tiny chapter started
      drafts: generateDraftConfigs('romance', 3, [200, 150, 100]),
      totalWords: 500
    }
  ];
}

/**
 * Generate chapter configurations for a project
 */
function generateChapterConfigs(
  genre: string,
  totalChapters: number,
  isCompleted: boolean,
  baseWordCount: number,
  completedChapters?: number
): any[] {
  const template = getGenreTemplate(genre);
  const chapters: any[] = [];
  const actualCompletedChapters = completedChapters || (isCompleted ? totalChapters : Math.floor(totalChapters * 0.3));

  for (let i = 0; i < totalChapters; i++) {
    const chapterCompleted = i < actualCompletedChapters;
    const wordCount = chapterCompleted
      ? baseWordCount + Math.floor(Math.random() * 1000) - 500 // Variation in completed chapters
      : (i < actualCompletedChapters + 2 ? Math.floor(baseWordCount * 0.3) : 0); // Partial content in next 2 chapters

    chapters.push({
      title: template.chapterTitles[i % template.chapterTitles.length],
      description: chapterCompleted ? `Chapter ${i + 1} - ${template.themes[i % template.themes.length]}` : undefined,
      order: i + 1,
      isCompleted: chapterCompleted,
      documents: wordCount > 0 ? [{
        title: template.chapterTitles[i % template.chapterTitles.length],
        content: null, // Will be generated later
        wordCount,
        status: chapterCompleted ? 'complete' : 'draft',
        tags: template.tags,
        isCompleted: chapterCompleted,
        isForDraft: false
      }] : [],
      wordCount
    });
  }

  return chapters;
}

/**
 * Generate draft document configurations
 */
function generateDraftConfigs(genre: string, count: number, wordCounts: number[]): any[] {
  const template = getGenreTemplate(genre);
  const drafts: any[] = [];

  for (let i = 0; i < count && i < wordCounts.length; i++) {
    const wordCount = wordCounts[i];
    const draftTitle = i < template.draftIdeas.length
      ? template.draftIdeas[i].split(' ').slice(0, 4).join(' ') + '...'
      : `Draft Idea ${i + 1}`;

    drafts.push({
      title: draftTitle,
      content: null, // Will be generated later
      wordCount,
      status: 'draft' as const,
      tags: template.tags.slice(0, 1),
      isCompleted: false,
      isForDraft: true
    });
  }

  return drafts;
}

/**
 * Create a complete project with all its chapters and documents
 */
async function createProject(config: SeededProjectConfig): Promise<{
  project: Project;
  projectChapters: Chapter[];
  projectDocuments: Document[];
}> {
  const now = new Date().toISOString();
  const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(); // Random time in last 60 days

  // Create base project
  const project = createEmptyProject({
    name: config.name,
    description: config.description,
    label: config.label,
    status: config.status,
    tags: config.tags,
    targetWordCount: config.targetWordCount,
    deadline: config.deadline,
    genre: config.genre,
  });

  // Update project timestamps and word count
  project.createdAt = createdAt;
  project.updatedAt = now;
  project.wordCount = config.totalWords;

  const projectChapters: Chapter[] = [];
  const projectDocuments: Document[] = [];

  // Create chapters and their documents
  for (const chapterConfig of config.chapters) {
    const chapter = createEmptyChapter({
      title: chapterConfig.title,
      description: chapterConfig.description,
      projectId: project.id,
      order: chapterConfig.order,
    });

    chapter.isCompleted = chapterConfig.isCompleted;
    chapter.wordCount = chapterConfig.wordCount;
    chapter.createdAt = createdAt;
    chapter.updatedAt = now;

    // Create documents for this chapter
    for (const docConfig of chapterConfig.documents) {
      const document = await createDocumentFromConfig(docConfig, project.id, chapter.id, config.genre, createdAt);
      projectDocuments.push(document);
      chapter.documentIds.push(document.id);
    }

    projectChapters.push(chapter);
    project.chapterIds.push(chapter.id);
  }

  // Create draft documents
  for (const draftConfig of config.drafts) {
    const document = await createDocumentFromConfig(draftConfig, project.id, undefined, config.genre, createdAt);
    projectDocuments.push(document);
  }

  return {
    project,
    projectChapters,
    projectDocuments
  };
}

/**
 * Create a document from configuration
 */
async function createDocumentFromConfig(
  docConfig: any,
  projectId: string,
  chapterId: string | undefined,
  genre: string,
  createdAt: string
): Promise<Document> {
  const now = new Date().toISOString();

  // Generate content based on whether it's a draft or chapter document
  let content;
  if (docConfig.isForDraft) {
    content = generateDraftDocument(genre, docConfig.title, docConfig.wordCount);
  } else {
    content = generateChapterContent(genre, docConfig.title, docConfig.wordCount, docConfig.isCompleted);
  }

  console.log('Creating document:', docConfig.title);
  console.log('Generated content:', content.content);

  const document = createEmptyDocument({
    title: docConfig.title,
    content: content.content,
    status: docConfig.status,
    tags: docConfig.tags,
    projectId,
    chapterId,
  });

  document.wordCount = content.wordCount;
  document.isCompleted = docConfig.isCompleted;
  document.createdAt = createdAt;
  document.updatedAt = now;

  console.log('Final document ready for saving:', {
    id: document.id,
    title: document.title,
    wordCount: document.wordCount,
    content: document.content,
  });

  return document;
}
