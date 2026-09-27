import type {Place} from '@/lib/catalog';
import {placeDescription, placeTags, placeVisitHint} from '@/lib/place-copy';
import {privacyLabel} from '@/lib/place-themes';

export default function PlaceSummary({place, language}: {place: Place; language: 'ko' | 'en'}) {
  const tags = placeTags(place, language).slice(0, 2);
  const kinds = [...new Set(place.experiences?.map(experience => experience.kind) || [])];
  return <span className="place-preview" data-original-language>
    <span className="quiet-place-description">{placeDescription(place, language)}</span>
    {(tags.length > 0 || kinds.length > 0) && <span className="place-tags">
      {(kinds.length ? kinds.map(kind => privacyLabel(kind, language)) : tags).map(tag => <span key={tag}>{tag}</span>)}
    </span>}
    <span className="place-preview-note"><span>{language === 'ko' ? '방문 전' : 'Before you go'}</span>{placeVisitHint(place, language)}</span>
  </span>;
}
