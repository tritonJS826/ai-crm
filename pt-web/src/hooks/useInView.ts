import {useEffect, useRef, useState} from "react";

export const IN_VIEW_THRESHOLD = 0.2;

/**
 * TODO: live a comment where we can use this helper
 * TODO: if it is a helper - move it to utils directory and get rid of hooks directory - everything could be hook
 */
export function useInView(threshold = IN_VIEW_THRESHOLD) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {threshold},
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return {ref, inView};
}
