import {placeExperience} from '@/lib/place-experience';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, {params}: {params: Promise<{id: string}>}) {
  const headers = {'Cache-Control': 'private, no-store'};
  try {
    const data = await placeExperience((await params).id);
    return Response.json(data || {error: 'Place not found'}, {status: data ? 200 : 404, headers});
  } catch { return Response.json({error: 'Unable to load reviews'}, {status: 503, headers}); }
}
