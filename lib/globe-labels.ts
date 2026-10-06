import type {CountryCode} from './countries';

/** The globe artwork and projection share this coordinate system. */
export const GLOBE_VIEW_SIZE = 600;
export const GLOBE_CENTER: [number, number] = [300, 300];
export const GLOBE_RADIUS = 246;

export type GlobeRect = {x: number; y: number; width: number; height: number};
export type GlobeLabelPoint = {code: CountryCode; name: string; x: number; y: number; selected?: boolean};
export type GeographicGlobePoint = {code: CountryCode; name: string; center: readonly [number, number]; selected?: boolean};
export type GlobeProjection = {
  (point: [number, number]): [number, number] | null;
  invert(point: [number, number]): [number, number] | null;
};
export type GlobeLabelLayout = GlobeLabelPoint & {
  selected: boolean;
  labelRect: GlobeRect;
  pinHitRect: GlobeRect;
  /** Two separate targets; their enclosing rectangle is NOT a safe hit target. */
  hitRects: [GlobeRect, GlobeRect];
  lines: string[];
  fontSize: number;
  lineHeight: number;
  textX: number;
  textStartY: number;
  leader: {x1: number; y1: number; x2: number; y2: number};
};

/** Orthographic projection(point) alone also returns coordinates for the back. */
export function isFrontFacing(center: readonly [number, number], viewCenter: readonly [number, number]): boolean {
  if (![...center, ...viewCenter].every(Number.isFinite)) return false;
  const radians = Math.PI / 180;
  const latitude = center[1] * radians, viewLatitude = viewCenter[1] * radians;
  const facing = Math.sin(latitude) * Math.sin(viewLatitude)
    + Math.cos(latitude) * Math.cos(viewLatitude) * Math.cos((center[0] - viewCenter[0]) * radians);
  // The exact limb is intentionally omitted rather than showing a half-hidden pin.
  return facing > 1e-6;
}

export function projectVisibleGlobePoints(points: readonly GeographicGlobePoint[], projection: GlobeProjection): GlobeLabelPoint[] {
  const viewCenter = projection.invert([...GLOBE_CENTER]);
  if (!viewCenter) return [];
  return points.flatMap(point => {
    if (!isFrontFacing(point.center, viewCenter)) return [];
    const projected = projection([...point.center]);
    if (!projected || !projected.every(Number.isFinite)) return [];
    return [{code: point.code, name: point.name, x: projected[0], y: projected[1], selected: !!point.selected}];
  });
}

