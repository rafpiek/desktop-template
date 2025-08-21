import type { TiptapValue } from '@/components/editor/v2/tiptap-types';
import type { GenreTemplate, SeededDocumentConfig } from './types';
import type { DocumentStatus } from '@/lib/types/project';
import { calculateWordCount } from '@/lib/types/project';
import { generateLoremContent, generateChapterLorem } from './lorem-generator';

// Genre templates with authentic content for each genre
const GENRE_TEMPLATES: Record<string, GenreTemplate> = {
  literary: {
    name: 'Literary Fiction',
    label: 'novel',
    genre: 'Literary Fiction',
    tags: [
      { id: '019424ec-a96a-7000-8000-000000000019', name: 'Literary Fiction', color: '#059669' }
    ],
    characterNames: ['Elena', 'Marcus', 'Dr. Sarah Chen', 'James', 'Rosa', 'Professor Williams'],
    locations: ['Chicago', 'The University', 'Millennium Park', 'The Coffee House', 'Lake Michigan', 'The Library'],
    themes: ['identity', 'loss', 'memory', 'human connection', 'modern life', 'self-discovery'],
    chapterTitles: [
      'The Weight of Silence', 'Between Lines', 'Fractured Light', 'The Space We Leave Behind',
      'Conversations with Ghosts', 'The Art of Letting Go', 'What Remains', 'The Unspoken Truth',
      'Finding Center', 'The Long Way Home', 'Echoes in Empty Rooms', 'Where Stories End'
    ],
    openingLines: [
      'The letter arrived on a Tuesday, ordinary as rain.',
      'Elena had always been good at disappearing.',
      'The university felt different in winter, like a book with half its pages torn out.',
      'Sometimes the hardest conversations are the ones we have with ourselves.',
    ],
    plotElements: [
      'a discovered journal', 'an unexpected phone call', 'a childhood friend returns',
      'a family secret revealed', 'an old photograph', 'a letter never sent',
      'a conversation overheard', 'a memory that surfaces', 'a decision that changes everything'
    ],
    draftIdeas: [
      'Character study of a librarian who reads the marginalia in returned books',
      'Story about a woman who inherits her grandmother\'s recipes and memories',
      'Exploring the relationship between a teacher and their retiring mentor',
    ]
  },

  mystery: {
    name: 'Mystery/Thriller',
    label: 'novel',
    genre: 'Mystery',
    tags: [
      { id: '019424ec-a96a-7000-8000-000000000016', name: 'Mystery', color: '#6366f1' }
    ],
    characterNames: ['Detective Morgan', 'Captain Hayes', 'Dr. Elizabeth Hart', 'Thomas Blackwood', 'Sarah', 'Officer Chen'],
    locations: ['Blackmoor Village', 'The Old Manor', 'The Police Station', 'The Moors', 'St. Mary\'s Church', 'The Harbor'],
    themes: ['justice', 'secrets', 'betrayal', 'truth', 'corruption', 'redemption'],
    chapterTitles: [
      'The Missing Hour', 'Shadows on the Moor', 'The Locked Room', 'Blood and Roses',
      'False Witness', 'The Third Letter', 'Midnight at the Manor', 'The Confession',
      'Pieces of the Puzzle', 'The Final Trap', 'Truth in the Darkness', 'Justice Served'
    ],
    openingLines: [
      'The call came at 3:47 AM, just as Detective Morgan had finally fallen asleep.',
      'Three things were certain: the door was locked from the inside, the window was sealed, and Thomas Blackwood was dead.',
      'The village of Blackmoor had kept its secrets for over a century, but secrets have a way of surfacing.',
      'Everyone in town knew the old saying: nothing good happens at the manor after midnight.',
    ],
    plotElements: [
      'a missing person case', 'an impossible crime', 'a cryptic message',
      'an unreliable witness', 'a hidden motive', 'false evidence',
      'a decades-old cold case', 'a corrupt official', 'a dangerous obsession'
    ],
    draftIdeas: [
      'Cold case involving a missing heiress from the 1980s',
      'Detective struggling with a case that mirrors their own past',
      'Small town harboring a conspiracy that goes back generations',
    ]
  },

  fantasy: {
    name: 'Fantasy Adventure',
    label: 'novel',
    genre: 'Fantasy',
    tags: [
      { id: '019424ec-a96a-7000-8000-000000000013', name: 'Fantasy', color: '#8b5cf6' }
    ],
    characterNames: ['Lyra', 'Kael', 'Master Thorne', 'Queen Isolde', 'Raven', 'The Guardian'],
    locations: ['The Quantum Gardens', 'Crystal Peaks', 'The Academy', 'The Whispering Forest', 'Starfall City', 'The Void'],
    themes: ['power', 'destiny', 'sacrifice', 'balance', 'friendship', 'courage'],
    chapterTitles: [
      'The Quantum Seed', 'Echoes of the Past', 'The Academy of Stars', 'Into the Void',
      'The Guardian\'s Test', 'Shattered Realities', 'The Crystal Heart', 'Darkness Rising',
      'The Final Alliance', 'Between Worlds', 'The Price of Magic', 'New Beginnings'
    ],
    openingLines: [
      'The garden existed between heartbeats, in the space where reality bent.',
      'Lyra had always known she was different, but she never expected to be the key to saving two worlds.',
      'Magic, Master Thorne always said, was just science we hadn\'t learned to explain yet.',
      'The quantum flowers bloomed only when no one was watching, petals shifting between dimensions.',
    ],
    plotElements: [
      'ancient prophecy', 'magical artifact', 'portal between worlds',
      'mentor\'s betrayal', 'hidden royal bloodline', 'elemental magic',
      'dark sorcerer', 'magical academy', 'quest for power'
    ],
    draftIdeas: [
      'Young woman discovers she can manipulate probability through quantum magic',
      'Academy student uncovers conspiracy involving interdimensional travel',
      'Guardian of reality faces threat from parallel universe versions of themselves',
    ]
  },

  memoir: {
    name: 'Memoir/Autobiography',
    label: 'essay',
    genre: 'Memoir',
    tags: [
      { id: '019424ec-a96a-7000-8000-00000000001b', name: 'Memoir', color: '#0891b2' }
    ],
    characterNames: ['Mom', 'Dad', 'Grandma Rose', 'David', 'Mrs. Rodriguez', 'Coach Martinez'],
    locations: ['Our House', 'The Kitchen', 'Elementary School', 'The Old Neighborhood', 'Summer Camp', 'High School'],
    themes: ['family', 'growing up', 'identity', 'belonging', 'resilience', 'love'],
    chapterTitles: [
      'Before the Move', 'The House on Maple Street', 'Learning to Swim', 'Family Dinners',
      'The Summer I Turned Ten', 'First Day of School', 'Grandma\'s Stories', 'Finding My Voice',
      'The Year Everything Changed', 'Leaving Home', 'What Home Really Means', 'Full Circle'
    ],
    openingLines: [
      'I was seven when we moved to the house on Maple Street, and everything changed.',
      'My grandmother used to say that kitchens hold the most important conversations.',
      'Some memories are so vivid they feel more real than the present moment.',
      'The smell of my mother\'s cooking still takes me back to Sunday mornings.',
    ],
    plotElements: [
      'family tradition', 'childhood fear overcome', 'important lesson learned',
      'relationship with grandparent', 'school experience', 'community event',
      'family crisis', 'moment of understanding', 'rite of passage'
    ],
    draftIdeas: [
      'Memories of learning to cook with grandmother',
      'The impact of moving to a new town as a child',
      'How high school shaped my understanding of friendship',
    ]
  },

  romance: {
    name: 'Young Adult Romance',
    label: 'novel',
    genre: 'Young Adult',
    tags: [
      { id: '019424ec-a96a-7000-8000-00000000001a', name: 'Young Adult', color: '#7c3aed' },
      { id: '019424ec-a96a-7000-8000-000000000015', name: 'Romance', color: '#ec4899' }
    ],
    characterNames: ['Emma', 'Jake', 'Mia', 'Alex', 'Chloe', 'Ms. Patterson'],
    locations: ['Ridgemont High', 'The Coffee Shop', 'The Beach', 'The Library', 'Summer Festival', 'The Art Room'],
    themes: ['first love', 'friendship', 'self-discovery', 'dreams', 'family', 'growing up'],
    chapterTitles: [
      'New Girl', 'The Art of Pretending', 'Coffee Shop Conversations', 'Mixed Signals',
      'Summer Plans', 'The Festival', 'Jealousy and Misunderstandings', 'Truth and Consequences',
      'Making Choices', 'The Grand Gesture', 'Senior Year', 'Forever and Always'
    ],
    openingLines: [
      'Emma Chen had exactly three goals for senior year: graduate, get into art school, and avoid Jake Morrison at all costs.',
      'The coffee shop was supposed to be her sanctuary, the one place where she could be herself.',
      'Some people believe in love at first sight; Emma believed in love at first shared terrible joke.',
      'Moving to a new school senior year was like trying to join a movie halfway through.',
    ],
    plotElements: [
      'meet-cute scenario', 'misunderstanding', 'jealous ex',
      'family disapproval', 'competing dreams', 'best friend drama',
      'school event', 'grand romantic gesture', 'choosing between opportunities'
    ],
    draftIdeas: [
      'Girl who hides her artistic talent meets boy who sees through her facade',
      'Two rival students forced to work together on school newspaper',
      'Teen dealing with parents\' divorce finds unexpected romance at summer job',
    ]
  }
};

