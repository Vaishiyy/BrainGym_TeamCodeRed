import { useRef, useEffect, useCallback } from 'react';

export function useGameLoop(callback: (dt: number) => void, running: boolean) {
  const rafRef = useRef<number>(0);
  const prevTime = useRef<number>(0);
  const cb = useRef(callback);
  cb.current = callback;

  const loop = useCallback((time: number) => {
    const dt = prevTime.current ? Math.min((time - prevTime.current) / 1000, 0.05) : 0.016;
    prevTime.current = time;
    cb.current(dt);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (running) {
      prevTime.current = 0;
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, loop]);
}
