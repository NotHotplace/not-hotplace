'use client';
import type {ReactNode} from 'react';
import type {CountryCode} from '@/lib/countries';
import {trackEngagement} from '@/lib/engagement-client';
import {recordPause} from '@/lib/rest-journal';
export default function TrackedMapLink({id,country,href,children}:{id:string;country:CountryCode;href:string;children:ReactNode}){
 return <a href={href} target="_blank" rel="noopener noreferrer" onClick={()=>{trackEngagement('map_open',country);recordPause({placeId:id,state:'planned',at:Date.now()});}}>{children}</a>;
}

