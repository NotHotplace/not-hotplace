import {db} from '@/lib/store';
import {toss,reconcilePayment} from '@/lib/payment-service';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const raw=await request.text();if(raw.length>30000)return new Response('',{status:413});const b=JSON.parse(raw),id=b.data?.orderId,key=b.data?.paymentKey;if(typeof id!=='string'||typeof key!=='string')return new Response('',{status:204});
 const order=await db().prepare('SELECT * FROM payment_orders WHERE id=?').bind(id).first<any>();if(!order)return new Response('',{status:204});
 const p=await toss('/v1/payments/'+encodeURIComponent(key));const result=await reconcilePayment(order,p);if(result.requiresReview)return Response.json({error:'Order state requires manual review'},{status:409});return Response.json({ok:true});
 }catch{return new Response('Payment verification failed',{status:503});}}