/**
 * Generate authentic content for a specific genre and word count
 */
export function generateContent(
  genre: string,
  targetWords: number,
  isCompleted: boolean = true,
  isDraft: boolean = false
): TiptapValue {
  // Just use lorem ipsum for all content
  return generateLoremContent(targetWords, isDraft);
}

/**
 * Generate raw, unpolished draft content
 */
function generateDraftContent(template: GenreTemplate, targetWords: number): TiptapValue {
  const ideas = template.draftIdeas;
  const plotElements = template.plotElements;
  
  const content: any[] = [];
  
  // Add a rough title idea
  content.push({
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text: 'Story Ideas & Notes' }]
  });

  // Add some bullet points with ideas
  content.push({
    type: 'paragraph',
    content: [{ type: 'text', text: '• ' + ideas[Math.floor(Math.random() * ideas.length)] }]
  });
  
  content.push({
    type: 'paragraph',
    content: [{ type: 'text', text: '• Maybe explore: ' + plotElements[Math.floor(Math.random() * plotElements.length)] }]
  });

  content.push({
    type: 'paragraph',
    content: [{ type: 'text', text: '• Character names to consider: ' + template.characterNames.slice(0, 3).join(', ') }]
  });

  // Add rough opening
  content.push({
    type: 'heading',
    attrs: { level: 3 },
    content: [{ type: 'text', text: 'Possible opening:' }]
  });
  
  content.push({
    type: 'paragraph',
    content: [{ type: 'text', text: template.openingLines[Math.floor(Math.random() * template.openingLines.length)] }]
  });

  // Add some stream-of-consciousness notes
  const notes = [
    'Need to flesh this out more...',
    'Research needed on ' + template.locations[0],
    'What if the main character is more reluctant?',
    'Subplot with ' + template.characterNames[1] + '?',
    'Theme: ' + template.themes[Math.floor(Math.random() * template.themes.length)],
    'Ending still unclear - maybe a twist?',
    'Check similar books for inspiration',
    'Character arc needs work'
  ];
  
  content.push({
    type: 'heading',
    attrs: { level: 3 },
    content: [{ type: 'text', text: 'Random thoughts:' }]
  });

  for (let i = 0; i < Math.min(4, targetWords / 20); i++) {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '- ' + notes[Math.floor(Math.random() * notes.length)] }]
    });
  }

  return {
    type: 'doc',
    content
  };
}

