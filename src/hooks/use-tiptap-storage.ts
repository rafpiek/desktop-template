import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from './use-debounce';
import type { TiptapValue, TiptapDocumentData, TiptapTextStats } from '@/components/editor/v2/tiptap-types';
import {
  loadTiptapDocumentData,
  saveTiptapContent,
  calculateTiptapTextStats,
  getEmptyTiptapDocument
} from '@/components/editor/v2/storage/tiptap-storage';

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

  // Debounce content changes for auto-save (1 second delay)
  const debouncedContent = useDebounce(content, 1000);

  // Load document data
  const loadDocumentData = useCallback((docId: string): TiptapDocumentData => {
    console.log(`📖 useTiptapStorage: Loading document data for ${docId}`);
    
    try {
      const data = loadTiptapDocumentData(docId);
      console.log(`📖 useTiptapStorage: Loaded document ${docId}:`, {
        wordCount: data.wordCount,
        charactersWithSpaces: data.charactersWithSpaces,
        charactersWithoutSpaces: data.charactersWithoutSpaces,
        hasContent: !!data.content
      });
      return data;
    } catch (error) {
      console.error(`useTiptapStorage: Error loading document ${docId}:`, error);
      return getEmptyTiptapDocument();
    }
  }, []);

  // Save document data
  const saveDocumentData = useCallback((content: TiptapValue, docId: string) => {
    if (!content) {
      console.warn(`useTiptapStorage: Skipping save for ${docId} - no content`);
      return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
    }

    console.log(`💾 useTiptapStorage: Saving document data for ${docId}`);
    
    try {
      const stats = saveTiptapContent(docId, content);
      setTextStats(stats);
      lastSavedContentRef.current = content;
      
      console.log(`💾 useTiptapStorage: Successfully saved ${docId}:`, stats);
      return stats;
    } catch (error) {
      console.error(`useTiptapStorage: Error saving document ${docId}:`, error);
      return textStats; // Return current stats if save fails
    }
  }, [textStats]);

  // Manual save function for immediate saves
  const saveNow = useCallback((contentToSave?: TiptapValue) => {
    const currentContent = contentToSave || content;
    if (currentContent && documentId) {
      return saveDocumentData(currentContent, documentId);
    }
    return textStats;
  }, [content, documentId, saveDocumentData, textStats]);

  // Update content and trigger stats calculation
  const updateContent = useCallback((newContent: TiptapValue) => {
    console.log(`🔄 useTiptapStorage: Updating content for ${documentId}`);
    setContent(newContent);
    
    // Calculate stats immediately for UI responsiveness
    const stats = calculateTiptapTextStats(newContent);
    setTextStats(stats);
  }, [documentId]);

  // Load content when document ID changes
  useEffect(() => {
    console.log(`🔄 useTiptapStorage: Document effect - current=${currentDocumentIdRef.current}, new=${documentId}`);
    
    if (currentDocumentIdRef.current !== documentId) {
      setIsLoading(true);
      
      // Save current document before switching (if we have one)
      if (currentDocumentIdRef.current && lastSavedContentRef.current) {
        console.log(`💾 useTiptapStorage: Saving current document ${currentDocumentIdRef.current} before switch`);
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
      
      console.log(`✅ useTiptapStorage: Successfully loaded document ${documentId}`, {
        wordCount: documentData.wordCount,
        charactersWithSpaces: documentData.charactersWithSpaces,
        charactersWithoutSpaces: documentData.charactersWithoutSpaces
      });
    }
  }, [documentId, loadDocumentData, saveDocumentData]);

  // Auto-save when content changes (debounced)
  useEffect(() => {
    if (debouncedContent && documentId && !isLoading) {
      // Only save if content has actually changed
      if (JSON.stringify(debouncedContent) !== JSON.stringify(lastSavedContentRef.current)) {
        console.log(`⏰ useTiptapStorage: Debounced save triggered for ${documentId}`);
        saveDocumentData(debouncedContent, documentId);
      }
    }
  }, [debouncedContent, documentId, isLoading, saveDocumentData]);

  // Save on unmount or when document changes
  useEffect(() => {
    return () => {
      if (currentDocumentIdRef.current && lastSavedContentRef.current) {
        console.log(`🚪 useTiptapStorage: Saving on unmount for ${currentDocumentIdRef.current}`);
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