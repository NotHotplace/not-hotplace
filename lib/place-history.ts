export type PlaceHistoryEntry={hookKo:string;hookEn:string;facts:{ko:string;en:string}[];source:string;sourceKo:string;sourceEn:string;checked:string};
const placeHistories:Record<string,PlaceHistoryEntry>={
 'kr-seoul-seonyudo-park':{
  hookKo:'정수장의 콘크리트 기둥과 수조가 정원이 된 섬이에요.',
  hookEn:'A former water-treatment plant, where concrete columns and tanks became gardens.',
  facts:[
   {ko:'선유도는 1978년부터 2000년까지 서울 서남부에 수돗물을 공급하던 정수장이었습니다.',en:'From 1978 to 2000, Seonyudo supplied tap water to southwestern Seoul.'},
   {ko:'2002년 공원으로 바뀌면서 기존 구조물을 살렸습니다.',en:'It became a park in 2002, retaining structures from the treatment plant.'},
   {ko:'지붕을 걷어낸 정수지의 기둥과 수생식물이 자라는 옛 수조에서 그 흔적을 찾아보세요.',en:'Look for the former reservoir’s roofless columns and the old tanks now filled with aquatic plants.'},
  ],
  source:'https://www.seoul.go.kr/story/architecture/2021/today_02.html',sourceKo:'서울시 건축 이야기',sourceEn:'Seoul Metropolitan Government: architecture story',checked:'2026-10-15',
 },
 'kr-seoul-forest':{
  hookKo:'꽃이 자라는 갤러리정원에는 옛 정수장의 구조물이 남아 있어요.',
  hookEn:'The Gallery Garden’s flowers grow among structures from a former water-treatment plant.',
  facts:[
   {ko:'서울숲 일대는 정수장과 경마장·골프장 등으로 쓰이던 곳입니다.',en:'The Seoul Forest area once accommodated a water-treatment plant, a racecourse and a golf course.'},
   {ko:'2005년 6월 18일 도시숲으로 문을 열었습니다.',en:'It opened as an urban forest on June 18, 2005.'},
   {ko:'갤러리정원은 옛 정수장 침전조 구조물을 활용해 만들었습니다.',en:'The Gallery Garden incorporates structures from the former plant’s settling tanks.'},
  ],
  source:'https://parks.seoul.go.kr/park/detailView.do?pIdx=5',sourceKo:'서울시 서울숲 공원 안내',sourceEn:'Seoul Metropolitan Government: Seoul Forest guide',checked:'2026-10-15',
 },
};
export function historyForPlace(id:string):PlaceHistoryEntry|undefined{return Object.hasOwn(placeHistories,id)?placeHistories[id]:undefined;}
