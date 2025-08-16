import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { useBackupPath } from "@/hooks/use-backup-path";

export function BackupSettings() {
  const { 
    backupPath, 
    selectBackupPath, 
    clearBackupPath, 
    isAvailable, 
    isLoading,
    platformInfo,
    capability 
  } = useBackupPath();

  const renderCapabilityBadge = () => {
    if (!capability) return null;

    if (platformInfo.isTauri) {
      return (
        <Badge variant="default" className="text-xs">
          Desktop app
        </Badge>
      );
    } else if (platformInfo.isWeb) {
      return (
        <Badge variant="secondary" className="text-xs">
          {platformInfo.browserName} web
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="text-xs">
          Not supported in {platformInfo.browserName}
        </Badge>
      );
    }
  };

  const renderUnsupportedMessage = () => {
    if (isAvailable) return null;

    return (
      <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Directory picker not available
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            {platformInfo.browserName === 'Firefox' && 
              'Firefox doesn\'t support the File System Access API yet. Use Chrome or Edge for web directory picker.'
            }
            {platformInfo.browserName === 'Safari' && 
              'Safari has limited support for directory picker. Use Chrome or Edge for best experience.'
            }
            {!['Firefox', 'Safari', 'Chrome', 'Edge'].includes(platformInfo.browserName) && 
              'This browser doesn\'t support directory picker. Use the desktop app or Chrome/Edge browser.'
            }
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Backup Settings</h2>
          <p className="text-muted-foreground">
            Configure local backup settings for your projects and documents.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Backup Configuration
            </CardTitle>
            <CardDescription>
              Configure local backup settings for your projects and documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Backup Settings</h2>
        <p className="text-muted-foreground">
          Configure local backup settings for your projects and documents.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Backup Configuration
          </CardTitle>
          <CardDescription>
            Configure local backup settings for your projects and documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderUnsupportedMessage()}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Backup Folder</label>
            <div className="flex items-center gap-3">
              {backupPath ? (
                <div className="flex-1 flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-mono truncate" title={backupPath}>
                    {backupPath}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearBackupPath}
                    className="ml-auto flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1 p-3 bg-muted/50 rounded-md border-2 border-dashed">
                  <span className="text-sm text-muted-foreground">
                    No backup folder selected
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={selectBackupPath}
              disabled={!isAvailable}
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              {backupPath ? 'Change Folder' : 'Select Folder'}
            </Button>
            
            {renderCapabilityBadge()}
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selected folder will be used to store local backups of your projects as markdown and JSON files.
            </p>
            
            {isAvailable && (
              <div className="text-xs text-muted-foreground space-y-1">
                {platformInfo.isTauri && (
                  <p>✅ Full file system access via desktop app</p>
                )}
                {platformInfo.isWeb && (
                  <p>✅ Web directory access via {platformInfo.browserName} File System Access API</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}