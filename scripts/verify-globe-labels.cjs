const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const module = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  }).outputText;
  new Function('require', 'module', 'exports', code)(name => name.startsWith('.') ? load(path.join(path.dirname(file), name) + '.ts') : require(name), module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
// Execute the same vendored D3 bundle loaded by the browser, not a projection mock.
const vendor = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'public/vendor/d3.min.js'), 'utf8'), vendor);
const geo = vendor.d3;
const {countries, countryCodes} = load('lib/countries.ts');
const {layoutGlobeLabels, projectVisibleGlobePoints, isFrontFacing, globeRectsOverlap, estimateGlobeTextWidth} = load('lib/globe-labels.ts');
const widths = [280, 320, 375, 480, 600, 960];
const rotations = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
const languages = ['ko', 'en'];
const input = (language, selected) => countryCodes.map(code => ({code, center: countries[code].center, name: countries[code][language === 'ko' ? 'nameKo' : 'nameEn'], selected: code === selected}));
const projection = (rotation, latitude = -22) => geo.geoOrthographic().scale(246).translate([300, 300]).rotate([rotation, latitude]);
let scenarios = 0;
function verifyLayout(points, width, layout, description) {
  const byCode = new Map(points.map(point => [point.code, point]));
  assert.equal(new Set(layout.map(label => label.code)).size, layout.length, `${description}: duplicate code`);
  for (const label of layout) {
    const source = byCode.get(label.code);
    assert(source, `${description}: only visible input countries may render`);
    assert.equal(label.x, source.x); assert.equal(label.y, source.y);
    assert(label.lines.length >= 1 && label.lines.length <= 2, `${description}: at most two text lines`);
    assert.equal(label.lines.join('').replace(/\s/g, ''), label.name.replace(/\s/g, ''), `${description}: no truncation`);
    assert(Math.abs(label.fontSize * width / 600 - 14) < 1e-7, `${description}: stable readable CSS font size`);
    assert(label.pinHitRect.width * width / 600 >= 44 - 1e-7, `${description}: 44px pin hit width`);
    assert(label.pinHitRect.height * width / 600 >= 44 - 1e-7, `${description}: 44px pin hit height`);
    assert(!globeRectsOverlap(label.labelRect, label.pinHitRect), `${description}: own pin and label targets cannot overlap`);
    for (const rect of label.hitRects) {
      assert(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= 600 && rect.y + rect.height <= 600, `${description}: target stays inside viewBox`);
    }
    for (const line of label.lines) assert(estimateGlobeTextWidth(line, label.fontSize) + 19 * 600 / width <= label.labelRect.width, `${description}: text has horizontal padding`);
    const lastBaseline = label.textStartY + (label.lines.length - 1) * label.lineHeight;
    assert(label.textStartY - label.fontSize >= label.labelRect.y, `${description}: first line fits`);
    assert(lastBaseline + label.fontSize * .25 <= label.labelRect.y + label.labelRect.height, `${description}: descenders fit`);
    assert(label.leader.x2 >= label.labelRect.x && label.leader.x2 <= label.labelRect.x + label.labelRect.width, `${description}: leader ends on label`);
    assert(label.leader.y2 >= label.labelRect.y && label.leader.y2 <= label.labelRect.y + label.labelRect.height, `${description}: leader ends on label`);
  }
  for (let i = 0; i < layout.length; i++) for (let j = i + 1; j < layout.length; j++) {
    for (const a of layout[i].hitRects) for (const b of layout[j].hitRects) assert(!globeRectsOverlap(a, b), `${description}: ${layout[i].code}/${layout[j].code} targets cannot overlap`);
  }
  const selected = points.find(point => point.selected);
  if (selected) assert.equal(layout[0]?.code, selected.code, `${description}: selected visible country wins`);
  assert.deepEqual(layoutGlobeLabels(points, width), layout, `${description}: identical input stays deterministic`);
  assert.deepEqual(layoutGlobeLabels([...points].reverse(), width), layout, `${description}: input order cannot change priority`);
  scenarios++;
}

