const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const {spawn} = require('node:child_process');
const {setTimeout: delay} = require('node:timers/promises');
const ts = require('typescript');
const root = path.resolve(__dirname, '..'), modules = new Map();

function load(file) {
  file = path.resolve(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!modules.has(file)) {
    const mod = {exports: {}};
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true},
    }).outputText;
    new Function('require', 'module', 'exports', code)(name => name.startsWith('.')
      ? load(path.resolve(path.dirname(file), name) + (name.endsWith('.json') ? '' : '.ts')) : require(name), mod, mod.exports);
    modules.set(file, mod.exports);
  }
  return modules.get(file);
}
const lib = name => load(path.join(root, 'lib', name + '.ts'));
const {SITE_URL} = lib('seo'), {catalog} = lib('catalog');
const {countryCodes, countryPath} = lib('countries');
const {regionalGuides} = lib('regional-guides');
const basicPlace = catalog.find(place => place.detailLevel === 'basic');
const gardenPlaces = ['world-fr-jardin-du-luxembourg', 'world-nl-hortus-botanicus-amsterdam', 'world-sg-jurong-lake-gardens'].map(id => catalog.find(place => place.id === id));
const agents = {
  browser: 'Mozilla/5.0 Chrome/134.0.0.0 Safari/537.36',
  googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  facebook: 'facebookexternalhit/1.1',
  empty: '',
};

