'use client';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {comparisonFacts, type ComparisonPlace} from '@/lib/place-comparison';
import {placePath, findCatalogPlace, explorerPath} from '@/lib/place-pages';

export default function PlaceComparison({places, language, open, onOpenChange, onVisit}: {
  places: ComparisonPlace[]; language: 'ko' | 'en'; open: boolean;
  onOpenChange: (open: boolean) => void; onVisit: () => void;
}) {
  const ko = language === 'ko';
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="nhp-modal comparison-dialog" data-original-language>
    <DialogTitle>{ko ? '어디에서 쉬어갈까요?' : 'Where will you pause?'}</DialogTitle>
    <DialogDescription>{ko ? '저장한 장소를 나란히 살펴보세요. 공개되지 않은 조건은 문의가 필요해요.' : 'Compare your saved places. Unpublished conditions need confirmation.'}</DialogDescription>
    <div className="comparison-scroll" tabIndex={0} aria-label={ko ? '장소 비교표 · 좌우로 스크롤' : 'Place comparison · scroll horizontally'}>
      <table className="comparison-table"><thead><tr><th scope="col">{ko ? '비교 항목' : 'Compare'}</th>{places.map(place => <th scope="col" key={place.id}><a onClick={onVisit} href={findCatalogPlace(place.id) ? placePath(place.id, language) : explorerPath(place, language)}>{place.name} ↗</a></th>)}</tr></thead>
      <tbody>{places[0] && comparisonFacts(places[0], language).map((fact, index) => <tr key={fact.label}><th scope="row">{fact.label}</th>{places.map(place => <td key={place.id}>{comparisonFacts(place, language)[index].value}</td>)}</tr>)}
      <tr><th scope="row">{ko ? '자료 확인' : 'Source checked'}</th>{places.map(place => <td key={place.id}><a href={place.source} target="_blank" rel="noopener noreferrer">{place.checked} ↗</a></td>)}</tr></tbody></table>
    </div>
  </DialogContent></Dialog>;
}
