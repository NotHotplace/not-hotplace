'use client';
import {engagementSources, sourceCategory, type EngagementEvent, type EngagementSource} from './engagement';
import {campaignCategory,type CampaignCode} from './campaigns';

export function rememberCampaign():CampaignCode {
  try {const query=new URLSearchParams(location.search);const value=query.has('utm_source')||query.has('utm_content')?campaignCategory(query.get('utm_content')):campaignCategory(sessionStorage.getItem('nhp-campaign-category'));sessionStorage.setItem('nhp-campaign-category',value);return value;}catch{return 'none';}
}
export function rememberSource(): EngagementSource {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1' || (navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl) return 'direct';
  let source: EngagementSource = 'direct';
  try {
    const query = new URLSearchParams(location.search);
    if (query.has('utm_source')) source = sourceCategory(query.get('utm_source'));
    else {
      const previous = sessionStorage.getItem('nhp-source-category');
      if (engagementSources.includes(previous as EngagementSource)) source = previous as EngagementSource;
      else if (document.referrer) {
        const host = new URL(document.referrer).hostname;
        source = host === location.hostname ? 'direct' : /(^|\.)instagram\.com$/.test(host) ? 'instagram' : /(^|\.)google\.[a-z.]+$/.test(host) ? 'google' : 'other';
      }
    }
    sessionStorage.setItem('nhp-source-category', source);
  } catch { /* Storage may be unavailable; counting never blocks an action. */ }
  return source;
}
export function trackEngagement(event: EngagementEvent, country: 'KR' | 'US') {
  if (typeof window === 'undefined' || location.hostname !== 'nothotplace.com') return;
  if (navigator.doNotTrack === '1' || (navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl) return;
  const source = rememberSource();
  const campaign=rememberCampaign();
  // Only finite categories are sent. No identity, place ID, raw URL, referrer or search term.
  void fetch('/api/engagement', {method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
    headers: {'Content-Type': 'application/json'}, body: JSON.stringify({event, country, source,campaign}), keepalive: true}).catch(() => {});
}
