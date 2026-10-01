'use client';
import type {CountryCode} from '@/lib/countries';
import {useEffect,useRef} from 'react';
import {trackEngagement} from '@/lib/engagement-client';
export default function GuideEngagement({country}:{country:CountryCode}){const counted=useRef(false);useEffect(()=>{if(!counted.current){counted.current=true;trackEngagement('guide_view',country);}},[country]);return null;}
