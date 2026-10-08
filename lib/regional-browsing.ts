import type {Place} from './catalog';
import type {PlaceLanguage} from './place-links';

export const REGION_PAGE_SIZE = 18;
export type RegionQuery = {page?: string | string[]};
const sourced = (fact: {source?: string; checked?: string}) =>
  !!fact.source && /^https:\/\//.test(fact.source) && !!fact.checked && /^\d{4}-\d{2}-\d{2}$/.test(fact.checked);

// Count distinct, dated source-backed information, not images, popularity or quietness.
// Basic imported setting/address rows are deliberately not promoted as visit guidance.
export function regionalEvidence(place: Place) {
  const reasons = (place.recommendationReasons || []).filter(fact => sourced(fact) && fact.textKo.trim() && fact.textEn.trim());
  const details = place.detailLevel === 'basic' ? [] : (place.visitDetails || []).filter(fact =>
    sourced(fact) && fact.textKo.trim() && fact.textEn.trim() && !/^(setting|location|before you go)$/i.test(fact.labelEn)
    && !/^(check|confirm|consider|contact|ask|request|see|visit the|refer to)\b/i.test(fact.textEn.trim()));
  const conditions = (place.conditions || []).filter(sourced);
  const reasonCount = new Set(reasons.map(fact => fact.textEn.trim())).size;
  const detailCount = new Set(details.map(fact => fact.labelEn.trim().toLowerCase())).size;
  const conditionCount = new Set(conditions.map(fact => fact.kind)).size;
  return {reasonCount, detailCount, conditionCount, reason: reasons[0], detail: details[0]};
}
export function compareRegionalEvidence(a: Place, b: Place) {
  const left = regionalEvidence(a), right = regionalEvidence(b);
  return right.reasonCount - left.reasonCount
    || (right.detailCount + right.conditionCount) - (left.detailCount + left.conditionCount)
    || a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id, 'en');
}
export function parseRegionPage(value: RegionQuery['page']): number | null {
  if (value === undefined) return 1;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}
export function paginateRegion(places: Place[], page: number) {
  const total = places.length, totalPages = Math.max(1, Math.ceil(total / REGION_PAGE_SIZE));
  if (!Number.isSafeInteger(page) || page < 1 || page > totalPages) return null;
  const offset = (page - 1) * REGION_PAGE_SIZE;
  return {places: places.slice(offset, offset + REGION_PAGE_SIZE), total, totalPages, page, offset};
}
export function regionPagePath(slug: string, language: PlaceLanguage, page = 1) {
  return `/regions/${encodeURIComponent(slug)}/${language}${page > 1 ? `?page=${page}` : ''}`;
}
export function regionPageNumbers(page: number, total: number) {
  return [...new Set([1, page - 1, page, page + 1, total].filter(value => value >= 1 && value <= total))].sort((a,b) => a-b);
}
