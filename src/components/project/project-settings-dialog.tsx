import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, FolderOpen, Download, ExternalLink, CheckCircle, XCircle, AlertCircle, Loader2, FolderOpenIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBackupPath } from '@/hooks/use-backup-path';
import { useBackup } from '@/hooks/use-backup';
import { openDirectory, canOpenDirectory } from '@/lib/services/open-directory';
import type { Project } from '@/lib/types/project';

interface ProjectSettingsDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab = 'general' | 'backup';

export function ProjectSettingsDialog({ project, open, onOpenChange }: ProjectSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { backupPath } = useBackupPath();
  const { isBackingUp, progress, lastResult, backupProject, cancelBackup, resetState } = useBackup();

  const handleBackupNow = async () => {
    resetState();
    const result = await backupProject(project, {
      includeDrafts: true,
      includeChapters: true
    });
    
    if (!result.success) {
      console.error('Backup failed:', result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">Project Settings</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure settings for <span className="font-medium">"{project.title}"</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex min-h-[500px] overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 border-r p-4 flex flex-col">
            <nav className="space-y-1">
              <Button
                variant={activeTab === 'general' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab('general')}
                className={cn(
                  "w-full justify-start px-3 py-2.5 h-auto text-sm",
                  activeTab === 'general' && "bg-accent text-accent-foreground"
                )}
              >
                <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                General
              </Button>
              <Button
                variant={activeTab === 'backup' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab('backup')}
                className={cn(
                  "w-full justify-start px-3 py-2.5 h-auto text-sm",
                  activeTab === 'backup' && "bg-accent text-accent-foreground"
                )}
              >
                <FolderOpen className="h-4 w-4 mr-3 flex-shrink-0" />
                Backup
              </Button>
            </nav>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 bg-background p-6 overflow-auto">
            {activeTab === 'general' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-lg font-semibold mb-2">General Settings</h3>
                  <p className="text-muted-foreground text-sm">
                    Configure general project preferences.
                  </p>
                </div>
                
                <Card>
                  <CardHeader className="px-4 pt-4 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      Project Preferences
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure project-specific settings and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground">
                      Project-specific settings will be configured here in future updates.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Project Backup</h3>
                  <p className="text-muted-foreground text-sm">
                    Create a backup of this project to your configured backup directory.
                  </p>
                </div>
                
                <Card>
                  <CardHeader className="px-4 pt-4 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Download className="h-5 w-5 flex-shrink-0" />
                      Backup Actions
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Export this project as markdown and JSON files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-4">
                    {backupPath ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-2">
                            <FolderOpen className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                Backup directory configured
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-300 font-mono mt-1">
                                {backupPath}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress UI */}
                        {isBackingUp && progress && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{progress.status}</span>
                              <span className="font-medium">{progress.percentage}%</span>
                            </div>
                            <Progress value={progress.percentage} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Processing {progress.current} of {progress.total} files</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelBackup}
                                className="h-auto p-1 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Success Result */}
                        {lastResult && lastResult.success && !isBackingUp && (
                          <div className="space-y-3">
                            <Alert className="border-green-200 dark:border-green-800">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <AlertDescription className="text-green-800 dark:text-green-200">
                                Backup completed successfully! 
                                {lastResult.filesBackedUp && ` (${lastResult.filesBackedUp} files backed up)`}
                              </AlertDescription>
                            </Alert>
                            {lastResult.backupPath && canOpenDirectory() && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const fullPath = `${backupPath}/${lastResult.backupPath}`;
                                  await openDirectory(fullPath);
                                }}
                                className="gap-2"
                              >
                                <FolderOpenIcon className="h-4 w-4" />
                                Open Backup Folder
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {/* Error Result */}
                        {lastResult && !lastResult.success && !isBackingUp && (
                          <Alert className="border-red-200 dark:border-red-800">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertDescription className="text-red-800 dark:text-red-200">
                              Backup failed: {lastResult.error || 'Unknown error'}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <Button 
                            onClick={handleBackupNow}
                            disabled={isBackingUp}
                            className="gap-2"
                            size="sm"
                          >
                            {isBackingUp ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Backing up...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                {lastResult && !lastResult.success ? 'Retry Backup' : 'Backup Now'}
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Export "{project.name}" to the backup directory
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-start gap-2">
                            <FolderOpen className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                No backup directory configured
                              </p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Configure a backup directory in app settings to enable project backups.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <Button 
                            onClick={handleBackupNow}
                            disabled={true}
                            className="gap-2"
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-4 w-4" />
                            Backup Now
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="gap-1 px-0 h-auto text-xs"
                            onClick={() => {
                              onOpenChange(false);
                              // Navigate to settings would go here
                              window.location.href = '/settings/backup';
                            }}
                          >
                            Configure backup directory
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground">
                        Backup will create markdown files for documents and JSON metadata for project structure.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}