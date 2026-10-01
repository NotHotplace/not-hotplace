import CommunityEditor from '../community-editor';
export const metadata={title:'지역 발견자 신청 | NotHotplace',robots:{index:false,follow:false}};
export default async function Join({searchParams}:{searchParams:Promise<{lang?:string}>}){return <CommunityEditor language={(await searchParams).lang==='en'?'en':'ko'}/>;}
