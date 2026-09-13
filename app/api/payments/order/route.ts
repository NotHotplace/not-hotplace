import {getSiteUser,siteOrigin} from '@/lib/site-auth';
import {db} from '@/lib/store';
import {membershipFor,paymentConfig} from '@/lib/membership';
import {plans,addMonths} from '@/lib/plans';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'허용되지 않은 요청입니다.'},{status:403});
 const user=await getSiteUser();if(!user)return Response.json({error:'로그인 후 이용해 주세요.'},{status:401});
 const config=paymentConfig();if(!config.ready)return Response.json({error:'유료 이용권은 아직 준비 중이에요.'},{status:503});
 try{const body=await request.json() as any,plan=plans.find(p=>p.id===body.planId);if(!plan||body.consent!==true)return Response.json({error:'상품과 결제 동의를 확인해 주세요.'},{status:400});
 const d=db(),now=Date.now(),m=await membershipFor(user.userId);if(m.kind==='paid')return Response.json({error:'이미 이용권이 활성화되어 있어요. 만료 후 다시 구매할 수 있어요.'},{status:409});
 await d.prepare("UPDATE payment_orders SET status='expired' WHERE user_id=? AND status='pending' AND created_at<?").bind(user.userId,now-30*60000).run();
 let order=await d.prepare("SELECT * FROM payment_orders WHERE user_id=? AND status='pending' ORDER BY created_at DESC LIMIT 1").bind(user.userId).first<any>();
 if(order&&order.plan_id!==plan.id)return Response.json({error:'진행 중인 다른 이용권 결제가 있어요. 30분 뒤 다시 선택해 주세요.'},{status:409});
 if(!order){const id='nhp_'+crypto.randomUUID(),customerKey=crypto.randomUUID(),until=addMonths(Math.max(now,m.until||0),plan.months);await d.prepare("INSERT OR IGNORE INTO payment_orders(id,user_id,customer_key,plan_id,amount,months,status,created_at,access_until) VALUES(?,?,?,?,?,?,'pending',?,?)").bind(id,user.userId,customerKey,plan.id,plan.amount,plan.months,now,until).run();order=await d.prepare("SELECT * FROM payment_orders WHERE user_id=? AND status='pending' LIMIT 1").bind(user.userId).first<any>();}
 if(!order||order.plan_id!==plan.id)return Response.json({error:'다른 결제가 진행 중이에요. 잠시 후 다시 확인해 주세요.'},{status:409});
 return Response.json({clientKey:config.client,test:config.test,customerKey:order.customer_key,amount:{currency:'KRW',value:order.amount},orderId:order.id,orderName:'Not_Hotplace Plus '+plan.name+' 이용권',successUrl:siteOrigin()+'/payments/success',failUrl:siteOrigin()+'/payments/fail'});
 }catch(e){console.error('order failed',e);return Response.json({error:'주문을 준비하지 못했어요. 다시 시도해 주세요.'},{status:503});}
}
