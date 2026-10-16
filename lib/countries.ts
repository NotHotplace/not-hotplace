import {usRegions} from './us-regions';
import {regionKeys} from './regions';
export const countryCodes=['KR','US','JP','GB','FR','DE','ES','IT','PT','NL','AT','CZ','HU','KZ','UZ','KG','SG','TH','TW','MY','VN','ID','IN','AU','NZ','CA','MX','TR','AE','ZA'] as const;
export type CountryCode=typeof countryCodes[number];
export const japanRegions=['Tokyo','Kyoto','Osaka'] as const;
export const countries={
 KR:{slug:'kr',nameKo:'한국',nameEn:'South Korea',regions:['청주',...regionKeys],defaultRegion:'서울',continent:'Asia',iso3:'KOR',center:[127.7,36.2],currency:'KRW'},
 US:{slug:'us',nameKo:'미국',nameEn:'United States',regions:[...usRegions],defaultRegion:'New York',continent:'North America',iso3:'USA',center:[-98,38],currency:'USD'},
 JP:{slug:'jp',nameKo:'일본',nameEn:'Japan',regions:[...japanRegions],defaultRegion:'Tokyo',continent:'Asia',iso3:'JPN',center:[137,37],currency:'JPY'},
 GB:{slug:'gb',nameKo:'영국',nameEn:'United Kingdom',regions:['London','Edinburgh'],defaultRegion:'London',continent:'Europe',iso3:'GBR',center:[-2,54],currency:'GBP'},
 FR:{slug:'fr',nameKo:'프랑스',nameEn:'France',regions:['Paris','Lyon'],defaultRegion:'Paris',continent:'Europe',iso3:'FRA',center:[2,47],currency:'EUR'},
 DE:{slug:'de',nameKo:'독일',nameEn:'Germany',regions:['Berlin','Munich'],defaultRegion:'Berlin',continent:'Europe',iso3:'DEU',center:[10,51],currency:'EUR'},
 ES:{slug:'es',nameKo:'스페인',nameEn:'Spain',regions:['Madrid','Barcelona'],defaultRegion:'Madrid',continent:'Europe',iso3:'ESP',center:[-4,40],currency:'EUR'},
 IT:{slug:'it',nameKo:'이탈리아',nameEn:'Italy',regions:['Rome','Florence'],defaultRegion:'Rome',continent:'Europe',iso3:'ITA',center:[12.5,42.5],currency:'EUR'},
 PT:{slug:'pt',nameKo:'포르투갈',nameEn:'Portugal',regions:['Lisbon','Porto'],defaultRegion:'Lisbon',continent:'Europe',iso3:'PRT',center:[-8,39.5],currency:'EUR'},
 NL:{slug:'nl',nameKo:'네덜란드',nameEn:'Netherlands',regions:['Amsterdam'],defaultRegion:'Amsterdam',continent:'Europe',iso3:'NLD',center:[5,52],currency:'EUR'},
 AT:{slug:'at',nameKo:'오스트리아',nameEn:'Austria',regions:['Vienna'],defaultRegion:'Vienna',continent:'Europe',iso3:'AUT',center:[14.5,47.5],currency:'EUR'},
 CZ:{slug:'cz',nameKo:'체코',nameEn:'Czechia',regions:['Prague'],defaultRegion:'Prague',continent:'Europe',iso3:'CZE',center:[15.3,49.8],currency:'CZK'},
 HU:{slug:'hu',nameKo:'헝가리',nameEn:'Hungary',regions:['Budapest'],defaultRegion:'Budapest',continent:'Europe',iso3:'HUN',center:[19,47],currency:'HUF'},
 KZ:{slug:'kz',nameKo:'카자흐스탄',nameEn:'Kazakhstan',regions:['Almaty','Astana'],defaultRegion:'Almaty',continent:'Central Asia',iso3:'KAZ',center:[67,48],currency:'KZT'},
 UZ:{slug:'uz',nameKo:'우즈베키스탄',nameEn:'Uzbekistan',regions:['Tashkent','Samarkand','Bukhara'],defaultRegion:'Tashkent',continent:'Central Asia',iso3:'UZB',center:[64.5,41],currency:'UZS'},
 KG:{slug:'kg',nameKo:'키르기스스탄',nameEn:'Kyrgyzstan',regions:['Bishkek'],defaultRegion:'Bishkek',continent:'Central Asia',iso3:'KGZ',center:[75,41],currency:'KGS'},
 SG:{slug:'sg',nameKo:'싱가포르',nameEn:'Singapore',regions:['Singapore'],defaultRegion:'Singapore',continent:'Asia',iso3:'SGP',center:[103.8,1.3],currency:'SGD'},
 TH:{slug:'th',nameKo:'태국',nameEn:'Thailand',regions:['Bangkok','Chiang Mai'],defaultRegion:'Bangkok',continent:'Asia',iso3:'THA',center:[101,15.5],currency:'THB'},
 TW:{slug:'tw',nameKo:'대만',nameEn:'Taiwan',regions:['Taipei','Taichung'],defaultRegion:'Taipei',continent:'Asia',iso3:'TWN',center:[121,23.7],currency:'TWD'},
 MY:{slug:'my',nameKo:'말레이시아',nameEn:'Malaysia',regions:['Kuala Lumpur','George Town'],defaultRegion:'Kuala Lumpur',continent:'Asia',iso3:'MYS',center:[109,4],currency:'MYR'},
 VN:{slug:'vn',nameKo:'베트남',nameEn:'Vietnam',regions:['Hanoi','Ho Chi Minh City'],defaultRegion:'Hanoi',continent:'Asia',iso3:'VNM',center:[106,16],currency:'VND'},
 ID:{slug:'id',nameKo:'인도네시아',nameEn:'Indonesia',regions:['Bogor','Jakarta','Bali'],defaultRegion:'Bogor',continent:'Asia',iso3:'IDN',center:[118,-3],currency:'IDR'},
 IN:{slug:'in',nameKo:'인도',nameEn:'India',regions:['Delhi','Bengaluru','Mumbai'],defaultRegion:'Delhi',continent:'Asia',iso3:'IND',center:[79,22],currency:'INR'},
 AU:{slug:'au',nameKo:'호주',nameEn:'Australia',regions:['Sydney','Melbourne','Perth'],defaultRegion:'Sydney',continent:'Oceania',iso3:'AUS',center:[134,-25],currency:'AUD'},
 NZ:{slug:'nz',nameKo:'뉴질랜드',nameEn:'New Zealand',regions:['Wellington','Auckland','Christchurch'],defaultRegion:'Wellington',continent:'Oceania',iso3:'NZL',center:[173,-41],currency:'NZD'},
 CA:{slug:'ca',nameKo:'캐나다',nameEn:'Canada',regions:['Vancouver','Toronto','Montreal','Victoria'],defaultRegion:'Vancouver',continent:'North America',iso3:'CAN',center:[-106,57],currency:'CAD'},
 MX:{slug:'mx',nameKo:'멕시코',nameEn:'Mexico',regions:['Mexico City'],defaultRegion:'Mexico City',continent:'North America',iso3:'MEX',center:[-102,24],currency:'MXN'},
 TR:{slug:'tr',nameKo:'튀르키예',nameEn:'Türkiye',regions:['Istanbul'],defaultRegion:'Istanbul',continent:'Europe',iso3:'TUR',center:[35,39],currency:'TRY'},
 AE:{slug:'ae',nameKo:'아랍에미리트',nameEn:'United Arab Emirates',regions:['Dubai','Abu Dhabi'],defaultRegion:'Dubai',continent:'Asia',iso3:'ARE',center:[54,24],currency:'AED'},
 ZA:{slug:'za',nameKo:'남아프리카공화국',nameEn:'South Africa',regions:['Cape Town','Johannesburg','Pretoria'],defaultRegion:'Cape Town',continent:'Africa',iso3:'ZAF',center:[25,-29],currency:'ZAR'},
} as const;
export function countryCode(value:unknown):CountryCode{return countryCodes.includes(value as CountryCode)?value as CountryCode:'KR';}
export function countryForRegion(region:string):CountryCode{return countryCodes.find(code=>(countries[code].regions as readonly string[]).includes(region))||'KR';}
export function countryPath(country:CountryCode){return '/'+countries[country].slug;}
