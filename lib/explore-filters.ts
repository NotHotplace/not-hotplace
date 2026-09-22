export type ExploreFilters = { photos: boolean; reviewed: boolean; quiet: boolean };
export const emptyFilters: ExploreFilters = { photos: false, reviewed: false, quiet: false };

export function matchesExploreFilters(
  place: { image?: string; count: number; quiet: number; resting?: boolean },
  filters: ExploreFilters,
) {
  return (!filters.photos || !!place.image)
    && (!filters.reviewed || place.count > 0)
    && (!filters.quiet || (!place.resting && place.count >= 3 && place.quiet / place.count >= .8));
}
