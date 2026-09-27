import {DoorClosed, Sparkles, KeyRound} from 'lucide-react';
import {placeThemes, type PlaceTheme} from '@/lib/place-themes';

export default function ThemePicker({value, onChange, language}: {value: PlaceTheme; onChange: (theme: PlaceTheme) => void; language: 'ko' | 'en'}) {
  return <div className="space-themes" role="group" aria-label={language === 'ko' ? '휴식 공간 테마' : 'Space themes'}>
    {placeThemes.map(theme => <button type="button" key={theme.id} aria-pressed={value === theme.id} onClick={() => onChange(theme.id)}>
      {theme.id === 'private-room' ? <DoorClosed size={17}/> : theme.id === 'premium-spa' ? <Sparkles size={17}/> : theme.id === 'exclusive-hire' ? <KeyRound size={17}/> : null}
      {language === 'ko' ? theme.ko : theme.en}
    </button>)}
  </div>;
}
