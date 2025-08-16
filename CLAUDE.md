# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # Start web dev server at localhost:5000
bun run tauri:dev    # Start Tauri desktop app in development mode

# Build & Production
bun run build        # Build web version with TypeScript check
bun run tauri:build  # Build desktop app for distribution

# Database (PostgreSQL + Prisma)
bun run db:generate  # Generate Prisma client to src/generated/prisma/
bun run db:push      # Push schema changes to database
bun run db:migrate   # Create and apply migrations
bun run db:studio    # Open Prisma Studio GUI

# Code Quality
bun run lint         # Run ESLint
npx tsc --noEmit     # Type check without emitting files
```

## Architecture

### Core Data Flow
Projects → Chapters → Documents

- **Projects**: Top-level writing projects with status tracking, word goals, and deadlines
- **Chapters**: Ordered sections within projects, can contain multiple documents
- **Documents**: Individual writing pieces that can belong to chapters or exist as drafts
- **Drafts**: Documents without a chapter assignment, stored separately in the sidebar

### State Management Pattern
The app uses React Context for global state with a repository pattern for data persistence:

1. **ProjectContext** (`src/contexts/project-context.tsx`): Central data hub that coordinates between UI and storage
2. **Repository Layer** (`src/lib/repositories/`): Abstracts data storage (currently localStorage, designed for easy swap to API/database)
3. **Custom Hooks**: `useProjects`, `useProjectData` provide typed access to data
4. **Local Storage Keys**: `zeyn-projects`, `zeyn-chapters`, `zeyn-documents`, `zeyn-tags`, `zeyn-sidebar-collapsed`

### Editor Architecture (Plate.js)
The editor is built as a plugin system where each feature is a "kit":

- **Editor Kits** (`src/components/editor/plugins/`): Modular plugins that compose the editor
- **PlateEditor** (`src/components/editor/plate-editor.tsx`): Main editor component that orchestrates all plugins
- **Editor State**: Managed by Plate.js internally, serialized to JSON for storage in documents

Key plugin kits:
- `ai-kit.tsx`: OpenAI integration for writing assistance
- `basic-blocks-kit.tsx`: Paragraphs, headings, blockquotes
- `basic-marks-kit.tsx`: Bold, italic, underline, etc.
- `suggestion-kit.tsx`: AI-powered text suggestions

### Routing Structure
```
/projects                           # Project listing
/projects/:id                       # Project overview
/projects/:id/chapters              # All chapters view  
/projects/:id/chapters/:chapterId   # Chapter detail (with editable title)
/projects/:id/chapters/:chapterId/documents/:documentId  # Document editor
/projects/:id/drafts                # All drafts view
/projects/:id/drafts/:draftId       # Draft document editor
/settings                           # Application settings
```

### UI Component Hierarchy
- **AppLayout**: Main layout wrapper with navigation
- **ProjectLayout**: Sidebar + content area for project pages
  - Sidebar: Collapsible, persists state, shows drafts + chapters
  - Content: Outlet for nested routes
- **Document/Chapter Views**: Load data via hooks, render with Plate editor

### Key Patterns

**Creating New Content Flow** (Notion-like):
- Clicking "+" immediately creates and navigates to new item
- Title field auto-focuses for immediate editing
- Pressing Enter in title moves focus to content body

**Sidebar State Persistence**:
- Collapsed state saved to localStorage
- Expanded chapters tracked in component state
- Draft/chapter areas can be independently expanded

**Document Saving**:
- Auto-save on content change (debounced)
- Word count updates propagate up to chapter and project levels
- Status tracking (draft, in_progress, completed)

## Technology Stack Details

- **Tauri 2.7.0**: Desktop wrapper providing native app experience
- **React 19.1.0**: Latest React with TypeScript
- **Plate.js**: Extensible rich-text editor framework built on Slate
- **Prisma ORM**: Type-safe database client (schema in `/prisma/schema.prisma`)
- **Tailwind + shadcn/ui**: Utility-first CSS with pre-built components
- **Bun**: Fast JavaScript runtime and package manager

## AI Integration

The app includes OpenAI integration through:
- `/src/app/api/ai/copilot.ts`: Writing suggestions endpoint
- `/src/app/api/ai/command.ts`: Text transformation commands
- Requires `OPENAI_API_KEY` environment variable
- Uses Vercel AI SDK for streaming responses

## Claude Custom Actions

### /save
When the user types `/save`, execute the following:
1. Check git status to see what files have changed
2. Add all modified files to staging
3. Create a commit with a descriptive message based on the changes
4. Push the commit to the remote repository (origin/main)

Example workflow:
```bash
git add -A
git commit -m "feat/fix/style: descriptive message based on changes"
git push origin main
```

The commit message should follow conventional commits format and be descriptive of the actual changes made.