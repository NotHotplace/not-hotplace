'use client';
import {useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent} from 'react';
import {fullMapCamera, regionCamera, panCamera, zoomCamera, gestureCamera, type AtlasCamera, type AtlasRegion, type MapPoint} from '@/lib/atlas-camera';

function mapPoint(svg: SVGSVGElement, x: number, y: number): MapPoint {
  const point = svg.createSVGPoint(); point.x = x; point.y = y;
  const matrix = svg.getScreenCTM();
  if (!matrix) return {x, y};
  const local = point.matrixTransform(matrix.inverse());
  return {x: local.x, y: local.y};
}

export function useAtlasCamera(region: AtlasRegion | undefined, open: boolean, ready: boolean) {
  const [camera, setCamera] = useState(() => regionCamera(region));
  const [animated, setAnimated] = useState(true), [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null), current = useRef(camera);
  const pointers = useRef(new Map<number, MapPoint>());
  const start = useRef<{camera: AtlasCamera; points: MapPoint[]; client: MapPoint; region: string | null} | null>(null);
  const moved = useRef(false);

  const update = useCallback((value: AtlasCamera, animate = false) => {
    current.current = value; setCamera(value); setAnimated(animate);
  }, []);
  const focus = useCallback((value?: AtlasRegion) => update(regionCamera(value), true), [update]);
  const zoom = useCallback((factor: number) => update(zoomCamera(current.current, factor), true), [update]);

  useEffect(() => {focus(region); pointers.current.clear(); start.current = null; setDragging(false);}, [region, open, focus]);
  useEffect(() => {
    const svg = svgRef.current;
    if (!open || !ready || !svg) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 300 : 1);
      const factor = Math.exp(-Math.max(-240, Math.min(240, delta)) * .002);
      update(zoomCamera(current.current, factor, mapPoint(svg, event.clientX, event.clientY)));
    };
    svg.addEventListener('wheel', wheel, {passive: false});
    return () => svg.removeEventListener('wheel', wheel);
  }, [open, ready, update]);

  function pointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    const point = mapPoint(event.currentTarget, event.clientX, event.clientY);
    if (!pointers.current.size) moved.current = false;
    pointers.current.set(event.pointerId, point);
    start.current = {camera: current.current, points: [...pointers.current.values()], client: {x: event.clientX, y: event.clientY},
      region: (event.target as Element).closest('[data-region]')?.getAttribute('data-region') || null};
    if (pointers.current.size > 1) moved.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!start.current || !pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, mapPoint(event.currentTarget, event.clientX, event.clientY));
    if (Math.hypot(event.clientX - start.current.client.x, event.clientY - start.current.client.y) > 5) moved.current = true;
    if (moved.current) {
      setDragging(true);
      update(gestureCamera(start.current.camera, start.current.points, [...pointers.current.values()]));
    }
  }
  function pointerEnd(event: PointerEvent<SVGSVGElement>, cancelled = false) {
    const selected = !cancelled && !moved.current && pointers.current.size === 1 ? start.current?.region : null;
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (pointers.current.size && start.current) {
      moved.current = true;
      start.current = {...start.current, camera: current.current, points: [...pointers.current.values()]};
    } else {start.current = null; setDragging(false);}
    return selected;
  }
  function keyDown(event: KeyboardEvent<SVGSVGElement>) {
    const key = event.key;
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','_','Home'].includes(key)) return;
    event.preventDefault();
    if (key === 'Home') update(fullMapCamera(), true);
    else if (key === '+' || key === '=') zoom(1.35);
    else if (key === '-' || key === '_') zoom(1 / 1.35);
    else update(panCamera(current.current, key === 'ArrowLeft' ? 75 : key === 'ArrowRight' ? -75 : 0,
      key === 'ArrowUp' ? 75 : key === 'ArrowDown' ? -75 : 0));
  }
  return {camera, animated, dragging, svgRef, focus, zoom, pointerDown, pointerMove, pointerEnd, keyDown};
}
