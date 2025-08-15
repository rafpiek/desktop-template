# Database Implementation Plan: Zeyn + Supabase + Prisma

## Overview

This document outlines the complete migration plan for integrating Supabase with Prisma ORM in the Zeyn writing app. The goal is to replace localStorage with a cloud database while maintaining the current clean architecture and adding multi-device sync capabilities.

## Current Architecture Analysis

### Existing Stack
- ✅ **React 19 + Vite 5** - Modern React app with Vite bundler
- ✅ **Tauri 2.7** - Desktop wrapper (Rust backend)
- ✅ **Prisma ORM** already configured with PostgreSQL schema
- ✅ **localStorage-based persistence** with clean repository pattern
- ❌ **No Next.js** - `src/app/api/` routes are obsolete artifacts and should be removed

### Current Data Flow
```
React Components → Context (ProjectContext) → Custom Hooks → localStorage
```

### Target Architecture
```
React Components → Context → Custom Hooks → Repository Classes → Prisma Client → Supabase PostgreSQL
```

## Implementation Strategy

### Phase 1: Cleanup & Setup (Days 1-2)

#### 1.1 Remove Obsolete API Routes
```bash
# Remove these obsolete directories
rm -rf src/app/
```

#### 1.2 Install Dependencies
```bash
npm install @supabase/supabase-js
```

#### 1.3 Environment Configuration
Create/update `.env`:
```bash
# Supabase Database Connection
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Vite environment variables (prefixed with VITE_)
VITE_SUPABASE_URL="https://[project-ref].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_OPENAI_API_KEY="your-openai-key"
```

#### 1.4 Update AI Client (Remove API Dependencies)
Create `src/lib/ai-client.ts`:
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Safe for desktop apps
})

export { openai }
```

### Phase 2: Supabase & Prisma Configuration (Days 3-4)

#### 2.1 Supabase Client Setup
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
```

#### 2.2 Updated Prisma Schema
Update `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// User model (synced with Supabase auth.users)
model User {
  id        String   @id // matches Supabase auth.users.id
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Writing data
  projects  Project[]
  
  @@map("users")
}

// Updated Project model with userId
model Project {
  id          String        @id @default(cuid())
  userId      String        // Foreign key to User
  name        String
  description String?
  content     Json          @default("[]")
  wordCount   Int           @default(0)
  status      ProjectStatus @default(draft)
  label       ProjectLabel
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Goals & settings
  targetWordCount Int?
  deadline        DateTime?
  isFavorite     Boolean @default(false)
  isArchived     Boolean @default(false)
  genre          String?
  notes          String?
  
  // Relationships
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags      ProjectTag[]
  chapters  Chapter[]
  documents Document[]
  
  @@map("projects")
}

model Chapter {
  id          String  @id @default(cuid())
  title       String
  description String?
  order       Int
  isCompleted Boolean @default(false)
  wordCount   Int     @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  projectId String
  project   Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  documents Document[]
  
  @@unique([projectId, order])
  @@map("chapters")
}

model Document {
  id          String         @id @default(cuid())
  title       String
  content     Json           @default("[]")
  wordCount   Int            @default(0)
  status      DocumentStatus @default(draft)
  isCompleted Boolean        @default(false)
  notes       String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  chapterId String?
  chapter   Chapter? @relation(fields: [chapterId], references: [id], onDelete: SetNull)
  
  tags ProjectTag[]
  
  @@map("documents")
}

model ProjectTag {
  id       String @id @default(cuid())
  name     String @unique
  color    String?
  
  projects  Project[]
  documents Document[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("project_tags")
}

// Existing enums remain unchanged
enum ProjectStatus {
  draft
  in_progress
  paused
  completed
  published
  archived
}

enum ProjectLabel {
  novel
  short_story
  poetry
  essay
  screenplay
  research
  journal
  outline
  character
  worldbuilding
}

enum DocumentStatus {
  draft
  review
  complete
  archived
}
```

#### 2.3 Row Level Security Setup
Run in Supabase SQL Editor:
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can only access own data" ON users
  FOR ALL USING (auth.uid()::text = id);

CREATE POLICY "Users can only access own projects" ON projects
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only access own chapters" ON chapters
  FOR ALL USING (auth.uid()::text = (
    SELECT user_id FROM projects WHERE id = project_id
  ));

CREATE POLICY "Users can only access own documents" ON documents
  FOR ALL USING (auth.uid()::text = (
    SELECT user_id FROM projects WHERE id = project_id
  ));

-- Project tags can be accessed by anyone (or restrict as needed)
CREATE POLICY "Anyone can read project tags" ON project_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can manage tags on their projects" ON project_tags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM projects p 
    JOIN project_tags_projects ptp ON p.id = ptp.project_id 
    WHERE ptp.tag_id = project_tags.id 
    AND p.user_id = auth.uid()::text
  ));
