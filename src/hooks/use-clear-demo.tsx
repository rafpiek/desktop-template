import { useEffect } from 'react';

export function useClearDemo(enabled: boolean = false) {
  useEffect(() => {
    if (enabled) {
      // Clear all localStorage data
      const keysToRemove = [
        'zeyn-projects',
        'zeyn-chapters', 
        'zeyn-documents',
        'zeyn-tags',
        'zeyn-writing-goals',
        'zeyn-goal-progress',
        'zeyn-goal-settings',
        'zeyn-sidebar-collapsed'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('✅ Demo data cleared');
      // Don't reload - let the seeder handle that
    }
  }, [enabled]);
}