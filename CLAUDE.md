# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this desktop app template repository.

## Commands

```bash
# Development
bun run dev          # Start web dev server at localhost:5173
bun run tauri:dev    # Start Tauri desktop app in development mode

IMPORTANT! Never run dev server or tauri dev. Always ask user to do it on it's own.

# Build & Production
bun run build        # Build web version with TypeScript check
bun run tauri:build  # Build desktop app for distribution

# Code Quality
bun run lint         # Run ESLint
npx tsc --noEmit     # Type check without emitting files
```

## Architecture

This is a desktop app template built with:
- **Frontend**: React 19 + TypeScript + Vite
- **Desktop**: Tauri 2.7 for native desktop capabilities
- **UI**: Tailwind CSS + shadcn/ui components
- **Editor**: Tiptap for rich text editing
- **Charts**: Recharts for data visualization
- **Routing**: React Router for page navigation

### Page Structure
```
/                    # Home dashboard
/about               # Template information
/editor              # Tiptap rich text editor demo
/stats               # Charts and data visualization
/settings/general    # App settings - general preferences
/settings/advanced   # App settings - advanced options
```

### Key Components
- **AppLayout** (`src/components/app-layout.tsx`): Main layout with navigation
- **ThemeProvider** (`src/components/theme-provider.tsx`): Dark/light theme management
- **TiptapEditor** (`src/components/editor/v2/tiptap-editor.tsx`): Rich text editor
- **UI Components** (`src/components/ui/`): shadcn/ui component library

### State Management
- **Theme**: Managed by ThemeProvider using localStorage persistence
- **Settings**: Local state in settings components
- **Mock Data**: Static mock data for stats/charts demonstration

### File Organization
- `/src/pages/` - Page components (about, editor, settings, stats)
- `/src/components/` - Reusable React components
- `/src/components/ui/` - shadcn/ui components
- `/src/hooks/` - Custom React hooks (debounce, localStorage, etc.)
- `/src/lib/utils.ts` - Utility functions (cn, etc.)
- `/src/styles/` - CSS files

### Tauri Integration
- **Desktop Features**: File system access, native notifications
- **Security**: Secure API with capability-based permissions
- **Cross-platform**: Windows, macOS, Linux support
- **Configuration**: `/src-tauri/tauri.conf.json`

## Template Usage

This template is designed to be:
1. **Clean starting point** for desktop apps
2. **Modern tech stack** with latest versions
3. **Well-structured** with clear patterns
4. **Customizable** for different use cases

### Adding New Pages
1. Create component in `/src/pages/`
2. Add route to `/src/App.tsx`
3. Update navigation if needed

### Customizing UI
- Modify Tailwind config for design tokens
- Use shadcn/ui for consistent components
- Theme system supports light/dark modes

### Editor Integration
- Basic Tiptap setup with essential extensions
- Easily extensible with additional features
- See `/src/pages/editor.tsx` for usage example

### Charts & Data
- Recharts integration for data visualization
- Multiple chart types (line, bar, area, pie)
- Responsive design with proper containers
- See `/src/pages/stats.tsx` for examples

## Development Notes

- Uses Bun as package manager and runtime
- TypeScript strict mode enabled
- ESLint configured for React + TypeScript
- Hot reload works for both web and desktop modes
- File changes trigger automatic rebuilds