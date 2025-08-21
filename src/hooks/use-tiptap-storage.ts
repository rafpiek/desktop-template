import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from './use-debounce';
import type { TiptapValue, TiptapDocumentData, TiptapTextStats } from '@/components/editor/v2/tiptap-types';
import {
  loadDocumentData,
  saveDocumentContent,
  calculateTextStats,
  getEmptyDocumentData,
  startWritingSession,
  updateWritingSession,
  endWritingSession,
  getCurrentSession,
  type WritingSession
} from '@/components/editor/v2/storage/document-storage';
import { Constants } from '@/infra/constants';

export function useTiptapStorage(documentId: string, projectId?: string) {
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

  // Writing session state
  const [currentSession, setCurrentSession] = useState<WritingSession | null>(null);
  const [sessionWordsAdded, setSessionWordsAdded] = useState(0);
  const sessionStartedRef = useRef<boolean>(false);

  // Debounce content changes for auto-save (500ms delay)
  const debouncedContent = useDebounce(content, Constants.AUTO_SAVE_DELAY);

  // Session management functions
  const startSession = useCallback((baselineWordCount: number) => {
    if (sessionStartedRef.current) return; // Already started
    
    try {
      const session = startWritingSession(documentId, baselineWordCount, projectId);
      setCurrentSession(session);
      setSessionWordsAdded(0);
      sessionStartedRef.current = true;
      console.log('Started writing session:', session.id, 'baseline:', baselineWordCount);
    } catch (error) {
      console.error('Failed to start writing session:', error);
    }
  }, [documentId, projectId]);

  const updateSession = useCallback((currentWordCount: number) => {
    if (!sessionStartedRef.current) return;
    
    try {
      const updatedSession = updateWritingSession(documentId, currentWordCount);
      if (updatedSession) {
        setCurrentSession(updatedSession);
        setSessionWordsAdded(updatedSession.wordsAdded);
        console.log('Updated session:', updatedSession.wordsAdded, 'words added');
      }
    } catch (error) {
      console.error('Failed to update writing session:', error);
    }
  }, [documentId]);

  const endSession = useCallback(() => {
    if (!sessionStartedRef.current) return;
    
    try {
      const endedSession = endWritingSession(documentId);
      if (endedSession) {
        console.log('Ended writing session:', endedSession.id, 'total words added:', endedSession.wordsAdded);
      }
      setCurrentSession(null);
      setSessionWordsAdded(0);
      sessionStartedRef.current = false;
    } catch (error) {
      console.error('Failed to end writing session:', error);
    }
  }, [documentId]);

  // Load document data
  const loadDocumentDataInternal = useCallback((docId: string): TiptapDocumentData => {

    try {
      const data = loadDocumentData(docId);
      console.log('Loaded document data from storage:', {
        documentId: docId,
        content: data.content,
        wordCount: data.wordCount,
      });
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
      return getEmptyDocumentData();
    }
  }, []);

  // Save document data
  const saveDocumentData = useCallback((content: TiptapValue, docId: string) => {
    if (!content) {
      return { wordCount: 0, charactersWithSpaces: 0, charactersWithoutSpaces: 0 };
    }

    try {
      const stats = saveDocumentContent(docId, content);
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
  const updateContent = useCallback((newContent: TiptapValue, immediateStats?: TiptapTextStats) => {
    setContent(newContent);

    // Track which document this content belongs to
    debouncedContentDocumentIdRef.current = documentId;

    // Use provided stats for immediate update, or calculate if not provided
    let stats: TiptapTextStats;
    if (immediateStats) {
      // Use stats directly from the editor for immediate updates
      stats = immediateStats;
      setTextStats(stats);
    } else {
      // Fallback to calculating stats if not provided
      stats = calculateTextStats(newContent);
      setTextStats(stats);
    }

    // Update writing session with current word count
    updateSession(stats.wordCount);
  }, [documentId, updateSession]);

  // Load content when document ID changes
  useEffect(() => {

    if (currentDocumentIdRef.current !== documentId) {
      setIsLoading(true);

      // End current session before switching documents
      if (currentDocumentIdRef.current) {
        endSession();
      }

      // Save current document before switching (if we have one)
      if (currentDocumentIdRef.current && lastSavedContentRef.current) {
        saveDocumentData(lastSavedContentRef.current, currentDocumentIdRef.current);
      }

      // Load new document
      const documentData = loadDocumentDataInternal(documentId);

      // Update state
      currentDocumentIdRef.current = documentId;
      lastSavedContentRef.current = documentData.content;
      setContent(documentData.content);
      const loadedStats = {
        wordCount: documentData.wordCount,
        charactersWithSpaces: documentData.charactersWithSpaces,
        charactersWithoutSpaces: documentData.charactersWithoutSpaces,
      };
      setTextStats(loadedStats);

      // Check if there's an existing active session or start a new one
      const existingSession = getCurrentSession(documentId);
      if (existingSession) {
        setCurrentSession(existingSession);
        setSessionWordsAdded(existingSession.wordsAdded);
        sessionStartedRef.current = true;
        console.log('Resumed existing session:', existingSession.id);
      } else {
        // Start new session with current word count as baseline
        startSession(loadedStats.wordCount);
      }

      setIsLoading(false);
    }
  }, [documentId, endSession, startSession]);

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
      // End session before unmounting
      if (sessionStartedRef.current) {
        endSession();
      }
      
      if (currentDocumentIdRef.current && lastSavedContentRef.current) {
        saveDocumentContent(currentDocumentIdRef.current, lastSavedContentRef.current);
      }
    };
  }, [endSession]);

  return {
    content,
    setContent: updateContent,
    textStats,
    isLoading,
    saveNow,
    loadDocumentData: loadDocumentDataInternal,
    saveDocumentData,
    // Session tracking
    currentSession,
    sessionWordsAdded,
    startSession,
    endSession,
  };
}