for (const language of languages) for (const rotation of rotations) for (const latitude of [-55, -22, 20]) {
  const map = projection(rotation, latitude), viewCenter = map.invert([300, 300]);
  const points = projectVisibleGlobePoints(input(language, 'KR'), map);
  const expected = countryCodes.filter(code => geo.geoDistance(countries[code].center, viewCenter) < Math.PI / 2 - 1e-6);
  assert.deepEqual(points.map(point => point.code), expected, 'front side must agree with real D3 spherical distance');
  for (const width of widths) verifyLayout(points, width, layoutGlobeLabels(points, width), `${language}/${rotation}/${latitude}/${width}`);
  // Any front-facing country can be selected, including one almost on the limb.
  // Check the actual clustered view as well as the centered/isolated cases below.
  for (const selected of points) for (const width of [320, 600]) {
    const selectedPoints = points.map(point => ({...point, selected: point.code === selected.code}));
    verifyLayout(selectedPoints, width, layoutGlobeLabels(selectedPoints, width), `${language}/${rotation}/${latitude}/${selected.code}/${width}`);
  }
}

// Center every registered country. It must remain usable in both languages,
// including long Korean labels and United Arab Emirates on small screens.
for (const language of languages) for (const code of countryCodes) for (const width of widths) {
  const map = projection(-countries[code].center[0], -countries[code].center[1]);
  const points = projectVisibleGlobePoints(input(language, code), map);
  const layout = layoutGlobeLabels(points, width);
  verifyLayout(points, width, layout, `${language}/${code}/${width}`);
  assert.equal(layout[0].code, code);
  const alternative = points.find(point => point.code !== code);
  if (alternative) {
    const focused = layoutGlobeLabels(points, width, {preferredCode: alternative.code});
    assert.equal(focused[0]?.code, alternative.code, 'focused country survives resize even in a dense cluster');
  }
}

const cluster = countryCodes.slice(0, 4).map((code, index) => ({code, name: countries[code].nameEn, x: 300 + index, y: 300 + index, selected: index === 3}));
assert.deepEqual(layoutGlobeLabels(cluster, 320).map(label => label.code), [cluster[3].code], 'overlapping pin targets collapse to the selected country');
for (const code of countryCodes) for (const language of languages) {
  // Selected markers near all four limbs must still have a full on-canvas label.
  for (const [x, y] of [[54, 300], [546, 300], [300, 54], [300, 546]]) {
    const point = {code, name: countries[code][language === 'ko' ? 'nameKo' : 'nameEn'], x, y, selected: true};
    verifyLayout([point], 280, layoutGlobeLabels([point], 280), `limb/${language}/${code}/${x}/${y}`);
  }
}
const widePoints = projectVisibleGlobePoints(input('en', 'KR'), projection(-110));
assert(layoutGlobeLabels(widePoints, 320).length < layoutGlobeLabels(widePoints, 960).length, 'narrow globe deliberately admits fewer labels');
assert(isFrontFacing([0, 0], [0, 0]));
assert(!isFrontFacing([180, 0], [0, 0]));
assert(!isFrontFacing([90, 0], [0, 0]), 'exact horizon is not a front-facing label');
assert(!isFrontFacing([NaN, 0], [0, 0]));
assert.deepEqual(projectVisibleGlobePoints(input('en'), Object.assign(() => null, {invert: () => null})), []);
assert.deepEqual(layoutGlobeLabels([], 0), []);
assert.equal(layoutGlobeLabels([{...cluster[0], x: NaN}], 600).length, 0);
console.log(`PASS: ${scenarios} real-projection/limb layouts cover all ${countryCodes.length} countries, both locales, six widths, rotation and tilt; no back-side labels, clipped names, colliding hit targets, or dropped visible selection.`);
