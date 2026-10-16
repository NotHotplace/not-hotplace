import expanded from './expanded-catalog.json';
import recommendationEvidence from './recommendation-evidence.json';
import visitInformation from './visit-information.json';
import national from './national-catalog.json';
import american from './us-catalog.json';
import japan from './jp-catalog.json';
import type {CountryCode} from './countries';
import type {VisitFacts} from './visit-facts';
import guides from './kr-place-guides.json';
import privateCatalog from './private-catalog.json';
import restCatalog from './rest-catalog.json';
import type {PrivateExperience} from './place-themes';
import type {ConditionFact,RestCondition} from './rest-conditions';
import conditionCatalog from './rest-conditions.json';
import locations from './location-catalog.json';
import externalMemos from './external-review-memos.json';
import type {ExternalMemo} from './external-reviews';
export type VisitDetail={labelEn:string;labelKo:string;textEn:string;textKo:string;source?:string;checked?:string;additionalSources?:{label:string;url:string}[]};
export type PlacePhoto={src:string;altKo:string;altEn:string;credit:string;source:string;original:string;licenseUrl:string;width:number;height:number};
export type Place = {sourceChecked?:string;recommendationReasons?:import('./place-presentation').RecommendationReason[];visitFacts?:VisitFacts;detailLevel?:'basic'|'enriched';externalMemo?:ExternalMemo;contributor?:{id:string;name:string;link:string};conditions?:ConditionFact[];restFeedback?:Partial<Record<RestCondition,number>>;locationInfo?:{source:string;checked:string;kind:'reference'|'entrance'};themes?:'premium-spa'[];experiences?:PrivateExperience[];photos?:PlacePhoto[];featured?:boolean;tagsEn?:string[];visitDetails?:VisitDetail[];tagsKo?:string[];photoGallery?:string;imageSource?:string;imageLicense?:string;imageLicenseUrl?:string;imageNote?:string;imageNoteKo?:string;country?:CountryCode;states?:string[];descriptionKo?:string;descriptionEn?:string;id:string;city:string;category:string;name:string;area:string;address:string;description:string;source:string;checked:string;tags:string[];image?:string;imageCredit?:string;imageRemote?:string;lat?:number|null;lon?:number|null;sourceHint?:string};
const original:Place[]=[
{id:'cj-daechung',descriptionEn:"A caf\u00e9 candidate in Munui-myeon to explore alongside a lakeside outing.",city:'청주',category:'cafe',name:'더 대청호',area:'상당구 · 문의면',address:'충북 청주시 상당구 문의면 대청호반로 786-25',description:'문의면의 카페 후보. 호반 나들이와 함께 살펴볼 수 있는 곳입니다.',source:'https://www.instagram.com/reel/DKyctYryvl0/',checked:'2026-09-10',tags:['문의면','카페']},
{id:'cj-majung',descriptionEn:"A Korean set-menu restaurant near Daecheong Lake. We are collecting reports on noise by time of day and solo dining.",city:'청주',category:'food',name:'마중가는길',area:'상당구 · 문의면',address:'충북 청주시 상당구 문의면 대청호반로 845-5',description:'대청호 근처의 한정식 식당. 시간대별 소음과 혼자 이용 경험을 모으고 있습니다.',source:'https://app.catchtable.co.kr/ct/shop/majung',checked:'2026-09-10',tags:['한정식','문의면']},
{id:'cj-drive',descriptionEn:"A drive candidate along the lakeside road. Detailed routes and stopping points have not yet been surveyed.",city:'청주',category:'drive',name:'문의 대청호반로',area:'상당구 · 문의면',address:'청주 문의면 대청호반로 · 문의문화재단지 주변',description:'호반 도로를 둘러보는 드라이브 후보. 상세 경로와 정차 지점은 답사 전입니다.',source:'https://www.youtube.com/watch?v=ymc0ih_jBpI',checked:'2026-09-10',tags:['호반 도로','경로 검토 중']},
{id:'cj-oji',descriptionEn:"A caf\u00e9 candidate in Suamgol. As a known destination, quieter visiting times still need to be verified.",city:'청주',category:'cafe',name:'오지',area:'상당구 · 수암골',address:'충북 청주시 상당구 수암로36번길 13',description:'수암골의 카페 후보. 알려진 장소인 만큼 한산한 시간대가 있는지 확인이 필요합니다.',source:'https://www.instagram.com/reel/DUo-TqGEuKg/',checked:'2026-09-10',tags:['수암골','카페']},
{id:'cj-soyeon',descriptionEn:"A pot-rice set-menu restaurant candidate in Mipyeong-dong. Crowds and solo dining comfort are not yet verified.",city:'청주',category:'food',name:'소연재',area:'서원구 · 미평동',address:'충북 청주시 서원구 청남로 1865-6',description:'미평동의 솥밥 정식 식당 후보. 혼잡도와 혼자 이용 편의는 아직 미확인입니다.',source:'https://jdblue2022.tistory.com/entry/%EC%B2%AD%EC%A3%BC-%ED%95%9C%EC%A0%95%EC%8B%9D-%EB%A7%9B%EC%A7%91-%EB%B2%A0%EC%8A%A4%ED%8A%B810',checked:'2026-09-10',tags:['솥밥','한식']},
{id:'cj-sangchun',descriptionEn:"A traditional-house Korean set-menu restaurant candidate. Check reservations and party-size requirements with the venue.",city:'청주',category:'food',name:'상춘고택',area:'흥덕구 · 옥산면',address:'충북 청주시 흥덕구 옥산면 · 상세 위치는 지도에서 확인',description:'한옥 한정식 식당 후보. 예약과 이용 인원 조건은 방문 전 매장에 확인해 주세요.',source:'https://www.instagram.com/reel/DMt1AqmCPiw/',checked:'2026-09-10',tags:['한옥','한정식']},
{id:'seoul-suyeon',descriptionEn:"A traditional-house teahouse in Seongbuk-dong. Check how quiet it feels at your visiting time.",city:'서울',category:'cafe',name:'수연산방',area:'성북구 · 성북동',address:'서울 성북구 성북로26길 8',description:'성북동의 한옥 찻집. 방문 시간별 조용함을 직접 확인해 주세요.',source:'https://www.instagram.com/reel/C7Ouw2PSXkE/',checked:'2026-09-10',tags:['한옥','전통차']},
{id:'seoul-sueno',descriptionEn:"A cultural space with exhibitions and a caf\u00e9. Performances and events can change the atmosphere.",city:'서울',category:'cafe',name:'수애뇨339',area:'종로구 · 평창동',address:'서울 종로구 평창길 339',description:'전시와 카페가 함께 있는 복합예술공간. 공연·행사에 따라 분위기가 달라질 수 있습니다.',source:'https://sueno339.com/',checked:'2026-09-10',tags:['전시 공간','카페']},
{id:'seoul-san',descriptionEn:"A hillside caf\u00e9 candidate in Buam-dong. Check opening status and crowds before visiting.",city:'서울',category:'cafe',name:'산모퉁이',area:'종로구 · 부암동',address:'서울 종로구 백석동길 153',description:'부암동 언덕에 자리한 카페 후보. 방문 전 운영 여부와 혼잡도를 확인해 주세요.',source:'https://www.touringwiki.com/',checked:'2026-09-10',tags:['부암동','카페']},
{id:'seoul-jaha',descriptionEn:"A dumpling restaurant candidate in Buam-dong. Mealtime crowds and comfort are recorded separately.",city:'서울',category:'food',name:'자하손만두',area:'종로구 · 부암동',address:'서울 종로구 백석동길 12',description:'부암동의 만두 식당 후보. 식사 시간대의 혼잡도와 편안함을 따로 기록합니다.',source:'https://www.instagram.com/reel/DRjaBBbErJM/',checked:'2026-09-10',tags:['만두','부암동']},
{
 id:'seoul-bugak',
 descriptionEn:'A June 4, 2026 notice announced parking and partial facility closures at Bugak Palgakjeong from June 8 during works. A drive candidate around Bugak Palgakjeong; traffic and parking congestion vary by time. Reconfirm current access before driving there.',
 city:'서울',category:'drive',name:'북악스카이웨이',area:'종로구 · 북악산로',address:'서울 종로구 북악산로 267 · 북악팔각정 기준',
 description:'2026-06-04 공지에서 6월 8일부터 공사 기간 북악팔각정 주차장 등 일부 시설 미운영을 안내했습니다. 북악팔각정 주변의 드라이브 후보로, 교통·주차 혼잡은 시간대에 따라 달라집니다. 차량 방문 전 최신 운영 안내를 확인해 주세요.',
 source:'https://www.ijongno.co.kr/www/139?action=read&action-value=03c466b9a93a003efb3a8145c4ff83cf',checked:'2026-10-11',tags:['드라이브','전망'],
 visitDetails:[{
  labelKo:'주차·공사 안내',labelEn:'Parking and closures',
  textKo:'2026-06-04 공지는 6월 8일부터 공사 기간 주차장 등 일부 시설 미운영을 안내합니다. 같은 공지에서 야외정원과 공용화장실은 정상 운영한다고 설명하며, 공사 종료일은 적혀 있지 않습니다. 2026-10-11 확인 기준, 해당 공지 이후의 재개방 공지는 확인하지 못했으므로, 현재 주차·시설 이용 가능 여부는 차량 방문 전 종로구시설관리공단의 최신 안내로 다시 확인해 주세요.',
  textEn:'The June 4, 2026 notice announced parking and partial facility closures from June 8 during works. It said outdoor gardens and public toilets would remain open, and gave no end date. As of October 11, 2026, a later reopening notice has not been verified. Check the latest Jongno-gu Facilities Management Corporation guidance for current parking and facility access before driving there.',
  source:'https://www.ijongno.co.kr/www/139?action=read&action-value=03c466b9a93a003efb3a8145c4ff83cf',checked:'2026-10-11',
 }],
},
];
export {labels} from './place-labels';

