const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function compile(file, imports) {
  const module = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText;
  new Function('require', 'module', 'exports', code)(imports, module, module.exports);
  return module.exports;
}
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const result = file.endsWith('.json') ? JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')) : compile(file, name =>
    name.startsWith('.') ? load(path.join(path.dirname(file), name) + (name.endsWith('.json') ? '' : '.ts')) : require(name));
  cache.set(file, result);
  return result;
}
function nodes(node, result = []) {
  if (Array.isArray(node)) node.forEach(child => nodes(child, result));
  else if (node && typeof node === 'object') { result.push(node); nodes(node.props?.children, result); }
  return result;
}
function text(node) {
  return Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : node == null || typeof node === 'boolean' ? '' : String(node);
}
const {catalog} = load('lib/catalog.ts');
const {emptyFilters} = load('lib/explore-filters.ts');
const {bookmarkKey} = load('lib/device-bookmarks.ts');
const row = place => ({...place, count: 4, positive: 4, quiet: 4, latest: Date.now(), resting: false});
const cafe = row(catalog.find(place => (place.country || 'KR') === 'KR' && place.category === 'cafe' && !place.experiences?.length));
const food = row(catalog.find(place => (place.country || 'KR') === 'KR' && place.category === 'food'));
const flush = () => new Promise(resolve => setImmediate(resolve));

// Exercise the actual Explorer/CountryDirectory component bodies and handlers,
// actual locale translation and actual filtering libraries. Only React lifecycle,
// child presentation components and browser/network boundaries are substituted.
function harness({language, country = 'KR', file = 'app/explorer.tsx', scope = 'device', saved = [cafe.id], places = [cafe, food], resume = {}, urlQuery}) {
  let tree, dirty = false, si = 0, ri = 0, ei = 0, ci = 0;
  const states = [], refs = [], effects = [], callbacks = [], pending = [], requests = [];
  const memory = new Map([[bookmarkKey, JSON.stringify(scope === 'device' ? saved : [food.id])], ['nhp-rest-journal-v1', 'unchanged visit history']]);
  const session = new Map([['nhp-browse-' + country, JSON.stringify({city: '전국', category: 'all', theme: 'all', term: '', view: 'saved', savedScope: scope, filters: {...emptyFilters}, limit: 24, ...resume})]]);
  const storage = map => ({getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value))});
  const events = new EventTarget();
  global.location = new URL(`https://nothotplace.com/${country.toLowerCase()}?${urlQuery||'lang='+language+'&resume=1'}`);
  global.window = {get location() {return global.location;}, addEventListener: (...args) => events.addEventListener(...args), removeEventListener: (...args) => events.removeEventListener(...args), dispatchEvent: event => events.dispatchEvent(event)};
  global.history = {state: null, replaceState(_state, _title, url) {global.location = new URL(url, global.location);}};
  global.document = {getElementById: () => null};
  global.localStorage = storage(memory); global.sessionStorage = storage(session);
  global.fetch = async (url, options) => {
    requests.push({url, options});
    assert.equal(url, '/api/data?country=' + country, 'recovery cannot write saves or send analytics');
    return {ok: true, json: async () => ({places, reviews: [], saved: scope === 'account' ? saved : [], suggestions: [], signedIn: scope === 'account', isOwner: false})};
  };
  const react = {
    useState(initial) {const i = si++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], value => {const next = typeof value === 'function' ? value(states[i]) : value; if (!Object.is(next, states[i])) {states[i] = next; dirty = true;}}];},
    useRef(initial) {const i = ri++; return refs[i] || (refs[i] = {current: initial});},
    useCallback(fn, deps) {const i = ci++, old = callbacks[i]; if (old && deps.every((value, n) => Object.is(value, old.deps[n]))) return old.fn; callbacks[i] = {fn, deps}; return fn;},
    useEffect(fn, deps) {const i = ei++, old = effects[i]; if (!old || deps.some((value, n) => !Object.is(value, old.deps[n]))) pending.push(() => {old?.cleanup?.(); effects[i] = {deps, cleanup: fn()};});},
  };
  const locale = compile('app/locale.tsx', name => name === 'react' ? {...require('react'), useContext: () => ({lang: language, setLang() {}})} : name.startsWith('@/') ? load(name.slice(2)) : require(name));
  const component = compile(file, name => name === 'react' ? react : name === 'react/jsx-runtime' ? require(name) : name === './locale' ? locale : name === 'sonner' ? {toast: Object.assign(() => {}, {success() {}, error() {}})} : name.startsWith('@/lib/') ? load(name.slice(2) + (name.endsWith('.json') ? '' : '.ts')) : new Proxy({}, {get: (_, key) => key === '__esModule' ? true : key === 'default' ? 'mock:' + name : 'mock:' + String(key)})).default;
  function render() {
    let rounds = 0;
    do {
      assert(++rounds < 50, 'component effects must settle');
      dirty = false; si = ri = ei = ci = 0;
      tree = component({signedIn: scope === 'account', signInPath: '/login', country});
      for(const node of nodes(tree))if(node.props?.className==='quiet-results-scroll'&&node.props.ref&&!node.props.ref.current)node.props.ref.current={scrollTop:0};
      while (pending.length) pending.shift()();
    } while (dirty);
    return tree;
  }
  return {
    render, async ready() {render(); await flush(); render();},
    nodes: () => nodes(tree), byClass: name => nodes(tree).filter(node => String(node.props?.className || '').split(' ').includes(name)),
    empty: () => nodes(tree).find(node => node.props?.className === 'quiet-empty'),
    search(value) {nodes(tree).find(node => node.type === 'input' && node.props.placeholder === locale.translate('장소·동네 검색', language)).props.onChange({target: {value}}); render();},
    category(value) {nodes(tree).find(node => node.type === 'mock:Tabs').props.onValueChange(value); render();},
    pop(query){global.location=new URL(global.location.pathname+'?'+query,global.location);events.dispatchEvent(new Event('popstate'));render();},
    session:()=>JSON.parse(session.get('nhp-browse-'+country)),
    scroll(value){const ref=nodes(tree).find(node=>node.props?.className==='quiet-results-scroll').props.ref;if(value!==undefined)ref.current.scrollTop=value;return ref.current.scrollTop;},
    bookmarks: () => memory.get(bookmarkKey), journal: () => memory.get('nhp-rest-journal-v1'), requests,
    unmount() {effects.forEach(effect => effect.cleanup?.());},
  };
}

