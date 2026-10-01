import {usRegions} from './us-regions';
import {regionKeys} from './regions';
export const countryCodes=['KR','US','JP'] as const;
export type CountryCode=typeof countryCodes[number];
export const japanRegions=['Tokyo','Kyoto','Osaka'] as const;
export const countries={
 KR:{slug:'kr',nameKo:'한국',nameEn:'South Korea',regions:['청주',...regionKeys],defaultRegion:'서울'},
 US:{slug:'us',nameKo:'미국',nameEn:'United States',regions:[...usRegions],defaultRegion:'New York'},
 JP:{slug:'jp',nameKo:'일본',nameEn:'Japan',regions:[...japanRegions],defaultRegion:'Tokyo'},
} as const;
export function countryCode(value:unknown):CountryCode{return countryCodes.includes(value as CountryCode)?value as CountryCode:'KR';}
export function countryForRegion(region:string):CountryCode{return japanRegions.includes(region as typeof japanRegions[number])?'JP':usRegions.includes(region as typeof usRegions[number])?'US':'KR';}
export function countryPath(country:CountryCode){return '/'+countries[country].slug;}
