export const campaignCodes=['none','brand','seoul_solo','cheongju_slow','private_room','spa','waterside','temple','us_slow','review','photo_guides','finder','weekend'] as const;
export type CampaignCode=typeof campaignCodes[number];
export const campaignLabels:Record<CampaignCode,string>={none:'일반 탐색',brand:'브랜드 소개',seoul_solo:'서울 혼자 쉬기',cheongju_slow:'청주 느린 하루',private_room:'프라이빗 룸',spa:'프리미엄 스파',waterside:'물가에서 쉬기',temple:'템플스테이',us_slow:'미국의 쉼',review:'체크 후기',photo_guides:'사진 가이드 30곳',finder:'조건별 추천',weekend:'주말의 쉼'};
export function campaignCategory(value:string|null):CampaignCode{return campaignCodes.includes(value as CampaignCode)?value as CampaignCode:'none';}