/**
 * Generate partial content for in-progress chapters
 */
function generatePartialContent(template: GenreTemplate, targetWords: number): TiptapValue {
  const content: any[] = [];
  const wordsPerParagraph = 60;
  const targetParagraphs = Math.floor(targetWords / wordsPerParagraph);
  
  // Add opening
  content.push({
    type: 'paragraph',
    content: [{ 
      type: 'text', 
      text: template.openingLines[Math.floor(Math.random() * template.openingLines.length)]
    }]
  });

  // Generate story content
  for (let i = 0; i < targetParagraphs - 1; i++) {
    const paragraph = generateParagraph(template, i);
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: paragraph }]
    });
  }

  // Add placeholder for unfinished content
  content.push({
    type: 'paragraph',
    content: [{ 
      type: 'text', 
      text: '[Continue from here - need to develop the scene where ' + 
            template.characterNames[0] + ' encounters the ' + 
            template.plotElements[Math.floor(Math.random() * template.plotElements.length)] + '...]',
      marks: [{ type: 'italic' }]
    }]
  });

  return {
    type: 'doc',
    content
  };
}

/**
 * Generate complete, polished content
 */
function generateCompleteContent(template: GenreTemplate, targetWords: number): TiptapValue {
  const content: any[] = [];
  const wordsPerParagraph = 80;
  const targetParagraphs = Math.floor(targetWords / wordsPerParagraph);
  
  // Add opening
  content.push({
    type: 'paragraph',
    content: [{ 
      type: 'text', 
      text: template.openingLines[Math.floor(Math.random() * template.openingLines.length)]
    }]
  });

  // Generate story content with dialogue and narrative
  for (let i = 0; i < targetParagraphs - 1; i++) {
    // Generate a paragraph using templates, cycling through them with variation
    const paragraph = generateParagraph(template, i, true);
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: paragraph }]
    });

    // Add dialogue every 3-4 paragraphs
    if (i % 3 === 0 && i > 0) {
      const dialogue = generateDialogue(template);
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: dialogue }]
      });
    }
    
    // Add scene breaks occasionally for natural flow
    if (i % 15 === 0 && i > 0) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: '* * *' }]
      });
    }
  }

  return {
    type: 'doc',
    content
  };
}

