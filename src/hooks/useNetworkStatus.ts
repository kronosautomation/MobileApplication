import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

interface NetworkStatus {
  isConnected: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
}

/**
 * Custom hook to monitor network connectivity status
 * @returns Current network connection status
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    connectionType: null,
    isInternetReachable: true,
  });

  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (isMounted) {
          setNetworkStatus({
            isConnected: networkState.isConnected ?? false,
            connectionType: networkState.type,
            isInternetReachable: networkState.isInternetReachable ?? false,
          });
        }
      } catch (error) {
        console.error('Error checking network state:', error);
      }
    };

    // Initial check
    checkConnection();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkConnection, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return networkStatus;
};

export default useNetworkStatus;
