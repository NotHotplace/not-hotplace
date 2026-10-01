import Journal from './journal';
export const metadata={title:'내 쉼 기록 | NotHotplace',robots:{index:false,follow:true}};
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string}>}){const params=await searchParams;return <Journal language={params.lang==='en'?'en':'ko'}/>;}
