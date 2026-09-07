import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

const GETTERS = {
  equipment: api.getEquipment,
  services: api.getServices
};

export default function useCmsData(resource, fallback = [], normalize = d => d) {
  const [rows, setRows] = useState(() => normalize(fallback));
  const [loading, setLoading] = useState(true);
  const cancelled = useRef(false);

  const refresh = useCallback(async () => {
    const getter = GETTERS[resource];
    if (!getter) return;
    try {
      const data = await getter();
      if (!cancelled.current) setRows(normalize(data));
    } catch {
      // server unavailable - keep current data (fallback or last fetched)
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, [resource, normalize]);

  useEffect(() => {
    cancelled.current = false;
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => {
      cancelled.current = true;
      clearInterval(timer);
    };
  }, [refresh]);

  return [rows, refresh, loading];
}