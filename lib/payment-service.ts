import {db} from './store';
import {paymentConfig} from './membership';
export async function toss(path:string,body?:unknown,idempotency?:string){
 const cfg=paymentConfig();if(!cfg.ready)throw new Error('결제 연결이 아직 준비되지 않았어요.');
 const res=await fetch('https://api.tosspayments.com'+path,{method:body?'POST':'GET',headers:{Authorization:'Basic '+btoa(cfg.secret+':'),'Content-Type':'application/json',...(idempotency?{'Idempotency-Key':idempotency}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
 const p=await res.json() as any;if(!res.ok)throw new Error('결제사 확인에 실패했어요. 결제 내역을 확인하고 다시 시도해 주세요.');return p;
}
export async function reconcilePayment(order:any,p:any){
 if(p.orderId!==order.id||p.totalAmount!==order.amount||p.currency!=='KRW'||typeof p.paymentKey!=='string')throw new Error('결제 정보가 주문과 일치하지 않아요.');
 if(order.payment_key&&order.payment_key!==p.paymentKey)throw new Error('결제 키가 일치하지 않아요.');
 const d=db();if(p.status==='DONE')await d.prepare("UPDATE payment_orders SET status='paid',payment_key=?,paid_at=COALESCE(paid_at,?) WHERE id=? AND status IN ('pending','paid')").bind(p.paymentKey,Date.now(),order.id).run();
 else if(p.status==='CANCELED'||p.status==='PARTIAL_CANCELED')await d.prepare("UPDATE payment_orders SET status='refunded',payment_key=? WHERE id=? AND status IN ('pending','paid','refunded')").bind(p.paymentKey,order.id).run();
 else throw new Error('완료된 결제를 확인하지 못했어요.');
 return {status:p.status};
}
