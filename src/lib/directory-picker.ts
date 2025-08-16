// File System Access API types (since TypeScript might not have full support)
interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  requestPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>;
  queryPermission(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }) => Promise<FileSystemDirectoryHandle>;
  }
}

export interface DirectoryInfo {
  name: string;
  path?: string; // For Tauri
  handle?: FileSystemDirectoryHandle; // For web
}

export interface BrowserCapability {
  supportsTauri: boolean;
  supportsFileSystemAccess: boolean;
  supportsDirectoryPicker: boolean;
  browserName: string;
}

export function detectBrowserCapability(): BrowserCapability {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Tauri
  const supportsTauri = typeof window !== 'undefined' && (
    !!(window as any).__TAURI_INTERNALS__ ||
    !!(window as any).__TAURI_METADATA__ ||
    userAgent.includes('tauri')
  );

  // Check for File System Access API
  const supportsFileSystemAccess = 'showDirectoryPicker' in window;
  
  // Browser detection
  let browserName = 'unknown';
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    browserName = 'Chrome';
  } else if (userAgent.includes('edg')) {
    browserName = 'Edge';
  } else if (userAgent.includes('firefox')) {
    browserName = 'Firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    browserName = 'Safari';
  }

  return {
    supportsTauri,
    supportsFileSystemAccess,
    supportsDirectoryPicker: supportsTauri || supportsFileSystemAccess,
    browserName
  };
}

export async function openDirectoryPicker(): Promise<DirectoryInfo | null> {
  const capability = detectBrowserCapability();
  
  if (capability.supportsTauri) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Backup Folder'
      });

      if (selected && typeof selected === 'string') {
        return {
          name: selected.split('/').pop() || selected.split('\\').pop() || 'Selected Folder',
          path: selected
        };
      }
    } catch (error) {
      console.error('Failed to open Tauri directory picker:', error);
    }
  } else if (capability.supportsFileSystemAccess) {
    try {
      const handle = await window.showDirectoryPicker!({
        mode: 'readwrite',
        startIn: 'documents'
      });

      // Request permission
      const permission = await handle.requestPermission({ mode: 'readwrite' });
      
      if (permission === 'granted') {
        return {
          name: handle.name,
          handle
        };
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to open web directory picker:', error);
      }
    }
  }
  
  return null;
}

// IndexedDB storage for directory handles
const DB_NAME = 'zeyn-backup';
const DB_VERSION = 1;
const STORE_NAME = 'directory-handles';

export async function storeDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      store.put(handle, 'backup-directory');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const getRequest = store.get('backup-directory');
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      
      getRequest.onerror = () => resolve(null);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      resolve(null);
    };
  });
}

export async function clearStoredDirectoryHandle(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      store.delete('backup-directory');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      resolve();
    };
  });
}