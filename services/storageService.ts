
import { HistoryItem } from '../types';

const HISTORY_KEY = 'arudi_user_history';

export const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    const history: HistoryItem[] = saved ? JSON.parse(saved) : [];
    
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).slice(2, 11),
      timestamp: Date.now(),
    };
    
    // Limit to last 50 items
    const updatedHistory = [newItem, ...history].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Failed to save history:", e);
  }
};

export const getHistory = (): HistoryItem[] => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load history:", e);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};
