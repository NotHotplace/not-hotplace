import {getSiteUser} from '@/lib/site-auth';
import {db} from '@/lib/store';
import {toss,reconcilePayment} from '@/lib/payment-service';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'허용되지 않은 요청입니다.'},{status:403});const user=await getSiteUser();if(!user)return Response.json({error:'결제한 계정으로 로그인해 주세요.'},{status:401});
 try{const b=await request.json() as any;if(typeof b.orderId!=='string'||typeof b.paymentKey!=='string'||b.paymentKey.length>300)return Response.json({error:'결제 정보가 올바르지 않아요.'},{status:400});const order=await db().prepare('SELECT * FROM payment_orders WHERE id=? AND user_id=?').bind(b.orderId,user.userId).first<any>();
 if(!order)return Response.json({error:'주문을 찾을 수 없어요.'},{status:404});if(order.amount!==Number(b.amount))return Response.json({error:'결제 금액이 주문과 달라요.'},{status:400});
 if(order.status==='paid')return Response.json({ok:true,until:order.access_until});if(order.status!=='pending'||Date.now()-order.created_at>30*60000)return Response.json({error:'결제 요청이 만료되었어요.'},{status:409});
 let p;try{p=await toss('/v1/payments/confirm',{orderId:order.id,paymentKey:b.paymentKey,amount:order.amount},order.id);}catch{p=await toss('/v1/payments/'+encodeURIComponent(b.paymentKey));}
 const result=await reconcilePayment(order,p);if(result.status!=='DONE')return Response.json({error:'취소된 결제입니다.'},{status:409});return Response.json({ok:true,until:order.access_until});
 }catch(e){console.error('payment confirmation failed');return Response.json({error:e instanceof Error?e.message:'결제를 확인하지 못했어요.'},{status:503});}
}
