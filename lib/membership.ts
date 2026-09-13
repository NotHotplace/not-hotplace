import {db} from './store';
import {launchEnv} from './site-auth';
export async function membershipFor(id:string){
 const d=db(),now=Date.now();const [trial,paid]=await Promise.all([d.prepare('SELECT started_at FROM trials WHERE user_id=?').bind(id).first<any>(),d.prepare("SELECT MAX(access_until) until FROM payment_orders WHERE user_id=? AND status='paid'").bind(id).first<any>()]);
 const trialUntil=trial?trial.started_at+7*86400000:0,paidUntil=paid?.until||0,until=Math.max(trialUntil,paidUntil);
 return {active:until>now,trialUsed:!!trial,until:until||null,kind:paidUntil>now?'paid':trialUntil>now?'trial':'free'};
}
export function paymentConfig(){const e=launchEnv(),client=e.TOSS_CLIENT_KEY||'',secret=e.TOSS_SECRET_KEY||'';const test=client.startsWith('test_')&&secret.startsWith('test_'),live=client.startsWith('live_')&&secret.startsWith('live_')&&e.PAYMENTS_LIVE_ENABLED==='true'&&!!e.BUSINESS_NAME&&!!e.BUSINESS_NUMBER&&!!e.SUPPORT_EMAIL&&!!e.BUSINESS_ADDRESS&&e.TERMS_CONFIRMED==='true';return {ready:!!(client&&secret&&(test||live)),client,secret,test};}
