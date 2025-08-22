# Zeyn Editor Update Mechanism Implementation Plan

## Research Summary
✅ **Confirmed**: Tauri v2 has excellent built-in update capabilities that support automatic updates without requiring users to manually download DMG files on macOS. The updater plugin provides secure, cryptographically signed updates with a great developer experience.

## Current Project Status
- Using Tauri 2.0.0 with some plugins already installed
- Current version: 0.1.0 
- Missing: updater plugin dependencies and configuration
- Ready for updater integration

## Implementation Plan

### Phase 1: Setup & Dependencies
1. **Add Tauri updater dependencies**
   - Add `tauri-plugin-updater` to `src-tauri/Cargo.toml`
   - Add `@tauri-apps/plugin-updater` to `package.json`
   - Install dependencies with `bun install`

2. **Generate signing keys**
   - Run `bun run tauri signer generate` to create public/private key pair
   - Securely store private key and password (never commit to repo)
   - Add public key to `tauri.conf.json`

### Phase 2: Configuration
3. **Configure Tauri updater settings**
   - Add updater configuration to `tauri.conf.json`
   - Set up update endpoints (will use GitHub releases)
   - Configure permissions and capabilities

4. **Add updater permissions**
   - Update capabilities in `src-tauri/capabilities/main.json`
   - Add required permissions for updater functionality

### Phase 3: Frontend Implementation
5. **Create update UI components**
   - Design non-intrusive update notification (follows shadcn/ui patterns)
   - Create update dialog with progress bar for downloads
   - Implement "Update Now" and "Remind Me Later" options
   - Add settings to control update preferences

6. **Implement update checking logic**
   - Create update service hook (`useUpdateChecker`)
   - Check for updates on app startup (non-blocking)
   - Handle update states: checking, available, downloading, installing
   - Integrate with existing React Context pattern

### Phase 4: Release Infrastructure  
7. **Set up GitHub release automation**
   - Create GitHub Actions workflow for building releases
   - Auto-generate `latest.json` with version info and download URLs
   - Sign release artifacts with private key
   - Upload signed bundles to GitHub releases

8. **Create update endpoint**
   - Host `latest.json` on GitHub releases or static hosting
   - Include version, release notes, platform-specific URLs
   - Add cryptographic signatures for each platform

### Phase 5: Testing & Deployment
9. **Test update flow**
   - Test with development builds and mock updates  
   - Verify signature validation works correctly
   - Test across platforms (macOS, Windows, Linux)
   - Ensure graceful handling of network issues

10. **Production deployment**
    - Update version in `package.json`, `tauri.conf.json`, and `Cargo.toml`
    - Build and sign first release with updater capability
    - Set up monitoring for update success rates

## UI/UX Design Approach
- **Non-disruptive**: Subtle notification in corner, not blocking modals
- **User control**: Settings to disable auto-check or set check frequency  
- **Progress feedback**: Clear progress bars during download/install
- **Respectful timing**: Don't interrupt active writing sessions
- **Security focused**: Clear indication of signed, verified updates

## Expected Benefits
- ✅ Users get updates automatically without manual DMG downloads
- ✅ Secure, cryptographically verified update process
- ✅ Seamless user experience with minimal interruption
- ✅ Easy maintenance and deployment of bug fixes/features
- ✅ Platform-native installation experience on macOS

## Technical Notes
- Updates will be delta-compressed for faster downloads
- Rollback capability built into Tauri updater
- Works with existing build system (`bun run tauri:build`)
- Compatible with current app signing setup

This implementation will provide a professional, secure update experience that matches modern desktop application standards.