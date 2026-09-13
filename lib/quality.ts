import {db} from './store';
import {qualityState} from './discovery';
export async function refreshQuality(placeId:string){
 const d=db(),now=Date.now();const e=await d.prepare("SELECT COUNT(*) n,SUM(CASE WHEN noise='시끄러움' OR crowd='붐빔' THEN 1 ELSE 0 END) bad,SUM(CASE WHEN noise='조용함' THEN 1 ELSE 0 END) quiet,COUNT(DISTINCT date(updated_at/1000,'unixepoch')) days,MIN(updated_at) first,MAX(updated_at) last FROM reviews WHERE place_id=? AND updated_at>=?").bind(placeId,now-30*86400000).first<any>();
 const resting=qualityState(e,now)==='resting',recovered=e.n>=8&&e.days>=3&&e.last-e.first>=7*86400000&&e.quiet/e.n>=.8&&e.bad/e.n<=.2;
 if(resting||recovered)await d.prepare('INSERT INTO place_quality(place_id,paused,updated_at) VALUES(?,?,?) ON CONFLICT(place_id) DO UPDATE SET paused=excluded.paused,updated_at=excluded.updated_at').bind(placeId,resting?1:0,now).run();
}
