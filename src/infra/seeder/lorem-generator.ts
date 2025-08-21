import type { TiptapValue } from '@/components/editor/v2/tiptap-types';

// Lorem ipsum word bank
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'enim', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut',
  'odit', 'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
  'nesciunt', 'neque', 'porro', 'quisquam', 'dolorem', 'adipisci', 'numquam',
  'eius', 'modi', 'tempora', 'incidunt', 'magnam', 'quaerat', 'etiam', 'minus',
  'soluta', 'nobis', 'eligendi', 'optio', 'cumque', 'nihil', 'impedit', 'quo'
];

/**
 * Generate a sentence with random lorem ipsum words
 */
function generateSentence(minWords: number = 8, maxWords: number = 16): string {
  const wordCount = minWords + Math.floor(Math.random() * (maxWords - minWords));
  const words: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const word = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
    // Capitalize first word
    words.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
  }

  return words.join(' ') + '.';
}

/**
 * Generate a paragraph with multiple sentences
 */
function generateParagraph(targetWords: number = 80): string {
  const sentences: string[] = [];
  let wordCount = 0;
  const avgWordsPerSentence = 12;
  const targetSentences = Math.ceil(targetWords / avgWordsPerSentence);

  for (let i = 0; i < targetSentences; i++) {
    const sentence = generateSentence(8, 16);
    sentences.push(sentence);
    // Rough word count (split by spaces)
    wordCount += sentence.split(' ').length;

    if (wordCount >= targetWords) break;
  }

  return sentences.join(' ');
}

/**
 * Generate lorem ipsum content for a specific word count
 */
export function generateLoremContent(targetWords: number, isDraft: boolean = false): TiptapValue {
  const content: any[] = [];
  console.log(`Generating lorem content for ~${targetWords} words (isDraft: ${isDraft})`);

  if (isDraft) {
    // For drafts, add some rough notes and bullet points
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Draft Notes' }]
    });

    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '• ' + generateSentence(5, 10) }]
    });

    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '• ' + generateSentence(5, 10) }]
    });

    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '• TODO: ' + generateSentence(3, 6) }]
    });

    content.push({
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Rough Content' }]
    });
  }

  // Calculate paragraphs needed
  const wordsPerParagraph = 80;
  const paragraphsNeeded = Math.ceil(targetWords / wordsPerParagraph);

  // Generate paragraphs
  let wordsGenerated = 0;
  for (let i = 0; i < paragraphsNeeded; i++) {
    const remainingWords = targetWords - wordsGenerated;
    const paragraphWords = Math.min(wordsPerParagraph, remainingWords);

    if (paragraphWords <= 0) break;

    // Add occasional heading for structure
    if (i > 0 && i % 8 === 0 && !isDraft) {
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: `Chapter Section ${Math.floor(i / 8) + 1}` }]
      });
    }

    const paragraphText = generateParagraph(paragraphWords);
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: paragraphText }]
    });

    // Track words (rough count)
    wordsGenerated += paragraphText.split(' ').length;
  }

  console.log(`Generated ${content.length} nodes with total words: ${wordsGenerated}`);
  return {
    type: 'doc',
    content
  };
}

/**
 * Generate chapter content with lorem ipsum
 */
export function generateChapterLorem(chapterTitle: string, targetWords: number, isCompleted: boolean): TiptapValue {
  const content: any[] = [];

  // Add chapter title
  content.push({
    type: 'heading',
    attrs: { level: 1 },
    content: [{ type: 'text', text: chapterTitle }]
  });

  if (!isCompleted) {
    // For incomplete chapters, generate partial content
    const partialContent = generateLoremContent(Math.floor(targetWords * 0.3), false);
    content.push(...(partialContent.content || []));

    // Add a note about incomplete status
    content.push({
      type: 'paragraph',
      content: [{
        type: 'text',
        text: '[Chapter in progress...]',
        marks: [{ type: 'italic' }]
      }]
    });
  } else {
    // Generate full content
    const fullContent = generateLoremContent(targetWords, false);
    content.push(...(fullContent.content || []));
  }

  return {
    type: 'doc',
    content
  };
}
