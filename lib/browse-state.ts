import {isPlaceTheme, type PlaceTheme} from './place-themes';
import {emptyFilters, type ExploreFilters} from './explore-filters';

export type BrowseState = {
  city: string; category: string; theme: PlaceTheme; term: string;
  view: string; filters: ExploreFilters;
};
const keys = ['region', 'category', 'theme', 'q', 'view', 'photos', 'reviewed', 'quiet', 'resume'];

export function readBrowseState(query: URLSearchParams, regions: readonly string[]): BrowseState {
  const region = query.get('region'), category = query.get('category'), theme = query.get('theme');
  return {
    city: region && regions.includes(region) ? region : '전국',
    category: category && ['cafe', 'food', 'drive', 'spa'].includes(category) ? category : 'all',
    theme: isPlaceTheme(theme) ? theme : 'all',
    term: (query.get('q') || '').slice(0, 180),
    view: ['saved', 'trips'].includes(query.get('view') || '') ? query.get('view')! : 'explore',
    filters: {photos: query.get('photos') === '1', reviewed: query.get('reviewed') === '1', quiet: query.get('quiet') === '1'},
  };
}

// Only public discovery choices belong in a shareable URL. Never add location or saved IDs.
export function writeBrowseState(url: URL, state: BrowseState, language: 'ko' | 'en') {
  const next = new URL(url);
  for (const key of keys) next.searchParams.delete(key);
  next.searchParams.set('lang', language);
  if (state.city !== '전국') next.searchParams.set('region', state.city);
  if (state.category !== 'all') next.searchParams.set('category', state.category);
  if (state.theme !== 'all') next.searchParams.set('theme', state.theme);
  if (state.term.trim()) next.searchParams.set('q', state.term.trim().slice(0, 180));
  if (['saved', 'trips'].includes(state.view)) next.searchParams.set('view', state.view);
  for (const key of Object.keys(emptyFilters) as (keyof ExploreFilters)[]) {
    if (state.filters[key]) next.searchParams.set(key, '1');
  }
  return next;
}
