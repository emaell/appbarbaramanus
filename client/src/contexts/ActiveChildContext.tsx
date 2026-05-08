import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Child } from '@shared/types';
import { getAllChildren, getLocalStorage, setLocalStorage, LocalStorageKeys } from '@/lib/storage';

interface ActiveChildContextType {
  activeChild: Child | null;
  children: Child[];
  setActiveChild: (child: Child | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshChildren: () => Promise<void>;
}

const ActiveChildContext = createContext<ActiveChildContextType | undefined>(undefined);

export function ActiveChildProvider({ children }: { children: React.ReactNode }) {
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshChildren = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allChildren = await getAllChildren();
      setChildrenList(allChildren);

      // Restaurar criança ativa do localStorage
      const savedActiveChildId = getLocalStorage<string | null>(LocalStorageKeys.ACTIVE_CHILD_ID, null);
      
      if (savedActiveChildId && allChildren.length > 0) {
        const savedChild = allChildren.find((c) => c.id === savedActiveChildId);
        if (savedChild) {
          setActiveChildState(savedChild);
        } else if (allChildren.length > 0) {
          // Se a criança salva não existe mais, usar a primeira
          setActiveChildState(allChildren[0]);
          setLocalStorage(LocalStorageKeys.ACTIVE_CHILD_ID, allChildren[0].id);
        }
      } else if (allChildren.length > 0) {
        // Se não há criança ativa, usar a primeira
        setActiveChildState(allChildren[0]);
        setLocalStorage(LocalStorageKeys.ACTIVE_CHILD_ID, allChildren[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar crianças');
      console.error('Erro ao carregar crianças:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveChild = (child: Child | null) => {
    setActiveChildState(child);
    if (child) {
      setLocalStorage(LocalStorageKeys.ACTIVE_CHILD_ID, child.id);
    } else {
      setLocalStorage(LocalStorageKeys.ACTIVE_CHILD_ID, null);
    }
  };

  // Carregar crianças ao montar o componente
  useEffect(() => {
    refreshChildren();
  }, []);

  return (
    <ActiveChildContext.Provider
      value={{
        activeChild,
        children: childrenList,
        setActiveChild,
        isLoading,
        error,
        refreshChildren,
      }}
    >
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  const context = useContext(ActiveChildContext);
  if (!context) {
    throw new Error('useActiveChild deve ser usado dentro de ActiveChildProvider');
  }
  return context;
}