```

### Phase 3: Authentication Layer (Days 5-6)

#### 3.1 Authentication Hook
Create `src/hooks/use-auth.ts`:
```typescript
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
```

#### 3.2 Auth Context Provider
Create `src/contexts/auth-context.tsx`:
```typescript
import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
```

### Phase 4: Repository Layer (Days 7-8)

#### 4.1 Base Repository Class
Create `src/lib/repositories/base-repository.ts`:
```typescript
import { PrismaClient } from '@/generated/prisma'

export abstract class BaseRepository {
  constructor(
    protected prisma: PrismaClient,
    protected userId: string
  ) {}

  protected ensureUserOwnership() {
    if (!this.userId) {
      throw new Error('User not authenticated')
    }
  }
}
```

#### 4.2 Project Repository
Create `src/lib/repositories/project-repository.ts`:
```typescript
import { BaseRepository } from './base-repository'
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/lib/types/project'

export class ProjectRepository extends BaseRepository {
  async getProjects(): Promise<Project[]> {
    this.ensureUserOwnership()
    
    return await this.prisma.project.findMany({
      where: { userId: this.userId },
      include: {
        tags: true,
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            documents: true,
          },
        },
        documents: {
          where: { chapterId: null }, // Only draft documents
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    this.ensureUserOwnership()
    
    return await this.prisma.project.create({
      data: {
        ...input,
        userId: this.userId,
      },
      include: {
        tags: true,
        chapters: true,
        documents: true,
      },
    })
  }

  async updateProject(input: UpdateProjectInput): Promise<Project> {
    this.ensureUserOwnership()
    
    return await this.prisma.project.update({
      where: { 
        id: input.id,
        userId: this.userId, // Ensure user owns this project
      },
      data: input,
      include: {
        tags: true,
        chapters: true,
        documents: true,
      },
    })
  }

  async deleteProject(id: string): Promise<void> {
    this.ensureUserOwnership()
    
    await this.prisma.project.delete({
      where: { 
        id,
        userId: this.userId, // Ensure user owns this project
      },
    })
  }

  async getProject(id: string): Promise<Project | null> {
    this.ensureUserOwnership()
    
    return await this.prisma.project.findFirst({
      where: { 
        id,
        userId: this.userId,
      },
      include: {
        tags: true,
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            documents: true,
          },
        },
        documents: {
          where: { chapterId: null },
        },
      },
    })
  }
}
```

#### 4.3 Document Repository
Create `src/lib/repositories/document-repository.ts`:
```typescript
import { BaseRepository } from './base-repository'
import type { Document, CreateDocumentInput, UpdateDocumentInput } from '@/lib/types/project'