/**
 * Generate a realistic paragraph for the given template
 */
function generateParagraph(template: GenreTemplate, index: number, isComplete: boolean = false): string {
  const character = template.characterNames[Math.floor(Math.random() * template.characterNames.length)];
  const location = template.locations[Math.floor(Math.random() * template.locations.length)];
  const theme = template.themes[Math.floor(Math.random() * template.themes.length)];
  const plotElement = template.plotElements[Math.floor(Math.random() * template.plotElements.length)];

  // Genre-specific paragraph templates
  const templates = {
    literary: [
      `${character} sat in the quiet corners of ${location}, contemplating the nature of ${theme}. The world outside seemed to move at a different pace, as if time itself had learned to respect the weight of unspoken thoughts.`,
      `There was something about the way light filtered through the windows of ${location} that reminded ${character} of childhood summers. Memory had a way of reshaping itself, turning ordinary moments into something approaching poetry.`,
      `The conversation with ${character} had stayed with them for days, echoing in the spaces between routine and revelation. Sometimes the most important things are said in the silences between words.`
    ],
    mystery: [
      `Detective ${character} examined the evidence carefully, noting the inconsistencies that others had missed. The scene at ${location} told a story, but not the one the killer intended.`,
      `The witness testimony didn't add up. ${character} had seen enough cases to know when someone was lying, and the nervous fidgeting during questioning was just the beginning.`,
      `Something about ${plotElement} bothered ${character}. After twenty years on the force, they'd learned to trust their instincts, and right now they were screaming that this case was more complicated than it appeared.`
    ],
    fantasy: [
      `The magic in ${location} felt different today, charged with an energy that made ${character}'s skin tingle. The ancient stones seemed to pulse with their own rhythm, responding to the approaching convergence.`,
      `Master Thorne had warned about ${plotElement}, but ${character} never imagined it would manifest so dramatically. The very air seemed to shimmer with possibilities, each one more dangerous than the last.`,
      `${character} reached for the quantum energy that flowed through all living things, feeling it respond to their call. The power came easier now, but with it came the knowledge of how much more there was to learn.`
    ],
    memoir: [
      `I remember ${location} the way it was before everything changed. ${character} used to say that places hold onto memories the way people hold onto secrets, keeping them safe until someone is ready to understand.`,
      `The smell of ${location} still takes me back to that summer when I learned what ${theme} really meant. Childhood has a way of teaching us lessons we don't understand until we're older.`,
      `${character} had a way of making even ordinary moments feel special. Looking back, I realize that those small gestures of love were what shaped who I became.`
    ],
    romance: [
      `${character} couldn't stop thinking about what happened at ${location}. The way their eyes met across the crowded room felt like something out of a movie, except this was real and terrifying and wonderful all at once.`,
      `The text message from ${character} had been sitting on their phone for three hours, and they still didn't know how to respond. Sometimes the most important conversations are the hardest to start.`,
      `Walking through ${location} together felt different now. Every familiar place had been transformed by the possibility of ${theme}, turning the ordinary world into something magical.`
    ]
  };

  const genreTemplates = templates[template.genre.toLowerCase().replace(/[^a-z]/g, '')] || templates.literary;
  return genreTemplates[Math.floor(Math.random() * genreTemplates.length)];
}

