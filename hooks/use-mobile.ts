import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };
    mql.addEventListener("change", onChange);
    
    // Safely set in timeout so it isn't evaluated synchronously in mounting phase
    const timer = setTimeout(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }, 0);

    return () => {
      mql.removeEventListener("change", onChange);
      clearTimeout(timer);
    };
  }, []);

  return !!isMobile;
}
