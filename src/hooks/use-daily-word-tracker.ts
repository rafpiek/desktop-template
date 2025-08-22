import { useEffect, useRef, useCallback } from 'react';
import { 
  getTodayWordProgress, 
  addWordsToToday,
  type DailyWordProgress 
} from '@/components/editor/v2/storage/daily-progress-storage';

// Hook to track daily word progress
export function useDailyWordTracker() {
  const previousWordCountRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);

  // Track word count changes and add to daily progress
  const trackWordChange = useCallback((newWordCount: number) => {
    if (!hasInitializedRef.current) {
      // First time - just set the baseline, don't count existing words
      previousWordCountRef.current = newWordCount;
      hasInitializedRef.current = true;
      console.log(`📊 Initialized word tracker with baseline: ${newWordCount}`);
      return;
    }

    const wordDelta = newWordCount - previousWordCountRef.current;
    
    if (wordDelta > 0) {
      // Words were added - track them
      addWordsToToday(wordDelta);
      console.log(`➕ Added ${wordDelta} words to daily progress (${previousWordCountRef.current} → ${newWordCount})`);
    } else if (wordDelta < 0) {
      // Words were removed - we don't subtract from daily goals
      console.log(`➖ Words removed: ${Math.abs(wordDelta)} (not subtracting from daily goals)`);
    }
    
    previousWordCountRef.current = newWordCount;
  }, []);

  // Get current daily progress
  const getDailyProgress = useCallback((): DailyWordProgress => {
    return getTodayWordProgress();
  }, []);

  // Reset for new document (when switching documents)
  const resetForNewDocument = useCallback((newWordCount: number) => {
    previousWordCountRef.current = newWordCount;
    hasInitializedRef.current = true;
    console.log(`🔄 Reset word tracker for new document: ${newWordCount}`);
  }, []);

  return {
    trackWordChange,
    getDailyProgress,
    resetForNewDocument,
  };
}