export class DocumentRepository extends BaseRepository {
  async getDocuments(projectId: string): Promise<Document[]> {
    this.ensureUserOwnership()
    
    return await this.prisma.document.findMany({
      where: { 
        projectId,
        project: { userId: this.userId }, // Ensure user owns the project
      },
      include: {
        tags: true,
        chapter: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async createDocument(input: CreateDocumentInput): Promise<Document> {
    this.ensureUserOwnership()
    
    // Verify user owns the project
    const project = await this.prisma.project.findFirst({
      where: { id: input.projectId, userId: this.userId },
    })
    if (!project) throw new Error('Project not found or access denied')
    
    return await this.prisma.document.create({
      data: input,
      include: {
        tags: true,
        chapter: true,
      },
    })
  }

  async updateDocument(input: UpdateDocumentInput): Promise<Document> {
    this.ensureUserOwnership()
    
    return await this.prisma.document.update({
      where: { 
        id: input.id,
        project: { userId: this.userId }, // Ensure user owns the project
      },
      data: input,
      include: {
        tags: true,
        chapter: true,
      },
    })
  }

  async deleteDocument(id: string): Promise<void> {
    this.ensureUserOwnership()
    
    await this.prisma.document.delete({
      where: { 
        id,
        project: { userId: this.userId },
      },
    })
  }
}
```

#### 4.4 Chapter Repository
Create `src/lib/repositories/chapter-repository.ts`:
```typescript
import { BaseRepository } from './base-repository'
import type { Chapter, CreateChapterInput, UpdateChapterInput } from '@/lib/types/project'

export class ChapterRepository extends BaseRepository {
  async getChapters(projectId: string): Promise<Chapter[]> {
    this.ensureUserOwnership()
    
    return await this.prisma.chapter.findMany({
      where: { 
        projectId,
        project: { userId: this.userId },
      },
      include: {
        documents: true,
      },
      orderBy: { order: 'asc' },
    })
  }

  async createChapter(input: CreateChapterInput): Promise<Chapter> {
    this.ensureUserOwnership()
    
    // Verify user owns the project
    const project = await this.prisma.project.findFirst({
      where: { id: input.projectId, userId: this.userId },
    })
    if (!project) throw new Error('Project not found or access denied')
    
    // Auto-calculate order if not provided
    if (!input.order) {
      const maxOrder = await this.prisma.chapter.aggregate({
        where: { projectId: input.projectId },
        _max: { order: true },
      })
      input.order = (maxOrder._max.order || 0) + 1
    }
    
    return await this.prisma.chapter.create({
      data: input,
      include: {
        documents: true,
      },
    })
  }

  async updateChapter(input: UpdateChapterInput): Promise<Chapter> {
    this.ensureUserOwnership()
    
    return await this.prisma.chapter.update({
      where: { 
        id: input.id,
        project: { userId: this.userId },
      },
      data: input,
      include: {
        documents: true,
      },
    })
  }

  async deleteChapter(id: string): Promise<void> {
    this.ensureUserOwnership()
    
    await this.prisma.chapter.delete({
      where: { 
        id,
        project: { userId: this.userId },
      },
    })
  }
}
```

### Phase 5: Hook Updates (Days 9-10)

#### 5.1 Updated useProjects Hook
Update `src/hooks/use-projects.ts`:
```typescript
import { useState, useEffect, useCallback, useMemo } from 'react'
import { ProjectRepository } from '@/lib/repositories/project-repository'
import { useAuthContext } from '@/contexts/auth-context'
import { prisma } from '@/lib/prisma'
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/lib/types/project'

export function useProjects() {
  const { user } = useAuthContext()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const repository = useMemo(() => 
    user ? new ProjectRepository(prisma, user.id) : null,
    [user?.id]
  )

  // Load projects when user is available
  useEffect(() => {
    if (!repository) {
      setProjects([])
      setLoading(false)
      return
    }

    const loadProjects = async () => {
      try {
        setLoading(true)
        const userProjects = await repository.getProjects()
        setProjects(userProjects)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [repository])

  const createProject = useCallback(async (input: CreateProjectInput) => {
    if (!repository) throw new Error('Not authenticated')
    
    try {
      const newProject = await repository.createProject(input)
      setProjects(prev => [newProject, ...prev])
      return newProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      throw err
    }
  }, [repository])

  const updateProject = useCallback(async (input: UpdateProjectInput) => {
    if (!repository) throw new Error('Not authenticated')
    
    try {
      const updatedProject = await repository.updateProject(input)
      setProjects(prev => prev.map(p => 
        p.id === input.id ? updatedProject : p
      ))
      return updatedProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
      throw err
    }
  }, [repository])

  const deleteProject = useCallback(async (id: string) => {
    if (!repository) throw new Error('Not authenticated')
    
    try {
      await repository.deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      throw err
    }
  }, [repository])

  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id)
  }, [projects])

  // ... other methods stay similar but async

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    // ... other returns
  }
}
```

#### 5.2 Updated ProjectContext
Update `src/contexts/project-context.tsx`:
```typescript
import React, { createContext, useContext, ReactNode } from 'react'
import { useProjects } from '@/hooks/use-projects'
import { useDocuments } from '@/hooks/use-documents'
import { useChapters } from '@/hooks/use-chapters'
import type { Project, Document, Chapter } from '@/lib/types/project'

interface ProjectContextValue {
  // Projects
  projects: Project[]
  projectsLoading: boolean
  projectsError: string | null
  
  // Documents
  documents: Document[]
  documentsLoading: boolean
  documentsError: string | null
  
  // Chapters
  chapters: Chapter[]
  chaptersLoading: boolean
  chaptersError: string | null
  
  // Methods (all async now)
  createProject: (input: CreateProjectInput) => Promise<Project>
  updateProject: (input: UpdateProjectInput) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  
  createDocument: (input: CreateDocumentInput) => Promise<Document>
  updateDocument: (input: UpdateDocumentInput) => Promise<Document>
  deleteDocument: (id: string) => Promise<void>
  
  createChapter: (input: CreateChapterInput) => Promise<Chapter>
  updateChapter: (input: UpdateChapterInput) => Promise<Chapter>
  deleteChapter: (id: string) => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const projects = useProjects()
  const documents = useDocuments()
  const chapters = useChapters()
  
  const value: ProjectContextValue = {
    // Projects
    projects: projects.projects,
    projectsLoading: projects.loading,
    projectsError: projects.error,
    
    // Documents
    documents: documents.documents,
    documentsLoading: documents.loading,
    documentsError: documents.error,
    
    // Chapters
    chapters: chapters.chapters,
    chaptersLoading: chapters.loading,
    chaptersError: chapters.error,
    
    // Methods
    createProject: projects.createProject,
    updateProject: projects.updateProject,
    deleteProject: projects.deleteProject,
    
    createDocument: documents.createDocument,
    updateDocument: documents.updateDocument,
    deleteDocument: documents.deleteDocument,
    
    createChapter: chapters.createChapter,
    updateChapter: chapters.updateChapter,
    deleteChapter: chapters.deleteChapter,
  }
  
  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
```

### Phase 6: UI Components Updates

#### 6.1 Authentication Components
Create `src/components/auth/login-form.tsx`:
```typescript
import { useState } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp, loading } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? 'Already have an account?' : 'Need an account?'}
      </Button>
    </form>
  )
}
```

#### 6.2 App Root Updates
Update `src/App.tsx`:
```typescript
import { AuthProvider } from '@/contexts/auth-context'
import { ProjectProvider } from '@/contexts/project-context'
import { AppRouter } from '@/components/app-router'

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppRouter />
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App
```

### Phase 7: Error Handling & Offline Support

#### 7.1 Error Boundary
Create `src/components/error-boundary.tsx`:
```typescript
import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