/**
 * Generate realistic dialogue for the given template
 */
function generateDialogue(template: GenreTemplate): string {
  const character1 = template.characterNames[0];
  const character2 = template.characterNames[1];
  
  const dialogues = {
    literary: [
      `"I never told you about my father," ${character1} said quietly. "${character2}, there are things about my family that I'm still trying to understand myself."`,
      `"The problem isn't what happened," ${character2} replied, stirring their coffee absently. "The problem is what we choose to do about it now."`
    ],
    mystery: [
      `"The timeline doesn't work, Detective ${character1}," ${character2} insisted. "I was nowhere near the manor that night, and I have witnesses."`,
      `"Everyone's got an alibi," ${character1} said grimly. "The question is which one falls apart first."`
    ],
    fantasy: [
      `"The quantum field is unstable," ${character2} warned, checking the crystal readings. "If you attempt the crossing now, ${character1}, you could tear a hole between dimensions."`,
      `"Then we'd better make sure I do it right the first time," ${character1} replied, stepping toward the shimmering portal.`
    ],
    memoir: [
      `"You know," ${character1} said, looking up from the photo album, "I never realized how much you look like Grandma Rose in this picture."`,
      `"She used to tell me I had her stubborn streak too," I laughed, remembering the woman who shaped so much of my childhood.`
    ],
    romance: [
      `"I've been thinking about what you said," ${character1} began, then stopped. The words felt too big for the quiet coffee shop.`,
      `"Take your time," ${character2} said softly. "Whatever it is, we'll figure it out together."`
    ]
  };

  const key = template.genre.toLowerCase().replace(/[^a-z]/g, '');
  const genreDialogues = dialogues[key] || dialogues.literary;
  return genreDialogues[Math.floor(Math.random() * genreDialogues.length)];
}

/**
 * Generate a chapter with specific word count
 */
export function generateChapterContent(
  genre: string, 
  title: string, 
  targetWords: number,
  isCompleted: boolean = true
): SeededDocumentConfig {
  const template = GENRE_TEMPLATES[genre.toLowerCase()];
  if (!template) {
    throw new Error(`Unknown genre: ${genre}`);
  }

  // Use lorem generator for chapter content
  const content = generateChapterLorem(title, targetWords, isCompleted);
  const actualWords = calculateWordCount(content);

  return {
    title,
    content,
    wordCount: actualWords,
    status: isCompleted ? 'complete' : 'draft',
    tags: template.tags,
    isCompleted,
    isForDraft: false
  };
}

/**
 * Generate a draft document
 */
export function generateDraftDocument(
  genre: string,
  title: string,
  targetWords: number
): SeededDocumentConfig {
  const template = GENRE_TEMPLATES[genre.toLowerCase()];
  if (!template) {
    throw new Error(`Unknown genre: ${genre}`);
  }

  // Use lorem generator for draft content
  const content = generateLoremContent(targetWords, true);
  const actualWords = calculateWordCount(content);

  return {
    title,
    content,
    wordCount: actualWords,
    status: 'draft' as DocumentStatus,
    tags: template.tags.slice(0, 1), // Fewer tags for drafts
    isCompleted: false,
    isForDraft: true
  };
}

/**
 * Get genre template for project creation
 */
export function getGenreTemplate(genre: string): GenreTemplate {
  const template = GENRE_TEMPLATES[genre.toLowerCase()];
  if (!template) {
    throw new Error(`Unknown genre: ${genre}`);
  }
  return template;
}