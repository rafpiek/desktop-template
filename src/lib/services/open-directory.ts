import { detectBrowserCapability } from '@/lib/directory-picker';
import { invoke } from '@tauri-apps/api/core';

/**
 * Open a directory in the system file explorer
 */
export async function openDirectory(path: string): Promise<boolean> {
  const capability = detectBrowserCapability();

  if (capability.supportsTauri) {
    try {
      // Use our custom Tauri command to open the folder
      await invoke('open_folder', { path });
      return true;
    } catch (error) {
      console.error('Failed to open directory:', error);
      return false;
    }
  } else {
    // Web browsers can't directly open local directories for security reasons
    // We could potentially show the path and let users copy it
    console.log('Directory path:', path);
    return false;
  }
}

/**
 * Check if opening directories is supported
 */
export function canOpenDirectory(): boolean {
  const capability = detectBrowserCapability();
  return capability.supportsTauri;
}