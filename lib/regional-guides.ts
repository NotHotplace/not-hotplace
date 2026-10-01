import type {CountryCode} from './countries';
import {regionKeys,inRegion} from './regions';
import type {Place} from './catalog';
export type RegionalGuide={slug:string;country:CountryCode;region:string;nameKo:string;nameEn:string;introKo:string;introEn:string;notesKo:string[];notesEn:string[];area?:string};
const names=['Seoul','Busan','Daegu','Incheon','Gwangju','Daejeon','Ulsan','Sejong','Gyeonggi','Gangwon','Chungbuk','Chungnam','Jeonbuk','Jeonnam','Gyeongbuk','Gyeongnam','Jeju'];
const local:Record<string,[string,string]>={
 서울:['동네 카페에서 전통 찻집까지, 이동 거리를 줄이고 한곳에 머무는 하루를 계획해보세요.','Plan a slower day around a neighborhood café or traditional teahouse, with fewer transfers.'],
 부산:['바다 근처의 공간과 도심 카페를 비교해보세요. 해안 이동 시간과 매장의 주차 조건을 함께 확인하면 좋아요.','Compare coastal stops and city cafés. Check travel time along the coast and venue parking.'],
 제주:['카페와 해안 풍경을 하루에 너무 많이 넣지 말고, 머물 곳 하나를 먼저 골라보세요.','Choose one place to linger before filling your day with cafés and coastal sights.'],
 경기:['서울 밖의 카페와 자연 거점을 둘러보세요. 도시 간 이동 거리와 예약 조건을 먼저 비교해요.','Explore cafés and outdoor stops beyond Seoul. Compare travel distance and reservation requirements.'],
 강원:['산과 호수, 해안 근처의 후보를 찾아보세요. 날씨와 계절에 따라 이동·이용 조건이 달라질 수 있어요.','Find candidates near mountains, lakes and the coast. Weather and seasons can change access.'],
 충북:['청주·충주 등 내륙의 카페와 산책 거점을 살펴보세요. 호반 코스는 주차와 실제 보행 구간을 확인해요.','Explore inland cafés and walks around Cheongju and Chungju. Check parking and walking access on lake routes.'],
};
export const regionalGuides:RegionalGuide[]=[...regionKeys.map((region,i)=>({slug:names[i].toLowerCase(),country:'KR' as const,region,nameKo:region,nameEn:names[i],introKo:local[region]?.[0]||`${region}에서 커피 한 잔과 식사, 짧은 산책을 계획해보세요. 사진이 있는 곳과 실제 방문 후기가 있는 곳을 구분해서 살펴볼 수 있어요.`,introEn:local[region]?.[1]||`Plan a coffee break, meal or short walk in ${names[i]}. Compare available photos and visitor feedback separately.`,notesKo:['운영 시간·휴무와 마지막 주문 확인','가격·예약·최소 이용 인원 확인','조용함은 방문 요일·시간별 후기로 확인'],notesEn:['Check hours, closures and last orders','Confirm prices, reservations and minimum party size','Use day-and-time visitor reports to assess quietness']})),
 {slug:'cheongju',country:'KR',region:'청주',nameKo:'청주',nameEn:'Cheongju',introKo:'문의면의 호반 나들이와 내수읍의 식사·카페를 비교해보세요. 정식의 최소 주문 인원과 주차 가능 여부를 확인하고 이동할 곳을 골라요.',introEn:'Compare a lakeside outing in Munui with food and cafés in Naesu. Check minimum set-meal orders and parking before choosing your stops.',notesKo:['대청호 주변은 정차 가능한 곳에서만 쉬기','1인 식사라면 정식 최소 인원 확인','행사·날씨·주차에 따라 동선 바꾸기'],notesEn:['Stop only where parking is permitted around Daecheong Lake','Check minimum diners for set meals when visiting solo','Adjust plans for events, weather and parking']},
 {slug:'new-york',country:'US',region:'New York',area:'New York City',nameKo:'뉴욕',nameEn:'New York City',introKo:'동네 카페와 허드슨강·이스트강 주변의 공원을 함께 찾아보세요. 도심 광장과 산책 공원의 분위기는 다르므로 목적에 맞게 고르고 행사·공사 안내도 확인해요.',introEn:'Pair neighborhood coffee with parks along the Hudson and East River. Compare urban squares and walking parks, and check event and construction notices.',notesKo:['공원별 개방·통제 공지 확인','카페 영업시간과 실내 좌석 확인','공원 방문은 실제 조용함을 보장하지 않아요'],notesEn:['Check park access and closure notices','Confirm café hours and indoor seating','A park setting does not guarantee a quiet visit']},
 {slug:'portland',country:'US',region:'Oregon',area:'Portland',nameKo:'포틀랜드',nameEn:'Portland',introKo:'동네 커피와 장미 정원, 숲길, 강변 산책을 비교해보세요. 유료 정원과 일반 공원의 조건이 다르고, 비가 오면 길 상태도 확인해야 해요.',introEn:'Compare neighborhood coffee, rose gardens, woodland paths and river walks. Public parks and ticketed gardens have different access rules; check trail conditions in rain.',notesKo:['정원 입장료·예약과 마지막 입장 확인','숲길은 날씨·경사·노면 상태 확인','공원 시설별 운영 시간이 다를 수 있어요'],notesEn:['Check garden tickets, reservations and last entry','Consider weather, slope and trail surfaces','Facilities may have different hours from the park']},
 ...(['Tokyo','Kyoto','Osaka'] as const).map((region,i)=>({slug:region.toLowerCase(),country:'JP' as const,region,nameKo:['도쿄','교토','오사카'][i],nameEn:region,introKo:[
 '연못 정원과 도심 공원을 비교해보세요. 정원 입장 시간과 유료 구역을 확인하면 짧은 일정에도 머물 곳을 고르기 쉬워요.',
 '정원과 사찰 주변의 산책 거점을 찾아보세요. 유료 정원, 사찰 관람, 예약 체험은 서로 다른 조건으로 운영됩니다.',
 '강변 장미 정원과 연못 정원, 넓은 공원에서 다음 쉼을 골라보세요. 경기·행사 일정이 주변 분위기를 바꿀 수 있어요.'
 ][i],introEn:[
 'Compare pond gardens and urban parks. Check garden entry hours and ticketed areas when planning a short pause.',
 'Explore gardens and walks near temples. Garden admission, temple visits and booked experiences have separate conditions.',
 'Find a pause in riverside rose gardens, pond gardens and larger parks. Sports and events can change the atmosphere.'
 ][i],notesKo:['공식 운영 시간·휴원일·마지막 입장 확인','정원·시설별 입장료와 예약 조건 확인','벚꽃·단풍·행사 기간에는 혼잡할 수 있어요'],notesEn:['Check official hours, closure days and last entry','Confirm garden tickets and reservations','Blossom, autumn-leaf and event seasons can be crowded']})),
];
export function findRegionalGuide(slug:string){return regionalGuides.find(g=>g.slug===slug);}
export function regionalPlaces(guide:RegionalGuide,places:Place[]){return places.filter(p=>(p.country||'KR')===guide.country&&inRegion(p,guide.region)&&(!guide.area||p.area.includes(guide.area)||guide.area==='New York City'&&['Brooklyn','Manhattan','Queens','New York City'].some(s=>p.area.includes(s)))).sort((a,b)=>Number(!!b.photos?.length)-Number(!!a.photos?.length)||Number(!!b.visitDetails?.length)-Number(!!a.visitDetails?.length)||a.name.localeCompare(b.name));}
