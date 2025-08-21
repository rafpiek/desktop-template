// Quick test to verify lorem generator works
import { generateLoremContent, generateChapterLorem } from './lorem-generator';
import { calculateWordCount } from '@/lib/types/project';

export function testLorem() {
  console.log('Testing Lorem Generator...');
  
  // Test 1: Generate basic lorem content
  const basicContent = generateLoremContent(100, false);
  console.log('Basic content:', basicContent);
  console.log('Word count:', calculateWordCount(basicContent));
  
  // Test 2: Generate chapter lorem
  const chapterContent = generateChapterLorem('Test Chapter', 500, true);
  console.log('Chapter content:', chapterContent);
  console.log('Chapter word count:', calculateWordCount(chapterContent));
  
  // Test 3: Generate draft content
  const draftContent = generateLoremContent(200, true);
  console.log('Draft content:', draftContent);
  console.log('Draft word count:', calculateWordCount(draftContent));
  
  return {
    basic: basicContent,
    chapter: chapterContent,
    draft: draftContent
  };
}