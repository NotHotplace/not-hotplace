import {z} from 'zod';
export function publicHttps(value:string){
 if(!value)return true;
 try{
  const u=new URL(value),host=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||u.username||u.password||host==='localhost'||host.endsWith('.local')||host.endsWith('.localhost')||!host.includes('.')||host.includes(':'))return false;
  if(/^\d+\.\d+\.\d+\.\d+$/.test(host)){
   const [a,b]=host.split('.').map(Number);if(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19))return false;
  }
  return true;
 }catch{return false;}
}
const link=z.string().trim().max(600).refine(publicHttps,'Public HTTPS link required');
export const contributionSchema=z.object({placeId:z.string().min(1).max(100),note:z.string().trim().min(3).max(600),sourceUrl:link.default(''),photoUrl:link.default(''),rightsConsent:z.boolean().default(false)}).strict().refine(p=>!p.photoUrl||p.rightsConsent,'Photo rights consent required');
