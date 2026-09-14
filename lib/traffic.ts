import {db} from './store';
export function koreaDay(time=Date.now()){return new Date(time+9*60*60*1000).toISOString().slice(0,10);}
export async function trafficSummary(){
 const now=Date.now(),today=koreaDay(now),week=koreaDay(now-6*86400000),month=koreaDay(now-29*86400000);
 const traffic=await db().prepare('SELECT MIN(day) since, COALESCE(SUM(CASE WHEN day=? THEN views ELSE 0 END),0) today, COALESCE(SUM(CASE WHEN day>=? THEN views ELSE 0 END),0) week, COALESCE(SUM(CASE WHEN day>=? THEN views ELSE 0 END),0) month FROM daily_visits').bind(today,week,month).first<{since:string|null;today:number;week:number;month:number}>();
 const days=await db().prepare('SELECT day,views FROM daily_visits WHERE day>=? ORDER BY day DESC').bind(month).all<{day:string;views:number}>();
 const activity=await db().prepare("SELECT (SELECT COUNT(*) FROM reviews) reviews, (SELECT COUNT(*) FROM saved) saves, (SELECT COUNT(*) FROM suggestions WHERE status='pending') pending").first<{reviews:number;saves:number;pending:number}>();
 return {traffic:traffic||{since:null,today:0,week:0,month:0},days:days.results,activity:activity||{reviews:0,saves:0,pending:0}};
}
