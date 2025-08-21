import type { 
  Project, 
  Document, 
  Chapter, 
  ProjectStatus,
  ProjectLabel,
  ProjectTag,
  DocumentStatus
} from '@/lib/types/project';
import type { 
  WritingGoal, 
  GoalProgress, 
  GoalSettings,
  GoalPeriod 
} from '@/lib/types/goals';
import type { TiptapValue } from '@/components/editor/v2/tiptap-types';

// Seeded project configuration
export interface SeededProjectConfig {
  name: string;
  description: string;
  status: ProjectStatus;
  label: ProjectLabel;
  genre: string;
  tags: ProjectTag[];
  targetWordCount: number;
  deadline?: string;
  chapters: SeededChapterConfig[];
  drafts: SeededDocumentConfig[];
  totalWords: number;
}

// Seeded chapter configuration
export interface SeededChapterConfig {
  title: string;
  description?: string;
  order: number;
  isCompleted: boolean;
  documents: SeededDocumentConfig[];
  wordCount: number;
}

// Seeded document configuration
export interface SeededDocumentConfig {
  title: string;
  content: TiptapValue;
  wordCount: number;
  status: DocumentStatus;
  tags: ProjectTag[];
  isCompleted: boolean;
  isForDraft?: boolean; // true if this is a draft document
}

// Historical writing activity for realistic stats
export interface SeededWritingActivity {
  date: string; // ISO date string
  wordsWritten: number;
  projects: string[]; // project IDs that were worked on
  documents: string[]; // document IDs that were worked on
  sessionCount: number; // number of writing sessions
}

// Seeded goals and progress
export interface SeededGoalsData {
  goals: WritingGoal[];
  progress: GoalProgress[];
  settings: GoalSettings;
  historicalActivity: SeededWritingActivity[];
}

// Complete seeded dataset
export interface SeededData {
  projects: Project[];
  chapters: Chapter[];
  documents: Document[];
  tags: ProjectTag[];
  goals: SeededGoalsData;
}

// Content generation configuration
export interface ContentGeneratorConfig {
  genre: string;
  style: 'novel' | 'memoir' | 'mystery' | 'fantasy' | 'romance';
  characterNames: string[];
  locations: string[];
  themes: string[];
  plotPoints: string[];
}

// Genre-specific content templates
export interface GenreTemplate {
  name: string;
  label: ProjectLabel;
  genre: string;
  tags: ProjectTag[];
  characterNames: string[];
  locations: string[];
  themes: string[];
  chapterTitles: string[];
  openingLines: string[];
  plotElements: string[];
  draftIdeas: string[];
}

// Writing pattern configuration for realistic historical data
export interface WritingPatternConfig {
  // Base daily word count range
  minDailyWords: number;
  maxDailyWords: number;
  
  // Streak patterns
  streakLengths: number[]; // possible streak lengths
  breakLengths: number[]; // possible break lengths between streaks
  
  // Weekly patterns
  weekendMultiplier: number; // multiplier for weekend productivity
  weekdayVariance: number; // variance in weekday productivity
  
  // Special patterns
  sprintPeriods: number; // number of high-productivity periods
  blockPeriods: number; // number of writer's block periods
  
  // Goal achievement rates
  dailyGoalAchievementRate: number; // percentage of days goal is met
}