// Inspect actual elements, not the duplicate strings inside RSC/JSON scripts.
function tags(html, name) {
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  return [...markup.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match =>
    Object.fromEntries([...match[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key.toLowerCase(), value.replace(/&amp;/g, '&')])));
}
function inspect(html, route, label, {language, noindex = false, title} = {}) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  assert(head, label + ': complete head');
  for (const element of ['html', 'head', 'body']) assert.equal(tags(html, element).length, 1, label + ': one ' + element + ' element');
  assert(html.indexOf('<head') < html.indexOf('</head>') && html.indexOf('</head>') < html.indexOf('<body'), label + ': valid document order');
  const links = tags(html, 'link'), headLinks = tags(head, 'link');
  const canonical = links.filter(link => link.rel === 'canonical');
  assert.equal(canonical.length, 1, label + ': exactly one canonical element');
  assert.equal(canonical[0].href, SITE_URL + (route === '/' ? '' : route), label + ': clean canonical URL');
  assert.deepEqual(headLinks.filter(link => link.rel === 'canonical'), canonical, label + ': canonical is in initial HEAD');
  const alternates = links.filter(link => link.rel === 'alternate' && link.hreflang);
  assert.deepEqual(headLinks.filter(link => link.rel === 'alternate' && link.hreflang), alternates, label + ': hreflang is in initial HEAD');
  if (language) {
    const prefix = route.slice(0, route.lastIndexOf('/'));
    assert.deepEqual(Object.fromEntries(alternates.map(link => [link.hreflang, link.href])), {
      en: SITE_URL + prefix + '/en', ko: SITE_URL + prefix + '/ko', 'x-default': SITE_URL + prefix + '/en',
    }, label + ': reciprocal language URLs');
    assert.equal(alternates.length, 3, label + ': no duplicate alternates');
    if (route.startsWith('/places/')) {
      assert(html.includes(`lang="${language}"`), label + ': place content language');
      assert(tags(html, 'a').some(link => link.href === `${prefix}/${language === 'ko' ? 'en' : 'ko'}`), label + ': language switch');
      assert(tags(html, 'a').some(link => link.href?.includes(`?lang=${language}&resume=1`)), label + ': localized return to map');
    }
  }
  const robots = tags(head, 'meta').find(meta => meta.name === 'robots')?.content || '';
  assert.equal(/\bnoindex\b/.test(robots), noindex, label + ': intended indexability');
  if (noindex) assert(/(?:^|,\s*)follow(?:,|$)/.test(robots), label + ': basic pages retain follow');
  assert(!links.some(link => link['data-vinext-streamed-icon']), label + ': no streamed icon markers');
  for (const rel of ['icon', 'shortcut icon', 'apple-touch-icon']) {
    assert.equal(links.filter(link => link.rel === rel).length, 1, label + ': single icon: ' + rel);
    assert(headLinks.some(link => link.rel === rel), label + ': icon stays in HEAD: ' + rel);
  }
  for (const link of [...links, ...tags(html, 'a')]) {
    assert(!/^\/[^?#]*:[a-z0-9]+:\d+(?:$|[?#])/.test(link.href || ''), label + ': no icon-marker URL used as a destination');
  }
  const escape = value => value.replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;'}[char]));
  if (title) assert(html.includes(`<h1>${escape(title)}</h1>`), label + ': correct place identity');
}

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

(async () => {
  let base = process.env.SEO_BASE_URL, server, temp, logs = '';
  try {
    if (!base) {
      assert(fs.existsSync(path.join(root, 'dist/server/wrangler.json')), 'Run the production build before test:seo');
      temp = fs.mkdtempSync(path.join(os.tmpdir(), 'not-hotplace-seo-'));
      const port = await freePort();
      base = `http://127.0.0.1:${port}`;
      // Run the built Worker, with the installed runtime's supported date only
      // for local QA. Never change production's date, bindings or remote data.
      const {getLocalWorkerdCompatibilityDate} = await import('@cloudflare/vite-plugin');
      const date = getLocalWorkerdCompatibilityDate().date;
      server = spawn(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'),
        'dev', '--local', '--config', 'dist/server/wrangler.json', '--compatibility-date', date,
        '--ip', '127.0.0.1', '--port', String(port), '--inspector-port', '0', '--log-level', 'warn',
        '--persist-to', path.join(temp, 'state')], {
        cwd: root, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'],
        env: {...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', XDG_CONFIG_HOME: path.join(temp, 'config'), WRANGLER_LOG_PATH: path.join(temp, 'wrangler.log')},
      });
      server.stdout.on('data', chunk => {logs += chunk;});
      server.stderr.on('data', chunk => {logs += chunk;});
      let ready = false;
      for (let attempt = 0; attempt < 120; attempt++) {
        if (server.exitCode !== null) throw Error('Built worker failed to start:\n' + logs);
        try { ready = (await fetch(base + '/robots.txt', {signal: AbortSignal.timeout(1000)})).ok; } catch {}
        if (ready) break;
        await delay(500);
      }
      assert(ready, 'Built worker startup timed out:\n' + logs);
      console.log('Testing the production bundle locally with workerd date ' + date);
    }
    let count = 0;
    async function get(route, agent = agents.browser) {
      const response = await fetch(new URL(route, base), {headers: {'user-agent': agent}, redirect: 'manual', signal: AbortSignal.timeout(30000)});
      return {status: response.status, html: await response.text()};
    }
    async function page(route, agent, options) {
      const result = await get(route, agents[agent]), label = agent + ' ' + route;
      assert.equal(result.status, 200, label + ': HTTP 200');
      inspect(result.html, new URL(route, base).pathname, label, options);
      count++;
    }
    for (const code of countryCodes) await page(countryPath(code), 'browser');
    for (const route of ['/', '/regions', '/trips', '/install', '/plus', '/guides', '/contributors']) await page(route, 'browser');
    // Empty visitDetails arrays previously crashed four regional guides. Cover
    // every region in both languages against the real merged catalog.
    for (const guide of regionalGuides) for (const language of ['ko', 'en']) {
      await page(`/regions/${guide.slug}/${language}`, 'browser', {language});
    }
    for (const agent of Object.keys(agents)) {
      for (const route of ['/mx', '/kr?lang=ko&region=서울', '/us?lang=en&category=cafe', '/jp?lang=ko', '/regions?lang=en']) await page(route, agent);
      for (const language of ['ko', 'en']) {
        for (const [id, title] of [['cj-daechung', '더 대청호'], ['seoul-suyeon', '수연산방'], [basicPlace.id, basicPlace.name], ...gardenPlaces.map(place => [place.id, place.name])]) {
          await page(`/places/${id}/${language}`, agent, {language, title, noindex: id === basicPlace.id});
        }
        await page(`/guides/korea-reading-cafes/${language}`, agent, {language});
        await page(`/regions/seoul/${language}`, agent, {language});
      }
      for (const route of ['/places/not-a-real-place/ko', '/places/cj-daechung/fr', '/not-a-country', '/guides/not-a-guide/ko', '/guides/korea-reading-cafes/fr', '/regions/not-a-region/ko', '/regions/seoul/fr']) {
        const result = await get(route, agents[agent]);
        assert.equal(result.status, 404, agent + ' ' + route + ': HTTP 404 remains');
        assert(tags(result.html, 'meta').some(meta => meta.name === 'robots' && /\bnoindex\b/.test(meta.content)), route + ': 404 is noindex');
      }
    }
    const robots = await get('/robots.txt');
    assert.equal(robots.status, 200);
    assert(robots.html.includes('Disallow: /login\n'), 'login remains excluded in robots.txt');
    assert(robots.html.includes('Sitemap: ' + SITE_URL + '/sitemap.xml'));
    for (const place of gardenPlaces) {
      const image = await fetch(new URL(place.image, base), {signal: AbortSignal.timeout(30000)});
      assert.equal(image.status, 200, place.id + ': deployed photo loads');
      assert(image.headers.get('content-type')?.includes('image/webp'), place.id + ': image MIME type');
      const bytes = Buffer.from(await image.arrayBuffer());
      const rights = await get(place.image.replace(/\.webp$/, '.license.json'));
      assert.equal(rights.status, 200, place.id + ': public rights metadata loads');
      const license = JSON.parse(rights.html);
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), license.readySha256, place.id + ': exact verified photo bytes');
      assert.equal(bytes.length, license.readyBytes, place.id + ': exact optimized photo size');
      assert.equal(license.asset, place.image, place.id + ': rights match image');
    }
    const sitemap = await get('/sitemap.xml');
    assert.equal(sitemap.status, 200);
    const urls = [...sitemap.html.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => match[1]);
    const locations = urls.map(url => url.match(/<loc>(.*?)<\/loc>/)?.[1]);
    assert.equal(new Set(locations).size, locations.length, 'unique sitemap locations');
    assert(!locations.some(url => /\/(login|stats|journal)(?:[/?]|$)/.test(url)), 'private/login pages stay out of sitemap');
    for (const code of countryCodes) assert(locations.includes(SITE_URL + countryPath(code)));
    assert(locations.includes(SITE_URL + '/regions'));
    for (const place of catalog) for (const language of ['en', 'ko']) {
      const location = `${SITE_URL}/places/${place.id}/${language}`;
      assert.equal(locations.includes(location), place.detailLevel !== 'basic', location + ': sitemap matches indexability');
    }
    for (const url of urls.filter(url => /<loc>[^<]+\/(places|guides|regions)\/[^<]+\/(en|ko)<\/loc>/.test(url))) {
      const location = url.match(/<loc>(.*?)<\/loc>/)[1], prefix = location.slice(0, location.lastIndexOf('/'));
      for (const language of ['en', 'ko']) assert(url.includes(`hreflang="${language}" href="${prefix}/${language}"`), location + ': sitemap reciprocal ' + language);
    }
    console.log(`PASS: ${count} real HTML responses across 30 countries and browser/Googlebot/Bingbot/Facebook/empty-UA; HEAD canonicals, KO/EN alternates, icons, clean queries, place identity/return links, basic noindex, 404s, login exclusion and ${locations.length} sitemap URLs (${base}).`);
  } catch (error) {
    if (server) console.error(logs);
    throw error;
  } finally {
    if (server) {
      const signal = value => {try {process.platform === 'win32' ? server.kill(value) : process.kill(-server.pid, value);} catch {}};
      signal('SIGTERM');
      await Promise.race([new Promise(resolve => server.once('exit', resolve)), delay(3000)]);
      signal('SIGKILL');
    }
    if (temp) fs.rmSync(temp, {recursive: true, force: true});
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
