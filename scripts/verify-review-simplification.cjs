/* Offline component/JSX regression coverage. No browser or live service is used. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const fields = ['day', 'time', 'noise', 'crowd', 'comfort', 'satisfaction'];
const jsx = {jsx: (type, props, key) => ({type, props, key}), jsxs: (type, props, key) => ({type, props, key}), Fragment: 'fragment'};
const flush = () => new Promise(resolve => setImmediate(resolve));
function compile(source, imports) {
  const module = {exports: {}};
  const code = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText;
  new Function('require', 'module', 'exports', code)(imports, module, module.exports);
  return module.exports;
}
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
function nodes(node, result = []) {
  if (Array.isArray(node)) node.forEach(child => nodes(child, result));
  else if (node && typeof node === 'object') {result.push(node); nodes(node.props?.children, result);}
  return result;
}
function text(node) {
  return Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : '';
}
function harness(file, language, children) {
  let tree, dirty, si, ri, ei, ci, id = 'preview-place-a', detailDOM;
  const events = new EventTarget();
  const states = [], refs = [], effects = [], callbacks = [], pending = [], requests = [], violations = [], journal = [];
  const react = {
    useState(initial) {const i = si++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], value => {const next = typeof value === 'function' ? value(states[i]) : value; if (!Object.is(next, states[i])) {states[i] = next; dirty = true;}}];},
    useRef(initial) {const i = ri++; return refs[i] || (refs[i] = {current: initial});},
    useCallback(fn, deps) {const i = ci++, old = callbacks[i]; if (old && deps.every((v, n) => Object.is(v, old.deps[n]))) return old.fn; callbacks[i] = {fn, deps}; return fn;},
    useEffect(fn, deps) {const i = ei++, old = effects[i]; if (!old || deps.some((v, n) => !Object.is(v, old.deps[n]))) pending.push(() => {old?.cleanup?.(); effects[i] = {deps, cleanup: fn()};});},
  };
  global.window = {location: {hash: ''}, addEventListener: (...args) => events.addEventListener(...args), removeEventListener: (...args) => events.removeEventListener(...args)};
  global.fetch = (url, init = {}) => {
    const method = init.method || 'GET';
    const allowed = (method === 'GET' && (url === '/api/quick-feedback?place=' + id || url === '/api/places/' + id)) || (['POST', 'DELETE'].includes(method) && url === '/api/quick-feedback');
    if (!allowed) {violations.push({url, method}); throw Error('Unexpected offline-test request: ' + method + ' ' + url);}
    return new Promise(resolve => requests.push({url, init, resolve}));
  };
  const component = compile(source(file), name => name === 'react' ? react : name === 'react/jsx-runtime' ? jsx : name === '@/lib/engagement-client' ? {trackEngagement() {}} : name === '@/lib/rest-journal' ? {readJournal: () => [], recordPause: value => {journal.push(value); return true;}, removePause: value => journal.push({removed: value}), journalEvent: 'journal'} : name === '@/lib/place-links' ? {isCatalogPlace: () => true} : name === '@/lib/place-presentation' ? {reviewValue: () => '', reviewTags: () => []} : name === '@/lib/rest-finder' ? {visitingTimeLabel: () => ''} : new Proxy({}, {get: (_, key) => key === '__esModule' ? true : key === 'default' ? 'mock:' + name : 'mock:' + String(key)})).default;
  function render(nextId = id) {
    id = nextId; let rounds = 0;
    do {assert(++rounds < 30, 'effects settle'); dirty = false; si = ri = ei = ci = 0; tree = component({id, country: 'KR', language, children, name: 'Preview place', category: 'cafe', path: '/places/' + id + '/' + language, mapUrl: 'https://example.test/map'});
      const fold = nodes(tree).find(node => node.type === 'details' && node.props.className === 'quick-more');
      if (fold?.props.ref) {if (!detailDOM || detailDOM.key !== fold.key) detailDOM = {key: fold.key, open: false, scrollCount: 0, scrollIntoView() {this.scrollCount++;}}; fold.props.ref.current = detailDOM;}
      else {detailDOM = undefined; if (refs[0] && file === 'app/quick-feedback.tsx') refs[0].current = null;}
      while (pending.length) pending.shift()();} while (dirty);
    return tree;
  }
  return {render, requests, journal, dom: () => detailDOM, setChildren(value) {children = value; render();}, hash(value, event) {global.window.location.hash = value; if (event) events.dispatchEvent(new Event(event));}, nodes: () => nodes(tree), text: () => text(tree), async reply(index, body, ok = true) {assert(requests[index], 'expected fake request exists'); requests[index].resolve({ok, status: ok ? 200 : 500, json: async () => body}); await flush(); render();}, unmount() {effects.forEach(effect => effect.cleanup?.()); assert.deepEqual(violations, [], 'deny unexpected network requests');}};
}
const empty = {summary: {count: 0, quiet: 0, moderate: 0, loud: 0}, mine: null};
const saved = noise => ({summary: {count: 1, quiet: noise === '조용함' ? 1 : 0, moderate: noise === '보통' ? 1 : 0, loud: noise === '시끄러움' ? 1 : 0}, mine: {noise}});
const byClass = (h, cls) => h.nodes().find(node => node.props?.className === cls);
const button = (h, label) => h.nodes().find(node => node.type === 'button' && text(node) === label);
function assertFold(h, id, child) {
  const fold = byClass(h, 'quick-more'); assert(fold, 'optional disclosure exists');
  assert(!fold.props.open, 'optional disclosure defaults closed');
  assert.equal(fold.key, id, 'place change remounts native disclosure and clears its open state');
  assert.equal(fold.props.id, 'review-more-' + id);
  if (child) {assert(nodes(fold).includes(child), 'existing detailed content is inside optional disclosure'); assert.equal(h.nodes().filter(n => n === child).length, 1);}
  const choices = byClass(h, 'quick-choices'); assert(!nodes(fold).includes(choices), 'one-tap choices remain outside closed disclosure');
  return fold;
}
// Extract the real Explorer entry JSX, not a rewritten approximation. Its many
// unrelated map/filter children need not execute to test this form boundary.
function explorerEntry(language, signedIn, answers = {}) {
  const file = ts.createSourceFile('explorer.tsx', source('app/explorer.tsx'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const matches = []; function visit(node) {if (ts.isJsxElement(node) && node.openingElement.tagName.getText(file) === 'QuickFeedback') matches.push(node); ts.forEachChild(node, visit);} visit(file);
  assert.equal(matches.length, 1, 'Explorer has one quick-review entry');
  let loginExpression; function findLogin(node) {if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'focusedLoginHref') loginExpression = node.initializer.getText(file); ts.forEachChild(node, findLogin);} findLogin(file);
  assert(loginExpression, 'Explorer focused login URL exists');
  const login = compile(`export default function login({focused, signInPath, lang, explorerPath, loginHref}: any) {return (${loginExpression});}`, () => {throw Error('Unexpected import');}).default({focused: {id: 'preview-place-a'}, signInPath: '/login', lang: language, explorerPath: (place, lang) => '/kr?lang=' + lang + '&place=' + place.id, loginHref: '/login'});
  const next = new URL(login, 'https://example.test').searchParams.get('next');
  assert.equal(next, '/kr?lang=' + language + '&place=preview-place-a#review-more-preview-place-a', 'Explorer login returns to exact place and optional disclosure');
  const errors = [], mutations = [], selected = [];
  const context = {QuickFeedback: 'QuickFeedback', Question: 'Question', Checkbox: 'Checkbox', Check: 'Check', focused: {id: 'preview-place-a', category: 'cafe'}, country: 'KR', lang: language, data: {signedIn, reviews: [{place_id: 'preview-place-a'}]}, focusedLoginHref: login, text: (en, ko) => language === 'ko' ? ko : en, trackEngagement() {}, reviewStarted: {current: false}, r: Object.assign(Object.fromEntries(fields.map(key => [key, ''])), {tags: []}, answers), setR() {}, setFormError: value => errors.push(value), mutate: async (...args) => {mutations.push(args); return true;}, setSelected: value => selected.push(value), reviewTags: () => [], formError: '', busy: false, error: ''};
  const body = `export default function render({${Object.keys(context).join(',')}}: any) {return (${matches[0].getText(file)});}`;
  const tree = compile(body, name => {assert.equal(name, 'react/jsx-runtime'); return jsx;}).default(context);
  return {tree, errors, mutations, selected};
}
(async () => {
  const originalFetch = global.fetch, originalWindow = global.window;
  try {
    for (const language of ['ko', 'en']) {
      const ko = language === 'ko';
      const delayed = harness('app/quick-feedback.tsx', language);
      delayed.hash('#review-more-preview-place-a'); delayed.render(); assert.equal(delayed.dom(), undefined);
      delayed.setChildren('Detailed sign-in loaded later'); assert.equal(delayed.dom().open, true, 'matching hash opens disclosure when children mount later');
      delayed.dom().open = false; const scrollCount = delayed.dom().scrollCount; delayed.render();
      assert.equal(delayed.dom().open, false, 'unchanged render respects manual collapse'); assert.equal(delayed.dom().scrollCount, scrollCount);
      delayed.hash('#review-more-preview-place-a', 'hashchange'); assert.equal(delayed.dom().open, true, 'hash navigation reopens target');
      delayed.dom().open = false; delayed.hash('#review-more-preview-place-a', 'popstate'); assert.equal(delayed.dom().open, true, 'Back/Forward reveals matching target');
      delayed.render('preview-place-b'); assert.equal(delayed.dom().open, false, 'wrong-place hash never opens new place'); delayed.unmount();
      const savedLater = harness('app/quick-feedback.tsx', language); savedLater.hash('#review-more-preview-place-a'); savedLater.render();
      await savedLater.reply(0, saved('조용함')); assert.equal(savedLater.dom().open, true, 'saved response can mount disclosure after hash effect first ran'); savedLater.unmount();
      for (const [index, noise] of ['조용함', '보통', '시끄러움'].entries()) {
        const child = {type: 'a', props: {href: '/login', children: 'Existing detailed sign-in'}};
        const h = harness('app/quick-feedback.tsx', language, child); h.render(); await h.reply(0, empty);
        assertFold(h, 'preview-place-a', child);
        assert(h.text().includes(ko ? '더 남기기 · 선택' : 'Add more · optional'));
        assert(h.text().includes(ko ? '로그인·글쓰기 없이' : 'No sign-in or writing required.'));
        const choices = nodes(byClass(h, 'quick-choices')).filter(node => node.type === 'button'); assert.equal(choices.length, 3);
        assert(text(choices[index]).includes((ko ? ['조용했어요', '보통이에요', '시끄러웠어요'] : ['Quiet', 'Moderate', 'Loud'])[index]));
        assert.equal(h.nodes().filter(node => node.type === 'select').length, 0, 'no day/time demanded before one-tap save');
        choices[index].props.onClick(); h.render();
        assert.deepEqual(JSON.parse(h.requests[1].init.body), {placeId: 'preview-place-a', noise}, 'one tap posts only explicit noise, without fabricated defaults');
        assert.equal(h.requests[1].init.method, 'POST'); assert.equal(h.requests.length, 2);
        assert(nodes(byClass(h, 'quick-choices')).filter(node => node.type === 'button').every(node => node.props.disabled), 'disable choices during save');
        await h.reply(1); await h.reply(2, saved(noise));
        const fold = assertFold(h, 'preview-place-a', child);
        const selects = h.nodes().filter(node => node.type === 'select'); assert.equal(selects.length, 2);
        for (const select of selects) {assert(nodes(fold).includes(select)); assert.equal(select.props.value, ''); assert(!select.props.required); assert.equal(nodes(select).find(node => node.type === 'option').props.value, '');}
        assert(h.text().includes(ko ? '간단 후기가 반영됐어요.' : 'Your quick response was saved.'));
        assert.equal(nodes(byClass(h, 'quick-choices')).filter(node => node.type === 'button')[index].props['aria-pressed'], true);
        if (index === 0) {
          selects[0].props.onChange({target: {value: '평일'}}); selects[1].props.onChange({target: {value: '오후'}}); h.render();
          button(h, ko ? '선택 내용 저장' : 'Save these details').props.onClick();
          assert.deepEqual(JSON.parse(h.requests[3].init.body), {placeId: 'preview-place-a', noise, day: '평일', time: '오후'});
          await h.reply(3); await h.reply(4, saved(noise));
          h.render('preview-place-b'); assertFold(h, 'preview-place-b', child);
          assert.equal(h.nodes().filter(node => node.type === 'select').length, 0, 'new place clears optional saved fields');
          await h.reply(5, empty);
        }
        h.unmount();
      }
      const retry = harness('app/quick-feedback.tsx', language, 'Detailed content'); retry.render(); await retry.reply(0, empty);
      nodes(byClass(retry, 'quick-choices')).find(node => node.type === 'button').props.onClick(); await retry.reply(1, {}, false);
      assert(retry.text().includes(ko ? '다시 눌러주세요.' : 'Please try again.')); assert.equal(retry.journal.length, 0);
      nodes(byClass(retry, 'quick-choices')).find(node => node.type === 'button').props.onClick(); await retry.reply(2); await retry.reply(3, saved('조용함'));
      button(retry, ko ? '내 간단 후기 삭제' : 'Delete my quick response').props.onClick(); assert.equal(retry.requests[4].init.method, 'DELETE'); assert.deepEqual(JSON.parse(retry.requests[4].init.body), {placeId: 'preview-place-a'});
      await retry.reply(4, {}, false); assert(retry.text().includes(ko ? '다시 시도해 주세요.' : 'Try again.'));
      button(retry, ko ? '내 간단 후기 삭제' : 'Delete my quick response').props.onClick(); await retry.reply(5); await retry.reply(6, empty); assert.equal(retry.nodes().filter(node => node.type === 'select').length, 0); retry.unmount();

      const detail = harness('app/places/place-interactions.tsx', language); detail.render();
      const experience = {signedIn: false, saved: false, summary: {count: 0}, restFeedback: {}, insights: [], review: null};
      await detail.reply(0, experience);
      const quick = detail.nodes().find(node => node.type === 'mock:../quick-feedback'); assert(quick, 'place detail quick entry exists');
      const readFold = detail.nodes().find(node => node.type === 'details' && node.props['data-anchor-disclosure'] !== undefined); assert(readFold); assert(!nodes(readFold).includes(quick), 'quick entry is outside detailed report disclosure');
      assert(text(quick).includes(ko ? '로그인하고 자세히 남기기' : 'Sign in for a detailed review'));
      const login = nodes(quick).find(node => node.type === 'a'); assert(new URL(login.props.href, 'https://example.test').searchParams.get('next').endsWith('#review-more-preview-place-a'));
      const radios = detail.nodes().filter(node => node.type === 'input' && node.props.type === 'radio'); assert.deepEqual([...new Set(radios.map(node => node.props.name))], fields); assert(radios.every(node => node.props.required && !node.props.checked), 'all six detailed answers remain required and initially blank'); detail.unmount();

      const anonymous = explorerEntry(language, false); assert(text(anonymous.tree).includes(ko ? '로그인하고 자세히 남기기' : 'Sign in for a detailed review')); assert(nodes(anonymous.tree).some(node => node.type === 'a')); assert(!nodes(anonymous.tree).some(node => node.type === 'form'));
      const signed = explorerEntry(language, true); const form = nodes(signed.tree).find(node => node.type === 'form'); assert(form, 'signed-in Explorer form stays a QuickFeedback child');
      assert.deepEqual(nodes(form).filter(node => node.type === 'Question').map(node => node.props.name), fields);
      await form.props.onSubmit({preventDefault() {}}); assert.equal(signed.mutations.length, 0); assert.equal(signed.errors.length, 1, 'missing detailed fields still block submission');
      const answers = {day: '평일', time: '오전', noise: '조용함', crowd: '보통', comfort: '편함', satisfaction: '만족'};
      for (const missing of fields) {const partial = explorerEntry(language, true, {...answers, [missing]: ''}); await nodes(partial.tree).find(node => node.type === 'form').props.onSubmit({preventDefault() {}}); assert.equal(partial.mutations.length, 0, missing + ' remains mandatory'); assert.equal(partial.errors.length, 1);}
      const complete = explorerEntry(language, true, answers);
      await nodes(complete.tree).find(node => node.type === 'form').props.onSubmit({preventDefault() {}}); assert.equal(complete.mutations[0][0], 'review'); assert.equal(complete.mutations[0][1].satisfied, 1);
      const remove = nodes(complete.tree).find(node => node.type === 'button' && text(node) === '내 후기 삭제'); assert(remove); await remove.props.onClick(); assert.equal(complete.mutations[1][0], 'deleteReview', 'existing detailed delete action retained');
      // Compose each actual entry's children through the actual QuickFeedback body.
      for (const entry of [quick, anonymous.tree, signed.tree]) {const composed = harness('app/quick-feedback.tsx', language, entry.props.children); composed.render(); assertFold(composed, 'preview-place-a'); const fold = byClass(composed, 'quick-more'); assert.equal(text(byClass(composed, 'quick-detailed')).endsWith(text(entry.props.children)), true); assert(nodes(fold).includes(byClass(composed, 'quick-detailed'))); composed.unmount();}
    }
    console.log('PASS: offline KO/EN one-tap payloads, default-closed optional detail composition, blank optional day/time, retry/delete, place-change key, both entry points, six required detailed answers, and delayed hash/login-return navigation. Existing verify-ui-regressions.cjs remains unchanged.');
  } finally {global.fetch = originalFetch; global.window = originalWindow;}
})().catch(error => {console.error(error); process.exitCode = 1;});
