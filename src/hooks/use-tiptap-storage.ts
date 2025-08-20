import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from './use-debounce';
import type { TiptapValue, TiptapDocumentData, TiptapTextStats } from '@/components/editor/v2/tiptap-types';
import {
  loadTiptapDocumentData,
  saveTiptapContent,
  calculateTiptapTextStats,
  getEmptyTiptapDocument
} from '@/components/editor/v2/storage/tiptap-storage';
import { Constants } from '@/infra/constants';

export function useTiptapStorage(documentId: string) {
  const [content, setContent] = useState<TiptapValue | null>(null);
  const [textStats, setTextStats] = useState<TiptapTextStats>({
    wordCount: 0,
    charactersWithSpaces: 0,
    charactersWithoutSpaces: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const currentDocumentIdRef = useRef<string | null>(null);
  const lastSavedContentRef = useRef<TiptapValue | null>(null);
  const debouncedContentDocumentIdRef = useRef<string | null>(null);

  // Debounce content changes for auto-save (500ms delay)
  const debouncedContent = useDebounce(content, Constants.AUTO_SAVE_DELAY);

  // Load document data
  const loadDocumentData = useCallback((docId: string): TiptapDocumentData => {

    try {
      const data = loadTiptapDocumentData(docId);
      const extractParagraphText = (content: any): string => {
        if (!content?.content?.content) return '';
        return content.content.content
          .filter((node: any) => node.type === 'paragraph')
          .map((para: any) =>
            para.content?.map((textNode: any) => textNode.text || '').join('') || ''
          )
          .join(' ');
      };
      const paragraphText = extractParagraphText(data);
      console.log('Paragraph text:', paragraphText, docId);
      return data;
    } catch (error) {
      return getEmptyTiptapDocument();
    }
  }, []);

  // Save document data
  const saveDocumentData = useCallback((content: TiptapValue, docId: string) => {
    if (!content) {
      return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
    }

    try {
      const stats = saveTiptapContent(docId, content);
      setTextStats(stats);
      lastSavedContentRef.current = content;

      return stats;
    } catch (error) {
      return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 }; // Return empty stats if save fails
    }
  }, []);

  // Manual save function for immediate saves
  const saveNow = useCallback((contentToSave?: TiptapValue) => {
    const currentContent = contentToSave || content;
    if (currentContent && documentId) {
      return saveDocumentData(currentContent, documentId);
    }
    return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
  }, [content, documentId, saveDocumentData]);

  // Update content and trigger stats calculation
  const updateContent = useCallback((newContent: TiptapValue) => {
    setContent(newContent);

    // Track which document this content belongs to
    debouncedContentDocumentIdRef.current = documentId;

    // Calculate stats immediately for UI responsiveness
    const stats = calculateTiptapTextStats(newContent);
    setTextStats(stats);
  }, [documentId]);

  // Load content when document ID changes
  useEffect(() => {

    if (currentDocumentIdRef.current !== documentId) {
      setIsLoading(true);

      // Save current document before switching (if we have one)
      if (currentDocumentIdRef.current && lastSavedContentRef.current) {
        saveDocumentData(lastSavedContentRef.current, currentDocumentIdRef.current);
      }

      // Load new document
      const documentData = loadDocumentData(documentId);

      // Update state
      currentDocumentIdRef.current = documentId;
      lastSavedContentRef.current = documentData.content;
      setContent(documentData.content);
      setTextStats({
        wordCount: documentData.wordCount,
        charactersWithSpaces: documentData.charactersWithSpaces,
        charactersWithoutSpaces: documentData.charactersWithoutSpaces,
      });

      setIsLoading(false);

    }
  }, [documentId]);

  // Auto-save when content changes (debounced)
  useEffect(() => {
    if (debouncedContent && !isLoading && debouncedContentDocumentIdRef.current) {
      // CRITICAL: Only save content to the document it actually belongs to
      const contentDocumentId = debouncedContentDocumentIdRef.current;

      // Only save if content has actually changed
      if (JSON.stringify(debouncedContent) !== JSON.stringify(lastSavedContentRef.current)) {
        console.log('Auto-saving debounced content to document:', contentDocumentId);
        saveDocumentData(debouncedContent, contentDocumentId);
      }
    }
  }, [debouncedContent, isLoading]);

  // Save on unmount or when document changes
  useEffect(() => {
    return () => {
      if (currentDocumentIdRef.current && lastSavedContentRef.current) {
        saveTiptapContent(currentDocumentIdRef.current, lastSavedContentRef.current);
      }
    };
  }, []);

  return {
    content,
    setContent: updateContent,
    textStats,
    isLoading,
    saveNow,
    loadDocumentData,
    saveDocumentData,
  };
}
