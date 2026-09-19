import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Polls the member's notification inbox. Lightweight (headless-friendly) and
 * pauses when the tab is hidden.
 */
export function useNotifications() {
  const { isAuthenticated, isActiveMember } = useAuth();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !isActiveMember) return;
    if (document.hidden) return;
    try {
      setLoading(true);
      const data = await api.notifications({ limit: 20 });
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch {
      /* silent — notification failures must never block the UI */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isActiveMember]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 45_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refresh]);

  return { unread, items, loading, refresh, setUnread };
}
