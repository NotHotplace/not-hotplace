import Explorer from '../explorer';
import {getSiteUser} from '@/lib/site-auth';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getSiteUser();return <Explorer country="US" signedIn={!!user} signInPath="/login"/>;}
