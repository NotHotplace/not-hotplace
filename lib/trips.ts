export type Trip={id:string;theme:'temple'|'forest'|'slow';title:string;duration:string;description:string;steps:string[];tip:string;category:'cafe'|'drive';query?:string};
export const tripThemes={temple:'템플스테이',forest:'숲에서 쉬기',slow:'느린 하루'};
// Editorial itinerary ideas. These are not bookable products or claims about a specific venue.
export const trips:Trip[]=[
 {id:'temple-rest',theme:'temple',title:'일정을 비우는 하룻밤',duration:'1박 2일 아이디어',description:'휴식형 템플스테이를 찾아, 아무것도 하지 않는 시간을 남겨보세요.',steps:['공식 사이트에서 지역과 휴식형 프로그램 살펴보기','입실 시간과 사찰 생활 안내 확인하기','자유 시간에는 산책이나 조용한 휴식'],tip:'사찰별 일정과 참여 조건이 달라요. 예약 전 공식 안내를 확인하세요.',category:'cafe'},
 {id:'temple-day',theme:'temple',title:'가볍게 만나는 사찰의 하루',duration:'당일 아이디어',description:'숙박이 부담스럽다면 당일 프로그램부터 살펴보세요.',steps:['당일 체험이 있는 운영사찰 찾아보기','제공되는 프로그램과 소요 시간 확인하기','체험 뒤 가까운 카페에서 하루 정리하기'],tip:'차담·명상 등의 제공 여부는 프로그램마다 달라요.',category:'cafe'},
 {id:'temple-alone',theme:'temple',title:'혼자 떠나는 쉼',duration:'1박 2일 아이디어',description:'내 속도대로 머물 수 있는 일정을 계획해보세요.',steps:['혼자 참가할 수 있는 프로그램 확인하기','방 배정과 준비물 확인하기','돌아오는 길에 여유 시간 남기기'],tip:'1인 참가와 1인 객실은 서로 다른 조건이에요. 객실 기준을 확인하세요.',category:'drive'},
 {id:'forest-walk',theme:'forest',title:'숲길 한 바퀴, 차 한 잔',duration:'반나절 아이디어',description:'멀리 가기보다 짧은 숲길과 쉬는 시간을 함께 계획해보세요.',steps:['숲나들e에서 가까운 자연휴양림 찾기','탐방 가능 시간과 산책로 개방 여부 확인하기','산책 뒤 카페에서 천천히 쉬기'],tip:'입장·주차·탐방로 이용 조건은 방문지 공지를 확인하세요.',category:'cafe'},
 {id:'forest-night',theme:'forest',title:'숲에서 보내는 하룻밤',duration:'1박 2일 아이디어',description:'자연휴양림 숙박을 살펴보고, 이동이 적은 하루를 만들어보세요.',steps:['공식 예약 사이트에서 숙박 가능 날짜 찾기','입실 시간과 식사·준비물 계획하기','다음 날 짧은 산책 후 여유 있게 귀가하기'],tip:'예약 가능 객실과 요금은 공식 사이트에서 실시간으로 확인하세요.',category:'drive'},
 {id:'forest-drive',theme:'forest',title:'풍경을 따라 천천히',duration:'당일 아이디어',description:'드라이브 거점 한 곳과 짧은 산책만으로도 충분한 하루.',steps:['지도에서 가까운 드라이브 후보 고르기','공식 주차장과 정차 가능한 곳 확인하기','도착 후에는 차에서 내려 풍경 즐기기'],tip:'출발 전 기상과 도로 통제 여부를 확인하고, 지정된 곳에 주차하세요.',category:'drive'},
 {id:'slow-book',theme:'slow',title:'책 한 권과 오후',duration:'2~3시간 아이디어',description:'일정 대신 읽고 싶던 책 한 권을 챙겨보세요.',steps:['카페 후보와 최근 방문 후기 살펴보기','이용 시간과 좌석·주문 조건 확인하기','읽은 만큼만, 쉬고 싶은 만큼 머물기'],tip:'실내 분위기와 혼잡도는 시간대에 따라 달라질 수 있어요.',category:'cafe'},
 {id:'slow-hanok',theme:'slow',title:'한옥에서 차 한 잔',duration:'반나절 아이디어',description:'한옥 카페를 찾아 짧은 동네 산책을 더해보세요.',steps:['한옥 카페 후보 살펴보기','운영 여부와 찾아가는 길 확인하기','주변 골목을 걷고 쉬어가기'],tip:'주거 지역에서는 주민들의 일상을 배려해 주세요.',category:'cafe',query:'한옥'},
 {id:'slow-water',theme:'slow',title:'물가에서 쉬어가기',duration:'당일 아이디어',description:'호수나 바다가 보이는 드라이브 후보를 둘러보세요.',steps:['지도에서 드라이브 후보와 위치 확인하기','안전한 산책 구간과 주차장 찾아보기','풍경을 본 뒤 체크 후기로 경험 남기기'],tip:'수변 통제 구간과 기상 상황은 현장 안내를 따라주세요.',category:'drive'},
];
export const tripSources={temple:{name:'템플스테이 공식 사이트',url:'https://www.templestay.com/'},forest:{name:'숲나들e 공식 사이트',url:'https://www.foresttrip.go.kr/'}};
