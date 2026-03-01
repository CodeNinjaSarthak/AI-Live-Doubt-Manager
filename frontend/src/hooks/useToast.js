import { useState, useEffect, useCallback, useRef } from 'react';

const handlers = new Set();
let nextId = 0;

// Call from anywhere — no Provider required
export function showToast(message, type = 'info') {
  const id = ++nextId;
  handlers.forEach(fn => fn({ id, message, type }));
}

// Used only by ToastContainer — remount-safe via activeRef
export function useToastStore() {
  const [toasts, setToasts] = useState([]);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    const add = (toast) => {
      if (activeRef.current) setToasts(prev => [...prev, toast]);
    };
    handlers.add(add);
    return () => {
      activeRef.current = false; // guards brief remount window
      handlers.delete(add);
    };
  }, []);

  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, dismiss };
}
