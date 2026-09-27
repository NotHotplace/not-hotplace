'use client';
import {useCallback, useEffect, useRef, useState} from 'react';

export function useGlobeMotion(ready: boolean, visible: boolean) {
  const [rotation, setRotation] = useState(-127);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const angle = useRef(-127), target = useRef(-127), phase = useRef(0), dragging = useRef(false);
  const enabled = !reduced && !paused;

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const turnTo = useCallback((next: number, immediate = false) => {
    const delta = ((next - angle.current) % 360 + 540) % 360 - 180;
    target.current = angle.current + delta;
    phase.current = 0;
    if (immediate || !enabled) {
      angle.current = target.current;
      setRotation(angle.current);
    }
  }, [enabled]);

  useEffect(() => {
    if (!ready || !visible || !enabled) return;
    let frame = 0, last = 0;
    function tick(now: number) {
      frame = 0;
      if (document.hidden) return;
      if (!last) last = now;
      const elapsed = now - last;
      // Bound expensive geographic path rendering to 24fps.
      if (elapsed >= 1000 / 24) {
        const dt = Math.min(elapsed / 1000, .08);
        last = now;
        if (!dragging.current) {
          phase.current += dt;
          const resting = target.current + Math.sin(phase.current * .18) * 7;
          angle.current += (resting - angle.current) * Math.min(1, dt * 6);
          setRotation(angle.current);
        }
      }
      frame = requestAnimationFrame(tick);
    }
    function resume() {
      if (!document.hidden && !frame) { last = 0; frame = requestAnimationFrame(tick); }
    }
    resume(); document.addEventListener('visibilitychange', resume);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', resume); };
  }, [ready, visible, enabled]);

  return {rotation, turnTo, dragging, enabled, reduced, toggle: () => setPaused(value => !value)};
}
