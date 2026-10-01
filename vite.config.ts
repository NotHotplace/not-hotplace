import vinext from 'vinext';
import {defineConfig} from 'vite';
import {cloudflare,getLocalWorkerdCompatibilityDate} from '@cloudflare/vite-plugin';
export default defineConfig(({command})=>({
 server:{host:'0.0.0.0',allowedHosts:['terminal.local']},
 plugins:[vinext(),cloudflare({
  configPath:'wrangler.json',
  config:command==='serve'?{compatibility_date:getLocalWorkerdCompatibilityDate().date}:undefined,
  viteEnvironment:{name:'rsc',childEnvironments:['ssr']},inspectorPort:false,
 })],
}));
