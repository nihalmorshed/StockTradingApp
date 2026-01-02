//  throttle and debounce Utilities for optimizing UI performance with real-time data
 

/**
 * Throttle function - limits how often a function can be called
 * @param func - Function to throttle
 * @param limit - Minimum time between calls in ms
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * Debounce function - delays execution until after a period of inactivity
 * @param func - Function to debounce
 * @param wait - Wait time in ms
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  };
}


//  batch multiple update within the throttle window
export function createThrottledUpdater<T>(
  updateFn: (updates: Map<string, T>) => void,
  throttleMs: number = 250
): (key: string, value: T) => void {
  const pendingUpdates = new Map<string, T>();
  let isScheduled = false;

  return (key: string, value: T) => {
    pendingUpdates.set(key, value);

    if (!isScheduled) {
      isScheduled = true;
      setTimeout(() => {
        const updates = new Map(pendingUpdates);
        pendingUpdates.clear();
        isScheduled = false;
        updateFn(updates);
      }, throttleMs);
    }
  };
}


//  request animation Frame based throttle for smooth UI updates
 
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func.apply(this, lastArgs);
        }
        rafId = null;
      });
    }
  };
}