const seen=new Set(original.map(p=>p.name.replace(/\s/g,'')));
const korean:Place[]=[...original,...(national as Place[]).filter(p=>!seen.has(p.name.replace(/\s/g,'')))];

const guideById=new Map(guides.map(p=>[p.id,p]));
export const catalog:Place[]=[...korean.map(p=>({...p,...guideById.get(p.id),country:'KR' as const})),...(american as Place[]),...(privateCatalog as Place[]),...(restCatalog as Place[]),...(japan as Place[]),...(expanded as Place[])].map(p=>({...p,recommendationReasons:(recommendationEvidence as Record<string,import('./place-presentation').RecommendationReason[]>)[p.id],externalMemo:(externalMemos as Record<string,ExternalMemo>)[p.id],...(locations as Record<string,Pick<Place,'lat'|'lon'|'locationInfo'>>)[p.id],conditions:(conditionCatalog as Record<string,ConditionFact[]>)[p.id]||[]}));

const visitById=visitInformation as Record<string,{visitDetails?:VisitDetail[];visitFacts?:VisitFacts;conditions?:ConditionFact[]}>;
for(const place of catalog){
 // Preserve primary-source provenance before checked becomes a merged-record date.
 place.sourceChecked=place.sourceChecked||place.checked;
 const extra=visitById[place.id];
 const original=(place.visitDetails||[]).map(d=>({...d,source:d.source||place.source,checked:d.checked||place.checked}));
 if(extra){
  const fresh=extra.visitDetails||[],labels=new Set(fresh.map(d=>d.labelEn));
  place.visitDetails=[...fresh,...original.filter(d=>!labels.has(d.labelEn))];
  place.visitFacts={...place.visitFacts,...extra.visitFacts};
  place.checked=fresh.map(d=>d.checked||place.checked).concat(place.checked).sort().at(-1)!;
  const kinds=new Set((extra.conditions||[]).map(d=>d.kind));
  place.conditions=[...(extra.conditions||[]),...(place.conditions||[]).filter(d=>!kinds.has(d.kind)&&!(d.kind==='parking'&&extra.visitFacts?.parking?.status==='unavailable'))];
 }else place.visitDetails=original;
 place.sourceChecked=[place.sourceChecked,...(place.visitDetails||[]).filter(d=>d.source===place.source).map(d=>d.checked||place.sourceChecked)].sort().at(-1)!;
}
