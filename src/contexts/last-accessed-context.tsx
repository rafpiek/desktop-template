import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface LastAccessedItem {
  id: string
  title: string
  timestamp: number
}

interface LastAccessedData {
  project?: LastAccessedItem
  chapter?: LastAccessedItem & { projectId: string }
  document?: LastAccessedItem & { projectId: string; chapterId?: string }
}

interface LastAccessedContextType {
  lastAccessed: LastAccessedData
  setLastProject: (id: string, title: string) => void
  setLastChapter: (id: string, title: string, projectId: string) => void
  setLastDocument: (id: string, title: string, projectId: string, chapterId?: string) => void
  clearLastAccessed: () => void
}

const LastAccessedContext = createContext<LastAccessedContextType | undefined>(undefined)

const STORAGE_KEY = 'zeyn-last-accessed'

export function LastAccessedProvider({ children }: { children: ReactNode }) {
  // Load initial state from localStorage synchronously
  const [lastAccessed, setLastAccessed] = useState<LastAccessedData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (e) {
      console.error('Failed to parse last accessed data:', e)
      return {}
    }
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lastAccessed))
  }, [lastAccessed])

  const setLastProject = useCallback((id: string, title: string) => {
    setLastAccessed(prev => {
      // Only update if actually changed
      if (prev.project?.id === id) return prev
      return {
        ...prev,
        project: { id, title, timestamp: Date.now() }
      }
    })
  }, [])

  const setLastChapter = useCallback((id: string, title: string, projectId: string) => {
    setLastAccessed(prev => {
      // Only update if actually changed
      if (prev.chapter?.id === id) return prev
      return {
        ...prev,
        chapter: { id, title, projectId, timestamp: Date.now() }
      }
    })
  }, [])

  const setLastDocument = useCallback((id: string, title: string, projectId: string, chapterId?: string) => {
    setLastAccessed(prev => {
      // Only update if actually changed
      if (prev.document?.id === id) return prev
      return {
        ...prev,
        document: { id, title, projectId, chapterId, timestamp: Date.now() }
      }
    })
  }, [])

  const clearLastAccessed = useCallback(() => {
    setLastAccessed({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <LastAccessedContext.Provider value={{
      lastAccessed,
      setLastProject,
      setLastChapter,
      setLastDocument,
      clearLastAccessed
    }}>
      {children}
    </LastAccessedContext.Provider>
  )
}

export function useLastAccessed() {
  const context = useContext(LastAccessedContext)
  if (!context) {
    throw new Error('useLastAccessed must be used within LastAccessedProvider')
  }
  return context
}