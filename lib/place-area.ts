import englishAreas from './korean-area-labels.json';

// Display-only aliases for complete catalog area labels. Never translate pieces
// of an unknown area, a venue name, or its navigable address. See docs/area-labels.md.
export function placeArea(area:string,language:'ko'|'en'){
  return language==='en'&&Object.hasOwn(englishAreas,area)?(englishAreas as Record<string,string>)[area]:area;
}
