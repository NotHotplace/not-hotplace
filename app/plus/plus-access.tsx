'use client';
import {useEffect,useState,useCallback} from 'react';
import Membership from '../membership';
type Access={signedIn:boolean;membership?:{active:boolean;trialUsed:boolean;until:number|null;kind:string};paymentsReady:boolean;paymentsTest?:boolean};
export default function PlusAccess(){
 const [data,setData]=useState<Access|null>(null),[open,setOpen]=useState(false),[error,setError]=useState('');
 const reload=useCallback(async()=>{const response=await fetch('/api/data',{cache:'no-store'});if(!response.ok)throw new Error('이용권 상태를 불러오지 못했어요. 다시 시도해 주세요.');const result=await response.json() as Access;setData(result);setError('');return result;},[]);
 useEffect(()=>{reload().catch(e=>setError(e.message));},[reload]);
 return <section className="plus-access">{data?<><button className="rest-primary" onClick={()=>setOpen(true)}>{data.membership?.active?'내 이용권 확인':data.signedIn?'무료 체험·기간권 확인':'로그인·무료 체험 안내'}</button>{!data.paymentsReady&&<p className="rest-note">유료 판매는 준비 중이에요. 무료 체험은 로그인 후 이용할 수 있어요.</p>}<Membership open={open} setOpen={setOpen} signedIn={data.signedIn} membership={data.membership} paymentsReady={data.paymentsReady} paymentsTest={data.paymentsTest} onChanged={reload}/></>:error?<><p role="alert">{error}</p><button className="rest-primary" onClick={()=>reload().catch(e=>setError(e.message))}>다시 불러오기</button></>:<p role="status">이용권 상태 확인 중…</p>}</section>;
}
