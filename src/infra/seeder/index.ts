import { seedProjects } from './project-seeder';
import { seedHistoricalStats } from './stats-seeder';
import type { SeededData } from './types';
import { testLorem } from './test-lorem';
import { simpleTestSeed } from './simple-test-seeder';
import { saveDocumentContent } from '@/components/editor/v2/storage/document-storage';

/**
 * Main seeder function that clears localStorage and seeds demo data
 * This creates a comprehensive demo dataset showcasing all app features
 */
export async function seedDemoData(): Promise<void> {
  console.log('🌱 Starting demo data seeding...');

  try {
    // Test lorem generator first
    console.log('🧪 Testing lorem generator...');
    const testResults = testLorem();
    console.log('Lorem test results:', testResults);

    // Step 1: Clear all existing data
    clearAllData();
    console.log('✅ Cleared existing data');

    // Step 2: Generate base project data
    console.log('📚 Generating projects, chapters, and documents...');
    const projectData = await seedProjects();

    // Step 3: Store project data in localStorage
    console.log('Documents to store:', projectData.documents.length);

    localStorage.setItem('zeyn-projects', JSON.stringify(projectData.projects));
    localStorage.setItem('zeyn-chapters', JSON.stringify(projectData.chapters));
    localStorage.setItem('zeyn-tags', JSON.stringify(projectData.tags));

    // Create a metadata-only version of the documents array
    const documentsMetadata = projectData.documents.map(({ content, ...doc }) => doc);
    localStorage.setItem('zeyn-documents', JSON.stringify(documentsMetadata));
    console.log('✅ Stored document metadata array.');

    // Save each document's content individually for the editor
    console.log('💾 Saving each document content to its individual storage key...');
    for (const doc of projectData.documents) {
      if (doc.content) {
        saveDocumentContent(doc.id, doc.content);
      }
    }
    console.log('✅ Stored all document content individually.');

    // Step 4: Generate and store historical writing stats
    console.log('📊 Generating historical writing statistics...');
    const statsData = await seedHistoricalStats(projectData);

    // Store goals and progress data
    localStorage.setItem('zeyn-writing-goals', JSON.stringify(statsData.goals));
    localStorage.setItem('zeyn-goal-progress', JSON.stringify(statsData.progress));
    localStorage.setItem('zeyn-goal-settings', JSON.stringify(statsData.settings));
    console.log('✅ Stored statistics data');

    // Step 5: Set sidebar state (expanded by default for demo)
    localStorage.setItem('zeyn-sidebar-collapsed', 'false');

    console.log('🎉 Demo data seeding completed successfully!');
    console.log('📋 Seeded data summary:');
    console.log(`   • ${projectData.projects.length} projects`);
    console.log(`   • ${projectData.chapters.length} chapters`);
    console.log(`   • ${projectData.documents.length} documents`);
    console.log(`   • ${projectData.tags.length} tags`);
    console.log(`   • ${statsData.historicalActivity.length} days of historical activity`);
    console.log(`   • ${statsData.goals.length} writing goals`);
    console.log(`   • ${statsData.progress.length} progress entries`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

/**
 * Clear all localStorage data related to the app
 */
function clearAllData(): void {
  const keysToRemove = [
    'zeyn-projects',
    'zeyn-chapters',
    'zeyn-documents',
    'zeyn-tags',
    'zeyn-writing-goals',
    'zeyn-goal-progress',
    'zeyn-goal-settings',
    'zeyn-sidebar-collapsed'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Check if demo data has been seeded (useful for conditional logic)
 */
export function isDemoDataSeeded(): boolean {
  const projects = localStorage.getItem('zeyn-projects');
  if (!projects) return false;

  try {
    const parsedProjects = JSON.parse(projects);
    // Check if we have the expected demo projects with specific names
    return parsedProjects.some((p: any) =>
      p.name === 'The Last Echo' ||
      p.name === 'Shadows of Blackmoor' ||
      p.name === 'The Quantum Garden'
    );
  } catch {
    return false;
  }
}

/**
 * Clear only demo data (leaves user data intact if mixed)
 */
export function clearDemoData(): void {
  if (isDemoDataSeeded()) {
    clearAllData();
    console.log('🧹 Demo data cleared');
    window.location.reload();
  }
}
