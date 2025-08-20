import type { TiptapValue, TiptapTextStats } from '@/components/editor/v2/tiptap-types';

// Extract plain text from TipTap JSON content
export const extractTiptapText = (content: TiptapValue): string => {
  if (!content) return '';

  const extractFromNode = (node: unknown): string => {
    if (!node) return '';
    
    if (typeof node === 'string') return node;
    
    if (node.type === 'text' && typeof node.text === 'string') {
      return node.text;
    }
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractFromNode).join('');
    }
    
    // Handle different node types
    switch (node.type) {
      case 'paragraph':
      case 'heading':
      case 'blockquote':
        return extractFromNode(node) + '\n';
      case 'hardBreak':
        return '\n';
      case 'horizontalRule':
        return '---\n';
      default:
        return extractFromNode(node);
    }
  };

  return extractFromNode(content).trim();
};

// Calculate comprehensive text statistics
export const calculateTiptapTextStats = (content: TiptapValue): TiptapTextStats => {
  if (!content) {
    return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
  }

  const plainText = extractTiptapText(content);
  
  if (!plainText) {
    return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
  }

  // Calculate character counts
  const charactersWithSpaces = plainText.length;
  const charactersWithoutSpaces = plainText.replace(/\s/g, '').length;
  
  // Calculate word count (more accurate than simple split)
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0 && /\w/.test(word)); // Only count words with letters/numbers
    
  const wordCount = words.length;

  return {
    wordCount,
    charactersWithSpaces,
    charactersWithoutSpaces,
  };
};

// Check if TipTap content is empty
export const isTiptapContentEmpty = (content: TiptapValue): boolean => {
  if (!content || !content.content) return true;
  
  const text = extractTiptapText(content);
  return !text || text.trim().length === 0;
};

// Get content summary for display
export const getTiptapContentSummary = (content: TiptapValue, maxLength: number = 100): string => {
  const text = extractTiptapText(content);
  
  if (!text) return '';
  
  const trimmedText = text.trim();
  
  if (trimmedText.length <= maxLength) {
    return trimmedText;
  }
  
  // Find the last complete word within the limit
  const truncated = trimmedText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.7) { // Only break on word if it's not too short
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};

// Convert TipTap content to Markdown (basic implementation)
export const tiptapToMarkdown = (content: TiptapValue): string => {
  if (!content) return '';

  const convertNode = (node: unknown): string => {
    if (!node) return '';
    
    if (typeof node === 'string') return node;
    
    if (node.type === 'text') {
      let text = node.text || '';
      
      // Apply text marks
      if (node.marks) {
        for (const mark of node.marks) {
          switch (mark.type) {
            case 'bold':
              text = `**${text}**`;
              break;
            case 'italic':
              text = `*${text}*`;
              break;
            case 'code':
              text = `\`${text}\``;
              break;
            case 'link':
              text = `[${text}](${mark.attrs?.href || '#'})`;
              break;
          }
        }
      }
      
      return text;
    }
    
    if (node.content && Array.isArray(node.content)) {
      const childContent = node.content.map(convertNode).join('');
      
      switch (node.type) {
        case 'doc':
          return childContent;
        case 'paragraph':
          return childContent + '\n\n';
        case 'heading':
          const level = node.attrs?.level || 1;
          const hashes = '#'.repeat(level);
          return `${hashes} ${childContent}\n\n`;
        case 'blockquote':
          return childContent
            .split('\n')
            .map(line => `> ${line}`)
            .join('\n') + '\n\n';
        case 'codeBlock':
          const language = node.attrs?.language || '';
          return `\`\`\`${language}\n${childContent}\`\`\`\n\n`;
        case 'bulletList':
          return childContent;
        case 'orderedList':
          return childContent;
        case 'listItem':
          return `- ${childContent}`;
        case 'horizontalRule':
          return '---\n\n';
        case 'hardBreak':
          return '\n';
        default:
          return childContent;
      }
    }
    
    // Handle leaf nodes
    switch (node.type) {
      case 'image':
        const src = node.attrs?.src || '';
        const alt = node.attrs?.alt || '';
        const title = node.attrs?.title;
        return `![${alt}](${src}${title ? ` "${title}"` : ''})\n\n`;
      case 'horizontalRule':
        return '---\n\n';
      case 'hardBreak':
        return '\n';
      default:
        return '';
    }
  };

  return convertNode(content).trim();
};

// Create a new empty TipTap document
export const createEmptyTiptapDocument = (): TiptapValue => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: []
    }
  ]
});

// Validate TipTap content structure
export const validateTiptapContent = (content: unknown): content is TiptapValue => {
  if (!content || typeof content !== 'object') return false;
  
  if (content.type !== 'doc') return false;
  
  if (!Array.isArray(content.content)) return false;
  
  // Basic validation - each content item should have a type
  return content.content.every((item: any) => 
    item && typeof item === 'object' && typeof item.type === 'string'
  );
};

// Get reading time estimate (words per minute)
export const getTiptapReadingTime = (content: TiptapValue, wordsPerMinute: number = 200): number => {
  const stats = calculateTiptapTextStats(content);
  return Math.ceil(stats.wordCount / wordsPerMinute);
};

// Count specific elements in content
export const countTiptapElements = (content: TiptapValue) => {
  let paragraphs = 0;
  let headings = 0;
  let images = 0;
  let blockquotes = 0;
  
  const countInNode = (node: unknown): void => {
    if (!node) return;
    
    switch (node.type) {
      case 'paragraph':
        paragraphs++;
        break;
      case 'heading':
        headings++;
        break;
      case 'image':
        images++;
        break;
      case 'blockquote':
        blockquotes++;
        break;
    }
    
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(countInNode);
    }
  };
  
  countInNode(content);
  
  return {
    paragraphs,
    headings,
    images,
    blockquotes,
  };
};