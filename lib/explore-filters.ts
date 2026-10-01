import {conditionKeys,matchesCondition,type ConditionPlace,type RestCondition} from './rest-conditions';
export type ExploreFilters = { photos: boolean; reviewed: boolean; quiet: boolean }&Record<RestCondition,boolean>;
export const emptyFilters: ExploreFilters = { photos: false, reviewed: false, quiet: false,books:false,soloSeats:false,privateRoom:false,parking:false,quietMusic:false,partitions:false,soloOrder:false,selfOrder:false };

export function matchesExploreFilters(
  place: { image?: string; count: number; quiet: number; resting?: boolean }&ConditionPlace,
  filters: ExploreFilters,
) {
  return (!filters.photos || !!place.image)
    && (!filters.reviewed || place.count > 0)
    && (!filters.quiet || (!place.resting && place.count >= 3 && place.quiet / place.count >= .8))
    && conditionKeys.every(key=>!filters[key]||matchesCondition(place,key));
}
