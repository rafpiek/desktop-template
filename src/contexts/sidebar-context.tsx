import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    console.log('Sidebar context - Key pressed:', event.key, 'metaKey:', event.metaKey, 'ctrlKey:', event.ctrlKey);
    if ((event.metaKey || event.ctrlKey) && event.key === '/') {
      console.log('Sidebar context - Toggle triggered!');
      event.preventDefault();
      event.stopPropagation();
      toggle();
    }
  }, [toggle]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);

  const value: SidebarContextType = {
    isCollapsed,
    setIsCollapsed,
    toggle,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}