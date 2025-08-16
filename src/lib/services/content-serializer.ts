import type { MyValue } from '@/components/editor/plate-types';
import type { Document, Chapter, Project, ProjectTag } from '@/lib/types/project';

/**
 * Generate YAML frontmatter for a document
 */
export function generateDocumentFrontmatter(doc: Document): string {
  const frontmatter: Record<string, any> = {
    id: doc.id,
    title: doc.title,
    created: doc.createdAt,
    updated: doc.updatedAt,
    status: doc.status,
    wordCount: doc.wordCount,
    tags: doc.tags.map(tag => tag.name),
    projectId: doc.projectId,
  };

  if (doc.chapterId) {
    frontmatter.chapterId = doc.chapterId;
  }

  if (doc.notes) {
    frontmatter.notes = doc.notes;
  }

  // Convert to YAML format
  const lines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        lines.push(`${key}:`);
        value.forEach(item => lines.push(`  - "${item}"`));
      } else {
        lines.push(`${key}: []`);
      }
    } else if (typeof value === 'string') {
      // Escape quotes in strings
      const escaped = value.replace(/"/g, '\\"');
      lines.push(`${key}: "${escaped}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---');
  lines.push(''); // Empty line after frontmatter
  
  return lines.join('\n');
}

/**
 * Convert Plate.js content to Markdown
 */
export function plateToMarkdown(content: MyValue): string {
  if (!content || !Array.isArray(content)) {
    return '';
  }

  const lines: string[] = [];

  for (const node of content) {
    const markdown = nodeToMarkdown(node);
    if (markdown) {
      lines.push(markdown);
    }
  }

  return lines.join('\n\n').trim();
}

/**
 * Convert a single Plate.js node to Markdown
 */
function nodeToMarkdown(node: any): string {
  if (!node) return '';

  // Handle text nodes
  if (node.text !== undefined) {
    return formatText(node);
  }

  // Handle element nodes based on type
  switch (node.type) {
    case 'p':
    case 'paragraph':
      return childrenToMarkdown(node.children);

    case 'h1':
      return `# ${childrenToMarkdown(node.children)}`;
    case 'h2':
      return `## ${childrenToMarkdown(node.children)}`;
    case 'h3':
      return `### ${childrenToMarkdown(node.children)}`;
    case 'h4':
      return `#### ${childrenToMarkdown(node.children)}`;
    case 'h5':
      return `##### ${childrenToMarkdown(node.children)}`;
    case 'h6':
      return `###### ${childrenToMarkdown(node.children)}`;

    case 'blockquote':
      return childrenToMarkdown(node.children)
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n');

    case 'code_block':
      const language = node.lang || '';
      const code = childrenToMarkdown(node.children);
      return `\`\`\`${language}\n${code}\n\`\`\``;

    case 'ul':
    case 'unordered_list':
      return node.children
        .map((child: any) => `- ${childrenToMarkdown(child.children || [])}`)
        .join('\n');

    case 'ol':
    case 'ordered_list':
      return node.children
        .map((child: any, index: number) => `${index + 1}. ${childrenToMarkdown(child.children || [])}`)
        .join('\n');

    case 'li':
    case 'list_item':
      return childrenToMarkdown(node.children);

    case 'hr':
      return '---';

    case 'a':
    case 'link':
      const linkText = childrenToMarkdown(node.children);
      const url = node.url || node.href || '#';
      return `[${linkText}](${url})`;

    case 'image':
    case 'img':
      const alt = node.alt || node.caption || 'Image';
      const src = node.url || node.src || '';
      return `![${alt}](${src})`;

    case 'table':
      return tableToMarkdown(node);

    default:
      // For unknown types, just process children
      if (node.children) {
        return childrenToMarkdown(node.children);
      }
      return '';
  }
}

/**
 * Convert children nodes to markdown
 */
function childrenToMarkdown(children: any[]): string {
  if (!children || !Array.isArray(children)) {
    return '';
  }

  return children.map(child => {
    if (child.text !== undefined) {
      return formatText(child);
    }
    return nodeToMarkdown(child);
  }).join('');
}

/**
 * Format text with inline styles
 */
function formatText(node: any): string {
  let text = node.text || '';

  // Apply formatting marks
  if (node.bold) {
    text = `**${text}**`;
  }
  if (node.italic) {
    text = `*${text}*`;
  }
  if (node.underline) {
    text = `<u>${text}</u>`;
  }
  if (node.strikethrough) {
    text = `~~${text}~~`;
  }
  if (node.code) {
    text = `\`${text}\``;
  }

  return text;
}

/**
 * Convert table to markdown
 */
function tableToMarkdown(table: any): string {
  if (!table.children || table.children.length === 0) {
    return '';
  }

  const rows = table.children;
  const markdownRows: string[] = [];

  // Process each row
  rows.forEach((row: any, rowIndex: number) => {
    if (row.children) {
      const cells = row.children.map((cell: any) => 
        childrenToMarkdown(cell.children || []).trim()
      );
      markdownRows.push(`| ${cells.join(' | ')} |`);

      // Add header separator after first row
      if (rowIndex === 0) {
        const separator = cells.map(() => '---').join(' | ');
        markdownRows.push(`| ${separator} |`);
      }
    }
  });

  return markdownRows.join('\n');
}

/**
 * Export document to Markdown with frontmatter
 */
export function exportDocumentToMarkdown(doc: Document): string {
  const frontmatter = generateDocumentFrontmatter(doc);
  const markdown = plateToMarkdown(doc.content);
  
  return `${frontmatter}\n${markdown}`;
}

/**
 * Export document metadata to JSON
 */
export function exportDocumentToJson(doc: Document): any {
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    wordCount: doc.wordCount,
    status: doc.status,
    tags: doc.tags,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    projectId: doc.projectId,
    chapterId: doc.chapterId,
    isCompleted: doc.isCompleted,
    notes: doc.notes,
  };
}

/**
 * Export chapter metadata to JSON
 */
export function exportChapterToJson(chapter: Chapter): any {
  return {
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
    order: chapter.order,
    isCompleted: chapter.isCompleted,
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
    projectId: chapter.projectId,
    documentIds: chapter.documentIds,
    wordCount: chapter.wordCount,
  };
}

/**
 * Export project metadata to JSON
 */
export function exportProjectToJson(project: Project, chapters: Chapter[], documents: Document[], tags: ProjectTag[]): any {
  return {
    metadata: {
      version: '1.0.0',
      timestamp: Date.now(),
      timestampISO: new Date().toISOString(),
      appVersion: '1.0.0', // You might want to get this from package.json or env
    },
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      content: project.content,
      wordCount: project.wordCount,
      status: project.status,
      label: project.label,
      tags: project.tags,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      targetWordCount: project.targetWordCount,
      deadline: project.deadline,
      isFavorite: project.isFavorite,
      isArchived: project.isArchived,
      chapterIds: project.chapterIds,
      genre: project.genre,
      notes: project.notes,
    },
    chapters: chapters.map(exportChapterToJson),
    documents: documents.map(exportDocumentToJson),
    tags: tags,
  };
}