(async () => {
  for (const language of ['ko', 'en']) {
    const copy = language === 'ko' ? {empty: '조건에 맞는 저장한 장소가 없어요', recovery: '검색·필터 해제', trulyEmpty: '저장한 장소가 없어요'} : {empty: 'No saved places match these filters.', recovery: 'Clear search and filters', trulyEmpty: 'No saved places yet'};
    for (const scope of ['device', 'account']) {
      for (const resume of [
        {category: 'food'},
        {term: 'DOES-NOT-MATCH-ANYTHING'},
        {theme: 'private-room'},
        {city: cafe.city === '서울' ? '부산' : '서울'},
        {filters: {...emptyFilters, reviewed: true}, category: 'food', term: 'DOES-NOT-MATCH-ANYTHING', theme: 'private-room', city: '부산', limit: 96},
      ]) {
        const h = harness({language, scope, resume}); await h.ready();
        const before = h.bookmarks();
        assert(h.empty(), 'saved filters produce an empty list');
        assert(text(h.empty()).includes(copy.empty), `${language}/${scope}: explain filtered saved results`);
        assert(!nodes(h.empty()).some(node => node.type === 'strong' && text(node) === copy.trulyEmpty));
        const recovery = nodes(h.empty()).filter(node => node.type === 'button');
        assert.equal(recovery.length, 1, 'provide one complete recovery inside saved mode');
        assert.equal(text(recovery[0]), copy.recovery);
        recovery[0].props.onClick(); h.render();
        assert.equal(h.empty(), undefined);
        assert.equal(h.byClass('quiet-place').length, 1, 'recovery shows only the selected scope’s saved place');
        assert(text(h.byClass('quiet-place')[0]).includes(cafe.name));
        assert.equal(h.byClass('quiet-saved-nav')[0].props['aria-pressed'], true);
        assert.equal(h.byClass('device-save-scope').length, 1);
        assert.equal(h.bookmarks(), before); assert.equal(h.journal(), 'unchanged visit history');
        assert.equal(global.location.searchParams.get('view'), 'saved');
        for (const key of ['region', 'category', 'theme', 'q', ...Object.keys(emptyFilters)]) assert.equal(global.location.searchParams.has(key), false, `${key} clears from the shareable browse state`);
        assert.equal(h.requests.length, 1, 'recovery does not refetch or mutate account saves');
        recovery[0].props.onClick(); h.render();
        assert.equal(h.byClass('quiet-place').length, 1, 'repeated recovery is safe');
        assert.equal(h.bookmarks(), before); h.unmount();
      }
      const h = harness({language, scope, saved: []}); await h.ready();
      assert(text(h.empty()).includes(copy.trulyEmpty), `${language}: genuinely empty saved scope keeps the onboarding message`);
      assert(!text(h.empty()).includes(copy.recovery)); h.unmount();
    }

    // A different URL beats a stale snapshot. Exact URL returns restore choices and inner scrolling.
    let navigation=harness({language,urlQuery:'lang='+language+'&category=cafe',resume:{category:'food',view:'explore',scroll:777}});await navigation.ready();
    assert.equal(navigation.byClass('quiet-place').length,1);assert(text(navigation.byClass('quiet-place')[0]).includes(cafe.name));assert.equal(navigation.scroll(),0,'fresh search does not reuse stale scroll');
    navigation.scroll(420);const detail=navigation.byClass('quiet-place-main')[0];detail.props.onClick({});
    const back=new URL(detail.props.href,'https://example.test').searchParams.get('returnTo');assert(back.includes('category=cafe'));assert(back.includes('resume=1'));const snapshot=navigation.session();navigation.unmount();
    for(const query of [new URL(back,'https://example.test').searchParams.toString(),'lang='+language+'&category=cafe']){
      navigation=harness({language,urlQuery:query,resume:snapshot});await navigation.ready();assert.equal(navigation.scroll(),420,'explicit return and native Back restore the matching list scroll');assert.equal(navigation.byClass('quiet-place').length,1);navigation.scroll(0);navigation.pop(query);assert.equal(navigation.scroll(),420,'same component popstate restores matching scroll');navigation.category('food');assert.equal(navigation.scroll(),0,'changing filters after Back consumes the old scroll snapshot');navigation.unmount();
    }

    const defaults=harness({language,urlQuery:'lang='+language+'&view=explore&resume=1',resume:{category:'food',view:'explore',urlKey:'newer-incompatible-state',scroll:777}});await defaults.ready();assert.equal(defaults.byClass('quiet-place').length,2,'explicit default context cannot use unrelated newer session filters');assert.equal(defaults.scroll(),0);defaults.unmount();

    // Recommendations are cross-category, but every winner must match the search.
    const candidates = [{...cafe, name: 'Search Match Café', tags: ['공통추천 commonmatch']}, {...food, name: 'Search Match Food', tags: ['공통추천 commonmatch']}];
    let h = harness({language, places: candidates, resume: {view: 'explore'}}); await h.ready();
    assert.equal(h.byClass('quiet-picks').length, 1);
    h.search('DOES-NOT-MATCH-ANYTHING');
    assert(h.empty()); assert.equal(h.byClass('quiet-picks').length, 0, 'unmatched searches cannot show unrelated recommendations');
    for (const term of ['카페', 'café']) {
      h.search(term);
      assert.equal(h.byClass('quiet-place').length, 1);
      const picks = h.byClass('quiet-picks')[0];
      assert(picks && text(picks).includes(candidates[0].name));
      assert(!text(picks).includes(candidates[1].name), 'recommendations use the same bilingual category search aliases as rows');
    }
    h.search('commonmatch'); h.category('cafe');
    assert.equal(h.byClass('quiet-place').length, 1, 'category still restricts result rows');
    assert(text(h.byClass('quiet-picks')[0]).includes(candidates[1].name), 'category picks intentionally remain cross-category');
    h.search(''); assert(text(h.byClass('quiet-picks')[0]).includes(candidates[1].name), 'clearing search restores the full recommendation pool'); h.unmount();

    for (const country of ['KR', 'JP', 'US', 'AU']) {
      const place = row(catalog.find(place => (place.country || 'KR') === country));
      const page = harness({language, country, places: [place], saved: [place.id]}); await page.ready();
      const workspace = page.byClass('quiet-workspace')[0]; assert(workspace);
      assert.equal(String(workspace.props.className).includes('world-workspace'), !['KR', 'US'].includes(country), 'Japan shares the non-overlay international workspace');
      assert.equal(String(workspace.props.className).includes('us-workspace'), country === 'US');
      assert.equal(workspace.props['data-priority'], country === 'KR' ? 'map' : undefined, 'Korean map priority remains isolated');
      page.unmount();
    }

    h = harness({language, file: 'app/country-directory.tsx'}); await h.ready();
    const links = h.nodes().filter(node => node.type === 'a');
    assert(links.length >= 2);
    const japan = links.find(node => node.props.href === '/jp?lang=' + language); assert(japan, 'country links retain localized navigation');
    for (const link of links) {
      assert.equal(link.props.onMouseEnter, undefined, 'pointer hover cannot change the selected country');
      assert.equal(link.props.onPointerEnter, undefined); assert.equal(link.props.onFocus, undefined);
      assert.equal(link.props.onClick, undefined, 'native country navigation is not intercepted');
    }
    assert.equal(h.requests.length, 0); h.unmount();
  }
  console.log('PASS: real Explorer handlers preserve device/account saves through filtered-empty recovery; localized search constrains cross-category picks; country links navigate without hover selection (Korean and English).');
})().catch(error => {console.error(error); process.exitCode = 1;});
