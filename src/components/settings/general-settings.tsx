import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">General Settings</h2>
        <p className="text-muted-foreground">
          Configure general application preferences and behavior.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Preferences
          </CardTitle>
          <CardDescription>
            Configure general application settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            General settings will be configured here in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}