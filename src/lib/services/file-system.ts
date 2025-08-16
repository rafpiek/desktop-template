import { detectBrowserCapability } from '@/lib/directory-picker';

// Type definitions
export interface FileSystemService {
  createDirectory(path: string): Promise<void>;
  writeTextFile(path: string, content: string): Promise<void>;
  writeJsonFile(path: string, data: any): Promise<void>;
  exists(path: string): Promise<boolean>;
  joinPath(...parts: string[]): string;
}

// Tauri implementation
class TauriFileSystem implements FileSystemService {
  private baseHandle: string | null = null;

  constructor(baseHandle?: string) {
    this.baseHandle = baseHandle || null;
  }

  async createDirectory(path: string): Promise<void> {
    const { mkdir } = await import('@tauri-apps/plugin-fs');
    const fullPath = this.baseHandle ? this.joinPath(this.baseHandle, path) : path;
    
    try {
      await mkdir(fullPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
      console.log(`Directory might already exist: ${fullPath}`);
    }
  }

  async writeTextFile(path: string, content: string): Promise<void> {
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    const fullPath = this.baseHandle ? this.joinPath(this.baseHandle, path) : path;
    
    // Ensure parent directory exists
    const parentPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
    if (parentPath) {
      await this.createDirectory(parentPath);
    }
    
    await writeTextFile(fullPath, content);
  }

  async writeJsonFile(path: string, data: any): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    await this.writeTextFile(path, jsonContent);
  }

  async exists(path: string): Promise<boolean> {
    const { exists } = await import('@tauri-apps/plugin-fs');
    const fullPath = this.baseHandle ? this.joinPath(this.baseHandle, path) : path;
    return await exists(fullPath);
  }

  joinPath(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/');
  }
}

// Web File System Access API implementation
class WebFileSystem implements FileSystemService {
  private directoryHandle: FileSystemDirectoryHandle;

  constructor(directoryHandle: FileSystemDirectoryHandle) {
    this.directoryHandle = directoryHandle;
  }

  async createDirectory(path: string): Promise<void> {
    const parts = path.split('/').filter(Boolean);
    let currentHandle = this.directoryHandle;

    for (const part of parts) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
      } catch (error) {
        throw new Error(`Failed to create directory: ${path}`);
      }
    }
  }

  async writeTextFile(path: string, content: string): Promise<void> {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop();
    
    if (!fileName) {
      throw new Error('Invalid file path');
    }

    // Navigate to the parent directory
    let currentHandle = this.directoryHandle;
    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
    }

    // Create and write to the file
    const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async writeJsonFile(path: string, data: any): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    await this.writeTextFile(path, jsonContent);
  }

  async exists(path: string): Promise<boolean> {
    const parts = path.split('/').filter(Boolean);
    let currentHandle = this.directoryHandle;

    try {
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = i === parts.length - 1;

        if (isLastPart) {
          // Check if it's a file or directory
          try {
            await currentHandle.getFileHandle(part);
            return true;
          } catch {
            await currentHandle.getDirectoryHandle(part);
            return true;
          }
        } else {
          currentHandle = await currentHandle.getDirectoryHandle(part);
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  joinPath(...parts: string[]): string {
    return parts
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/');
  }
}

// Factory function to create appropriate file system service
export async function createFileSystemService(basePathOrHandle?: string | FileSystemDirectoryHandle): Promise<FileSystemService> {
  const capability = detectBrowserCapability();

  if (capability.supportsTauri) {
    return new TauriFileSystem(typeof basePathOrHandle === 'string' ? basePathOrHandle : undefined);
  } else if (capability.supportsFileSystemAccess && basePathOrHandle && typeof basePathOrHandle !== 'string') {
    return new WebFileSystem(basePathOrHandle as FileSystemDirectoryHandle);
  } else {
    throw new Error('No file system access available. Please use a supported browser or the desktop app.');
  }
}

// Helper function to get the backup base path
export async function getBackupFileSystem(backupPath: string | FileSystemDirectoryHandle | null): Promise<FileSystemService | null> {
  if (!backupPath) {
    return null;
  }

  try {
    return await createFileSystemService(backupPath);
  } catch (error) {
    console.error('Failed to create file system service:', error);
    return null;
  }
}