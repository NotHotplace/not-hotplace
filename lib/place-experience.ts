import {db, hasPlace} from './store';
import {qualityState} from './discovery';
import {getSiteUser} from './site-auth';
import {membershipFor} from './membership';
export async function placeExperience(id: string) {
  if (!await hasPlace(id)) return null;
  const user = await getSiteUser(), d = db(), now = Date.now(), cutoff = now - 90 * 86400000;
  const plus = user ? (await membershipFor(user.userId)).active : false;
  const [summary, recent, stopped, saved, review, buckets] = await Promise.all([
    d.prepare("SELECT COUNT(*) count,COALESCE(SUM(satisfied),0) positive,COALESCE(SUM(CASE WHEN noise='조용함' THEN 1 ELSE 0 END),0) quiet,COALESCE(SUM(CASE WHEN crowd='여유로움' THEN 1 ELSE 0 END),0) relaxed,MAX(updated_at) latest FROM reviews WHERE place_id=? AND updated_at>=?").bind(id, cutoff).first<any>(),
    d.prepare("SELECT COUNT(*) n,SUM(CASE WHEN noise='시끄러움' OR crowd='붐빔' THEN 1 ELSE 0 END) bad,COUNT(DISTINCT date(updated_at/1000,'unixepoch')) days,MIN(updated_at) first,MAX(updated_at) last FROM reviews WHERE place_id=? AND updated_at>=?").bind(id, now - 30 * 86400000).first<any>(),
    d.prepare("SELECT place_id FROM place_moderation WHERE place_id=? AND mode='paused' UNION SELECT place_id FROM place_quality WHERE place_id=? AND paused=1").bind(id, id).first(),
    user ? d.prepare('SELECT place_id FROM saved WHERE user_id=? AND place_id=?').bind(user.userId, id).first() : null,
    user ? d.prepare('SELECT satisfied,noise,crowd,comfort,day,time,tags,updated_at FROM reviews WHERE user_id=? AND place_id=?').bind(user.userId, id).first<any>() : null,
    plus ? d.prepare("SELECT day,time,COUNT(*) n,SUM(CASE WHEN noise='조용함' THEN 1 ELSE 0 END) quiet,SUM(CASE WHEN crowd='여유로움' THEN 1 ELSE 0 END) relaxed FROM reviews WHERE place_id=? AND updated_at>=? GROUP BY day,time").bind(id, cutoff).all<any>() : null,
  ]);
  return {summary, resting: !!stopped || qualityState(recent, now) === 'resting', signedIn: !!user, saved: !!saved, review, plus, insights: buckets?.results || []};
}
export type PlaceExperience = NonNullable<Awaited<ReturnType<typeof placeExperience>>>;
