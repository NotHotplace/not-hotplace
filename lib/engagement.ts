export const engagementEvents = ['place_view', 'map_open', 'save', 'review', 'share'] as const;
export const engagementSources = ['direct', 'instagram', 'google', 'other'] as const;
export type EngagementEvent = typeof engagementEvents[number];
export type EngagementSource = typeof engagementSources[number];
export function sourceCategory(value: string | null): EngagementSource {
  const source = (value || '').trim().toLowerCase();
  if (!source) return 'direct';
  if (['instagram', 'ig'].includes(source)) return 'instagram';
  return source === 'google' ? 'google' : 'other';
}
