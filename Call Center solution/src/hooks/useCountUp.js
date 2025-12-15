import { useState, useEffect } from 'react';

/**
 * Custom hook for animating number counting from 0 to target value
 * @param {number} end - The target number to count to
 * @param {number} duration - Animation duration in milliseconds (default: 2000)
 * @param {number} delay - Delay before starting animation (default: 0)
 * @returns {number} - The current animated count value
 */
export const useCountUp = (end, duration = 2000, delay = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let startTime;
      const startValue = 0;
      const endValue = Number(end) || 0;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * (endValue - startValue) + startValue);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(endValue);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return count;
};
