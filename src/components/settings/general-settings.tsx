export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">General Settings</h2>
        <p className="text-muted-foreground">
          Configure general application preferences and behavior.
        </p>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-6 border-2 border-dashed">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-muted-foreground">
            General Settings Content
          </h3>
          <p className="text-sm text-muted-foreground">
            This section will contain general application settings such as:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mt-4">
            <li>• Application language preferences</li>
            <li>• Default file locations</li>
            <li>• Auto-save settings</li>
            <li>• Backup configurations</li>
            <li>• UI preferences</li>
          </ul>
        </div>
      </div>
    </div>
  )
}