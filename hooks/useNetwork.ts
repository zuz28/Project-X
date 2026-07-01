// Network status aware hook
import { useEffect, useState, useCallback } from 'react';
import { networkService } from '../services/network';

export interface UseNetworkResult {
  isOnline: boolean;
  isLoading: boolean;
}

export function useNetwork(): UseNetworkResult {
  const [isOnline, setIsOnline] = useState(networkService.isConnected());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = networkService.onConnectionChange((online) => {
      setIsOnline(online);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { isOnline, isLoading };
}
