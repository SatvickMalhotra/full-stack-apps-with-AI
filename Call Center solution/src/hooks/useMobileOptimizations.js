import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for mobile-specific optimizations
 * Includes network status, pull-to-refresh, and viewport detection
 */

// Hook for detecting network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionType, setConnectionType] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection type if available
    if (navigator.connection) {
      setConnectionType(navigator.connection.effectiveType);
      const handleConnectionChange = () => {
        setConnectionType(navigator.connection.effectiveType);
      };
      navigator.connection.addEventListener('change', handleConnectionChange);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        navigator.connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (onRefresh, threshold = 100) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setPullDistance(Math.min(diff, threshold * 1.5));
      if (diff > 10) {
        e.preventDefault(); // Prevent default scroll
      }
    }
  }, [isPulling, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};

// Hook for viewport/device detection
export const useDeviceDetect = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    orientation: 'portrait',
    hasTouchScreen: false,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 600;
      const isTablet = width >= 600 && width < 900;
      const isDesktop = width >= 900;
      const orientation = width > height ? 'landscape' : 'portrait';
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        hasTouchScreen,
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

// Hook for vibration feedback (haptic)
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern = [50]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => vibrate([25]), [vibrate]);
  const mediumTap = useCallback(() => vibrate([50]), [vibrate]);
  const heavyTap = useCallback(() => vibrate([100]), [vibrate]);
  const success = useCallback(() => vibrate([50, 50, 50]), [vibrate]);
  const error = useCallback(() => vibrate([100, 50, 100]), [vibrate]);

  return { vibrate, lightTap, mediumTap, heavyTap, success, error };
};

// Hook for safe area insets (for notched devices)
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const computeInsets = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10),
      });
    };

    // Set CSS variables for safe area
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');

    computeInsets();
    window.addEventListener('resize', computeInsets);

    return () => {
      window.removeEventListener('resize', computeInsets);
    };
  }, []);

  return insets;
};

// Hook for managing keyboard visibility on mobile
export const useKeyboardVisibility = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialHeight - currentHeight;

      // If height decreased significantly, keyboard is probably visible
      if (heightDiff > 150) {
        setIsKeyboardVisible(true);
        setKeyboardHeight(heightDiff);
      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    };

    // Also handle visualViewport API if available
    if (window.visualViewport) {
      const handleViewportResize = () => {
        const viewportHeight = window.visualViewport.height;
        const heightDiff = initialHeight - viewportHeight;

        if (heightDiff > 150) {
          setIsKeyboardVisible(true);
          setKeyboardHeight(heightDiff);
        } else {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      };

      window.visualViewport.addEventListener('resize', handleViewportResize);
      return () => {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      };
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};

// Hook for scroll position tracking
export const useScrollPosition = (elementRef) => {
  const [scrollPosition, setScrollPosition] = useState({
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 0,
    isAtTop: true,
    isAtBottom: false,
  });

  useEffect(() => {
    const element = elementRef?.current || window;

    const handleScroll = () => {
      if (elementRef?.current) {
        const { scrollTop, scrollLeft, scrollHeight, clientHeight } = elementRef.current;
        setScrollPosition({
          scrollTop,
          scrollLeft,
          scrollHeight,
          isAtTop: scrollTop === 0,
          isAtBottom: scrollTop + clientHeight >= scrollHeight - 10,
        });
      } else {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        setScrollPosition({
          scrollTop,
          scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
          scrollHeight,
          isAtTop: scrollTop === 0,
          isAtBottom: scrollTop + clientHeight >= scrollHeight - 10,
        });
      }
    };

    handleScroll();
    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [elementRef]);

  return scrollPosition;
};

// Combined hook that provides all mobile optimizations
export const useMobileOptimizations = (options = {}) => {
  const networkStatus = useNetworkStatus();
  const deviceInfo = useDeviceDetect();
  const haptics = useHapticFeedback();
  const safeAreaInsets = useSafeAreaInsets();
  const keyboardStatus = useKeyboardVisibility();

  return {
    ...networkStatus,
    ...deviceInfo,
    ...haptics,
    safeAreaInsets,
    ...keyboardStatus,
    // Utility functions
    isSlowConnection: networkStatus.connectionType === '2g' || networkStatus.connectionType === 'slow-2g',
    shouldCompressImages: networkStatus.connectionType !== '4g' && networkStatus.connectionType !== 'wifi',
  };
};

export default useMobileOptimizations;
