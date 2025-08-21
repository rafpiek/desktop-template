import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/app-layout"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { GeneralSettings } from "@/components/settings/general-settings"
import { BackupSettings } from "@/components/settings/backup-settings"
import { EditorSettings } from "@/components/settings/editor-settings"
import { AdvancedSettings } from "@/components/settings/advanced-settings"

export default function SettingsPage() {
  return (
    <AppLayout showNavigation={true}>
      <SettingsLayout>
        <Routes>
          <Route index element={<Navigate to="general" replace />} />
          <Route path="general" element={<GeneralSettings />} />
          <Route path="backup" element={<BackupSettings />} />
          <Route path="editor" element={<EditorSettings />} />
          <Route path="advanced" element={<AdvancedSettings />} />
        </Routes>
      </SettingsLayout>
    </AppLayout>
  )
}