#### 7.2 Offline Manager
Create `src/lib/offline-manager.ts`:
```typescript
export class OfflineManager {
  private cache = new Map<string, any>()
  private pendingOperations: Array<() => Promise<void>> = []

  async getWithFallback<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    try {
      const result = await fetcher()
      this.cache.set(key, result) // Cache successful results
      return result
    } catch (error) {
      // Fall back to cache when offline
      const cached = this.cache.get(key)
      if (cached) {
        console.warn('Using cached data due to offline/error:', error)
        return cached
      }
      throw error
    }
  }

  queueOperation(operation: () => Promise<void>) {
    this.pendingOperations.push(operation)
  }

  async syncPendingOperations() {
    const operations = [...this.pendingOperations]
    this.pendingOperations = []
    
    for (const operation of operations) {
      try {
        await operation()
      } catch (error) {
        console.error('Failed to sync operation:', error)
        // Re-queue failed operations
        this.pendingOperations.push(operation)
      }
    }
  }
}

export const offlineManager = new OfflineManager()
```

#### 7.3 Network Status Hook
Create `src/hooks/use-network-status.ts`:
```typescript
import { useState, useEffect } from 'react'
import { offlineManager } from '@/lib/offline-manager'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Sync pending operations when back online
      offlineManager.syncPendingOperations()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

### Phase 8: Testing & Deployment

#### 8.1 Updated package.json Scripts
```json
{
  "scripts": {
    "dev": "NODE_OPTIONS=--max-old-space-size=8192 vite",
    "build": "NODE_OPTIONS=--max-old-space-size=8192 tsc -b && vite build",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

#### 8.2 Database Seeding
Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Create default project tags
  const tags = await Promise.all([
    prisma.projectTag.create({
      data: { name: 'Fiction', color: '#3B82F6' },
    }),
    prisma.projectTag.create({
      data: { name: 'Non-Fiction', color: '#10B981' },
    }),
    prisma.projectTag.create({
      data: { name: 'Poetry', color: '#8B5CF6' },
    }),
    prisma.projectTag.create({
      data: { name: 'Urgent', color: '#EF4444' },
    }),
  ])

  console.log('Created tags:', tags)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## Migration Timeline

### Week 1: Foundation
- **Day 1-2**: Cleanup API routes, setup Supabase project, environment configuration
- **Day 3-4**: Update Prisma schema, run migrations, set up RLS policies

### Week 2: Core Implementation  
- **Day 5-6**: Create auth hooks, context providers, and repository classes
- **Day 7-8**: Update existing hooks to use async operations

### Week 3: UI & Error Handling
- **Day 9-10**: Update UI components, add error boundaries and offline support
- **Day 11-12**: Testing, debugging, and optimization

### Week 4: Deployment & Polish
- **Day 13-14**: Final testing, documentation, and deployment preparation

## Success Metrics

- ✅ **Zero data loss** during migration
- ✅ **Offline functionality** preserved
- ✅ **Performance maintained** or improved
- ✅ **Type safety** across all operations
- ✅ **Cross-device sync** working
- ✅ **Authentication** secure and seamless

## Rollback Plan

If issues arise:
1. Keep localStorage hooks as backup
2. Environment variable to toggle between storage methods
3. Data export/import tools for user data recovery
4. Gradual rollout with feature flags

## Benefits After Implementation

1. **Cross-device sync** - Access writing from anywhere
2. **Collaboration ready** - Multi-user support foundation
3. **Backup & recovery** - Cloud-based data protection
4. **Scalability** - Handle large projects and many users
5. **Real-time features** - Future collaboration capabilities
6. **Mobile expansion** - Same database for mobile apps
7. **Analytics** - Usage insights and writing statistics

This implementation maintains your existing clean architecture while adding powerful cloud capabilities without the complexity of managing a backend server.