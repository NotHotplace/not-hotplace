type Props = {
  canonical: string;
  languages?: Record<string, string>;
  noindex?: boolean;
};

// React hoists native metadata into the document head. The raw-HTML regression
// verifies initial HEAD placement for these routes, including their async work.
export default function SeoLinks({canonical, languages, noindex = false}: Props) {
  return <>
    <link rel="canonical" href={canonical}/>
    {Object.entries(languages || {}).map(([language, href]) =>
      <link key={language} rel="alternate" hrefLang={language} href={href}/>)}
    {noindex && <meta name="robots" content="noindex, follow"/>}
  </>;
}
