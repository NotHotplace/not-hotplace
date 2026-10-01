import {z} from 'zod';
import {db} from '@/lib/store';
import {siteOrigin} from '@/lib/site-auth';
import {koreaDay} from '@/lib/traffic';
import {engagementEvents, engagementSources} from '@/lib/engagement';
import {campaignCodes} from '@/lib/campaigns';
const payload = z.object({event: z.enum(engagementEvents), country: z.enum(['KR', 'US']), source: z.enum(engagementSources),campaign:z.enum(campaignCodes).default('none')}).strict();
const reply = (status: number) => new Response(null, {status, headers: {'Cache-Control': 'no-store'}});
export async function POST(request: Request) {
  try {
    if (request.headers.get('origin') !== siteOrigin() || request.headers.get('sec-fetch-site') === 'cross-site') return reply(403);
    if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') return reply(204);
    if (request.headers.get('content-type') !== 'application/json') return reply(415);
    const body = await request.text();
    if (body.length > 200) return reply(413);
    const result = payload.safeParse(JSON.parse(body));
    if (!result.success) return reply(400);
    const {event, country, source,campaign} = result.data;
    if(!['guide_view','recommendation_open'].includes(event)) await db().prepare('INSERT INTO engagement_totals(day,event,country,source,total) VALUES(?,?,?,?,1) ON CONFLICT(day,event,country,source) DO UPDATE SET total=total+1').bind(koreaDay(), event, country, source).run();
    if(campaign!=='none'||['guide_view','recommendation_open'].includes(event)) await db().prepare('INSERT INTO campaign_totals(day,event,country,source,campaign,total) VALUES(?,?,?,?,?,1) ON CONFLICT(day,event,country,source,campaign) DO UPDATE SET total=total+1').bind(koreaDay(),event,country,source,campaign).run();
    return reply(204);
  } catch (error) { return reply(error instanceof SyntaxError ? 400 : 503); }
}
