import { useState, useEffect, useRef, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Usar useRef para evitar re-renders innecesarios
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para leer desde localStorage
  const loadFromStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          setStoredValue(parsed);
        }
      }
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Función para escribir a localStorage (debounced)
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permitir value ser una función para actualizaciones basadas en estado previo
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Debounce localStorage writes para evitar bloqueos
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (typeof window !== 'undefined') {
          // Usar requestIdleCallback si está disponible
          const saveToStorage = () => {
            try {
              window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
              console.warn(`Error saving ${key} to localStorage:`, error);
            }
          };

          if ('requestIdleCallback' in window) {
            requestIdleCallback(saveToStorage);
          } else {
            setTimeout(saveToStorage, 0);
          }
        }
      }, 300); // 300ms debounce
      
    } catch (error) {
      console.warn(`Error setting ${key}:`, error);
    }
  }, [key, storedValue]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Cleanup timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [storedValue, setValue, isLoaded] as const;
}
