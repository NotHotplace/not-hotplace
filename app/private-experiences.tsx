import {privacyLabel, privateBookingFacts, type PrivateExperience} from '@/lib/place-themes';

export default function PrivateExperiences({experiences, language}: {experiences?: PrivateExperience[]; language: 'ko' | 'en'}) {
  if (!experiences?.length) return null;
  const ko = language === 'ko';
  return <section className="private-experiences" data-original-language>
    <h2>{ko ? '내가 이용할 공간' : 'The space you can book'}</h2>
    <p>{ko ? '룸의 독립성과 실제 조용함은 별도로 확인합니다.' : 'Room privacy and actual quietness are assessed separately.'}</p>
    {experiences.map(experience => <article key={experience.kind + experience.nameEn}>
      <span className="private-kind">{privacyLabel(experience.kind, language)}</span>
      <h3>{ko ? experience.nameKo : experience.nameEn}</h3>
      <dl className="private-booking-facts">{privateBookingFacts(experience, language).map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
      <a href={experience.source} target="_blank" rel="noopener noreferrer">{ko ? '공식 이용 안내' : 'Official space information'} ↗</a>
      <small>{ko ? '자료 확인 ' : 'Source checked '}<time dateTime={experience.checked}>{experience.checked}</time></small>
    </article>)}
  </section>;
}
