import { useState, useCallback } from 'react';
import type { Notification } from '../utils/notifications';

export function useToast() {
  const [toasts, setToasts] = useState<Notification[]>([]);

  const show = useCallback(
    (
      title: string,
      message: string,
      type: 'impact' | 'connection' | 'warning' = 'impact',
      duration = 3000
    ) => {
      const toast: Notification = {
        id: `toast-${Date.now()}`,
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
      };

      setToasts(prev => [toast, ...prev]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, duration);
      }

      return toast.id;
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    show,
    dismiss,
    dismissAll,
  };
}
