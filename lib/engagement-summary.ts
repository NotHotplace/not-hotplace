// Summarize existing anonymous counters only. Rows cannot establish a linked
// user journey, a specific place, a unique person, or a returning visitor.
export const restCampaigns = ['seoul_solo', 'private_room', 'photo_guides'] as const;
export const restSummaryEvents = ['guide_view', 'place_view', 'save', 'map_open', 'journal_open'] as const;
type SummaryEvent = typeof restSummaryEvents[number];
type CampaignTotal = {campaign:string;country:string;source:string;event:string;total:number};
export function instagramRestSummary(rows: readonly CampaignTotal[]) {
  return restCampaigns.map(campaign => {
    const counts: Record<SummaryEvent, number> = {guide_view:0,place_view:0,save:0,map_open:0,journal_open:0};
    for (const row of rows) {
      if (row.campaign !== campaign || row.country !== 'KR' || row.source !== 'instagram') continue;
      if (!restSummaryEvents.includes(row.event as SummaryEvent) || !Number.isFinite(row.total) || row.total < 0) continue;
      counts[row.event as SummaryEvent] += row.total;
    }
    return {campaign, ...counts};
  });
}
