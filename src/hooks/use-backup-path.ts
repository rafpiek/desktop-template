import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from './use-local-storage';
import { 
  openDirectoryPicker, 
  detectBrowserCapability, 
  storeDirectoryHandle, 
  getStoredDirectoryHandle, 
  clearStoredDirectoryHandle,
  type BrowserCapability,
  type DirectoryInfo
} from '@/lib/directory-picker';

export function useBackupPath() {
  // Store path for Tauri (string)
  const [backupPath, setBackupPath] = useLocalStorage<string | null>('zeyn-backup-path', null);
  
  // Store directory info for current session
  const [directoryInfo, setDirectoryInfo] = useState<DirectoryInfo | null>(null);
  const [capability, setCapability] = useState<BrowserCapability | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize capability and restore stored directory on mount
  useEffect(() => {
    const initCapability = async () => {
      const browserCapability = detectBrowserCapability();
      setCapability(browserCapability);

      // Restore stored directory based on platform
      if (browserCapability.supportsTauri && backupPath) {
        setDirectoryInfo({
          name: backupPath.split('/').pop() || backupPath.split('\\').pop() || 'Selected Folder',
          path: backupPath
        });
      } else if (browserCapability.supportsFileSystemAccess) {
        try {
          const handle = await getStoredDirectoryHandle();
          if (handle) {
            // Verify permission still exists
            const permission = await handle.queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
              setDirectoryInfo({
                name: handle.name,
                handle
              });
            } else {
              // Permission lost, clear stored handle
              await clearStoredDirectoryHandle();
            }
          }
        } catch (error) {
          console.warn('Failed to restore directory handle:', error);
          await clearStoredDirectoryHandle();
        }
      }
      
      setIsLoading(false);
    };

    initCapability();
  }, [backupPath]);

  const selectBackupPath = useCallback(async (): Promise<void> => {
    if (!capability?.supportsDirectoryPicker) {
      console.warn('Directory picker is not available in this environment');
      return;
    }

    try {
      const selected = await openDirectoryPicker();
      
      if (selected) {
        setDirectoryInfo(selected);
        
        // Store based on platform
        if (selected.path) {
          // Tauri - store path in localStorage
          setBackupPath(selected.path);
        } else if (selected.handle) {
          // Web - store handle in IndexedDB
          await storeDirectoryHandle(selected.handle);
        }
      }
    } catch (error) {
      console.error('Failed to select backup path:', error);
    }
  }, [capability, setBackupPath]);

  const clearBackupPath = useCallback(async (): Promise<void> => {
    setDirectoryInfo(null);
    setBackupPath(null);
    
    // Clear web storage if applicable
    if (capability?.supportsFileSystemAccess) {
      try {
        await clearStoredDirectoryHandle();
      } catch (error) {
        console.warn('Failed to clear stored directory handle:', error);
      }
    }
  }, [capability, setBackupPath]);

  // Get display path for UI
  const getDisplayPath = useCallback(() => {
    if (!directoryInfo) return null;
    
    if (directoryInfo.path) {
      return directoryInfo.path;
    } else if (directoryInfo.handle) {
      return `📁 ${directoryInfo.name}`;
    }
    
    return null;
  }, [directoryInfo]);

  return {
    backupPath: getDisplayPath(),
    directoryInfo,
    capability,
    isLoading,
    selectBackupPath,
    clearBackupPath,
    isAvailable: capability?.supportsDirectoryPicker || false,
    platformInfo: {
      isTauri: capability?.supportsTauri || false,
      isWeb: capability?.supportsFileSystemAccess || false,
      browserName: capability?.browserName || 'unknown'
    }
  };
}