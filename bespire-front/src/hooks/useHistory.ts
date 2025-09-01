import { useState, useCallback } from 'react';

export const useHistory = <T>(initialState: T) => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const state = history[currentIndex];
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const setState = useCallback((value: T) => {
        // When a new state is set, we must clear the "redo" history
        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(value);
        
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
    }, [currentIndex, history]);

    const undo = useCallback(() => {
        if (canUndo) {
        setCurrentIndex((prevIndex) => prevIndex - 1);
        }
    }, [canUndo]);

    const redo = useCallback(() => {
        if (canRedo) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    }, [canRedo]);

    return { state, setState, undo, redo, canUndo, canRedo };
};