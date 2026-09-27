export type MapPoint = {x: number; y: number};
export type AtlasCamera = MapPoint & {scale: number};
export type AtlasRegion = {center: number[]; bounds: number[][]};
export const MIN_MAP_ZOOM = 1;
export const MAX_MAP_ZOOM = 6;
export const MAP_CENTER = {x: 360, y: 355};
export const fullMapCamera = (): AtlasCamera => ({x: 0, y: 0, scale: 1});
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function constrainCamera(camera: AtlasCamera): AtlasCamera {
  const scale = clamp(camera.scale, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
  if (scale === MIN_MAP_ZOOM) return fullMapCamera();
  // Keep the centre of the viewport over the map, even after a long drag.
  return {scale, x: clamp(camera.x, MAP_CENTER.x - 700 * scale, MAP_CENTER.x - 20 * scale),
    y: clamp(camera.y, MAP_CENTER.y - 710 * scale, MAP_CENTER.y)};
}

export function regionCamera(region?: AtlasRegion): AtlasCamera {
  if (!region) return fullMapCamera();
  const width = Math.max(1, region.bounds[1][0] - region.bounds[0][0]);
  const height = Math.max(1, region.bounds[1][1] - region.bounds[0][1]);
  const scale = clamp(Math.min(520 / width, 470 / height), 1.5, 4.5);
  return constrainCamera({scale, x: MAP_CENTER.x - region.center[0] * scale, y: MAP_CENTER.y - region.center[1] * scale});
}

export function panCamera(camera: AtlasCamera, dx: number, dy: number) {
  return constrainCamera({...camera, x: camera.x + dx, y: camera.y + dy});
}

export function zoomCamera(camera: AtlasCamera, factor: number, anchor = MAP_CENTER) {
  const scale = clamp(camera.scale * factor, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
  const ratio = scale / camera.scale;
  return constrainCamera({scale, x: anchor.x - (anchor.x - camera.x) * ratio, y: anchor.y - (anchor.y - camera.y) * ratio});
}

export function gestureCamera(camera: AtlasCamera, from: MapPoint[], to: MapPoint[]) {
  if (from.length < 2 || to.length < 2) return panCamera(camera, to[0].x - from[0].x, to[0].y - from[0].y);
  const midpoint = (points: MapPoint[]) => ({x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2});
  const distance = (points: MapPoint[]) => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const start = midpoint(from), end = midpoint(to);
  const scale = clamp(camera.scale * distance(to) / Math.max(1, distance(from)), MIN_MAP_ZOOM, MAX_MAP_ZOOM);
  const ratio = scale / camera.scale;
  return constrainCamera({scale, x: end.x - (start.x - camera.x) * ratio, y: end.y - (start.y - camera.y) * ratio});
}

export const cameraTransform = (camera: AtlasCamera) => `translate(${camera.x} ${camera.y}) scale(${camera.scale})`;
