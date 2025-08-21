import { useRef, useCallback } from 'react';
import { useGoalProgress } from '@/contexts/goal-progress-context';

/**
 * Simple hook to track words added during typing sessions
 */
export function useDailyWordTracking() {
  const { dailyProgress, addWords } = useGoalProgress();
  const lastWordCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  const trackWordCount = useCallback((newWordCount: number) => {
    if (!isInitializedRef.current) {
      // First time - just set baseline
      lastWordCountRef.current = newWordCount;
      isInitializedRef.current = true;
      console.log(`📊 Word tracking initialized with baseline: ${newWordCount}`);
      return;
    }

    const wordsAdded = newWordCount - lastWordCountRef.current;
    
    if (wordsAdded > 0) {
      // Words were added - track them
      addWords(wordsAdded);
      console.log(`➕ Added ${wordsAdded} words (${lastWordCountRef.current} → ${newWordCount})`);
    } else if (wordsAdded < 0) {
      console.log(`➖ Words removed: ${Math.abs(wordsAdded)} (not subtracting from daily goal)`);
    }
    
    lastWordCountRef.current = newWordCount;
  }, [addWords]);

  const resetForDocument = useCallback((wordCount: number) => {
    lastWordCountRef.current = wordCount;
    isInitializedRef.current = true;
    console.log(`🔄 Reset word tracking for new document: ${wordCount}`);
  }, []);

  return {
    trackWordCount,
    resetForDocument,
    dailyProgress: dailyProgress.totalWords
  };
}