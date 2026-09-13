import Explorer from './explorer';
import {getSiteUser} from '@/lib/site-auth';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getSiteUser();return <Explorer signedIn={!!user} signInPath="/login" />;}