/** Conservative, DOM-independent widths for the SVG's semibold sans-serif text. */
export function estimateGlobeTextWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const character of text) {
    if (/\s/u.test(character)) em += .36;
    else if (/[\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7af]/u.test(character)) em += 1.08;
    else if (/[ilIjtfr.,'’]/u.test(character)) em += .4;
    else if (/[MWmw@]/u.test(character)) em += .94;
    else if (/[A-Z]/u.test(character)) em += .76;
    else em += .65;
  }
  return em * fontSize;
}

/** Prefer word boundaries; Korean (and long single words) can split by character. */
export function wrapGlobeLabel(name: string, fontSize: number, maxTextWidth: number): string[] {
  const text = name.trim().replace(/\s+/gu, ' ');
  if (estimateGlobeTextWidth(text, fontSize) <= maxTextWidth) return [text];
  const characters = Array.from(text);
  const wordBreaks = characters.flatMap((character, index) => character === ' ' ? [index] : []);
  const breaks = wordBreaks.length ? wordBreaks : characters.slice(1).map((_, index) => index + 1);
  let best = [text], bestWidth = Infinity;
  for (const index of breaks) {
    const lines = [characters.slice(0, index).join('').trim(), characters.slice(index).join('').trim()];
    if (lines.some(line => !line)) continue;
    const widest = Math.max(...lines.map(line => estimateGlobeTextWidth(line, fontSize)));
    if (widest < bestWidth) {bestWidth = widest; best = lines;}
  }
  return best;
}

export function globeRectsOverlap(a: GlobeRect, b: GlobeRect, gap = 0): boolean {
  return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x
    && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Whether a leader crosses a target, including its interior but not mere tangency. */
function crossesRect(line: GlobeLabelLayout['leader'], rect: GlobeRect): boolean {
  const epsilon = 1e-5;
  const left = rect.x + epsilon, right = rect.x + rect.width - epsilon;
  const top = rect.y + epsilon, bottom = rect.y + rect.height - epsilon;
  let start = 0, end = 1;
  const dx = line.x2 - line.x1, dy = line.y2 - line.y1;
  for (const [p, q] of [[-dx, line.x1 - left], [dx, right - line.x1], [-dy, line.y1 - top], [dy, bottom - line.y1]]) {
    if (p === 0) {if (q < 0) return false;}
    else if (p < 0) start = Math.max(start, q / p);
    else end = Math.min(end, q / p);
    if (start > end) return false;
  }
  return true;
}

/**
 * Greedy, stable screen-space placement. Only returned countries are rendered.
 * A 44 CSS-pixel pin target is reserved before admitting each label. Dense
 * regions therefore show fewer countries instead of stacking invisible targets.
 * The active keyboard target wins while focused, otherwise selection wins.
 */
export function layoutGlobeLabels(
  points: readonly GlobeLabelPoint[],
  viewportWidth: number,
  options: {preferredCode?: CountryCode} = {},
): GlobeLabelLayout[] {
  const width = Number.isFinite(viewportWidth) && viewportWidth > 0 ? Math.max(160, viewportWidth) : GLOBE_VIEW_SIZE;
  const unit = GLOBE_VIEW_SIZE / width;
  const edge = 8 * unit, gap = 4 * unit, pinSize = 44 * unit;
  const fontSize = 14 * unit, lineHeight = 17 * unit;
  const maxLabels = width < 380 ? 5 : width < 520 ? 7 : width < 720 ? 10 : 13;
  const ranked = points.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y)
    && point.x >= 0 && point.x <= GLOBE_VIEW_SIZE && point.y >= 0 && point.y <= GLOBE_VIEW_SIZE)
    .slice().sort((a, b) => Number(b.code === options.preferredCode) - Number(a.code === options.preferredCode)
      || Number(!!b.selected) - Number(!!a.selected)
      || ((a.x - 300) ** 2 + (a.y - 300) ** 2) - ((b.x - 300) ** 2 + (b.y - 300) ** 2)
      || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
  const placed: GlobeLabelLayout[] = [];
  const admitted = new Set<CountryCode>();
  for (const point of ranked) {
    if (placed.length >= maxLabels) break;
    if (admitted.has(point.code)) continue;
    const pinHitRect = {
      x: clamp(point.x - pinSize / 2, edge, GLOBE_VIEW_SIZE - edge - pinSize),
      y: clamp(point.y - pinSize / 2, edge, GLOBE_VIEW_SIZE - edge - pinSize),
      width: pinSize, height: pinSize,
    };
    if (placed.some(other => other.hitRects.some(rect => globeRectsOverlap(pinHitRect, rect, gap))
      || crossesRect(other.leader, pinHitRect))) continue;
    const name = point.name.trim() || point.code;
    const lines = wrapGlobeLabel(name, fontSize, 118 * unit);
    const labelWidth = Math.max(...lines.map(line => estimateGlobeTextWidth(line, fontSize))) + 20 * unit;
    const labelHeight = lines.length * lineHeight + 12 * unit;
    // All registered names fit without shortening; reject impossible custom text.
    if (labelWidth > GLOBE_VIEW_SIZE - edge * 2 || labelHeight > GLOBE_VIEW_SIZE - edge * 2) continue;
    const centerX = pinHitRect.x + pinSize / 2, centerY = pinHitRect.y + pinSize / 2;
    const directions = [[0, -1], [point.x > 300 ? -1 : 1, 0], [point.x > 300 ? 1 : -1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
    let result: GlobeLabelLayout | undefined;
    // Second ring lets a nearby label move aside without arbitrarily moving pins.
    for (const extra of [0, 16 * unit, 32 * unit]) {
      for (const [dx, dy] of directions) {
        const labelRect = {
          x: clamp(centerX + dx * (pinSize / 2 + labelWidth / 2 + gap + extra) - labelWidth / 2, edge, GLOBE_VIEW_SIZE - edge - labelWidth),
          y: clamp(centerY + dy * (pinSize / 2 + labelHeight / 2 + gap + extra) - labelHeight / 2, edge, GLOBE_VIEW_SIZE - edge - labelHeight),
          width: labelWidth, height: labelHeight,
        };
        if (globeRectsOverlap(pinHitRect, labelRect, gap - 1e-6)) continue;
        const leader = {x1: point.x, y1: point.y, x2: clamp(point.x, labelRect.x, labelRect.x + labelWidth), y2: clamp(point.y, labelRect.y, labelRect.y + labelHeight)};
        if (placed.some(other => other.hitRects.some(rect => globeRectsOverlap(labelRect, rect, gap) || crossesRect(leader, rect))
          || crossesRect(other.leader, labelRect))) continue;
        result = {...point, name, selected: !!point.selected, pinHitRect, labelRect, hitRects: [pinHitRect, labelRect], lines, fontSize, lineHeight,
          textX: labelRect.x + labelWidth / 2, textStartY: labelRect.y + 6 * unit + fontSize,
          leader};
        break;
      }
      if (result) break;
    }
    if (result) {placed.push(result); admitted.add(point.code);}
  }
  return placed;
}
