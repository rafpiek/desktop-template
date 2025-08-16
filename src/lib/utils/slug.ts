/**
 * Convert a string to kebab-case (lowercase with hyphens)
 * Useful for creating file-safe names
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    // Replace special characters with spaces
    .replace(/[^\w\s-]/g, ' ')
    // Replace multiple spaces or hyphens with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Create a file-safe name from a title and ID
 * Format: kebab-case-title-id
 */
export function createFileName(title: string, id: string): string {
  const kebabTitle = toKebabCase(title);
  // Take only the last 8 characters of the ID for brevity
  const shortId = id.slice(-8);
  return `${kebabTitle}-${shortId}`;
}

/**
 * Create a directory-safe name from a title
 */
export function createDirectoryName(title: string, order?: number): string {
  const kebabTitle = toKebabCase(title);
  if (order !== undefined) {
    const paddedOrder = String(order).padStart(2, '0');
    return `${paddedOrder}-${kebabTitle}`;
  }
  return kebabTitle;
}