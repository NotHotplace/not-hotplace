export function photoLicenseLabel(licenseUrl: string, language: 'ko' | 'en') {
  try {
    const url = new URL(licenseUrl);
    if (url.hostname === 'www.kogl.or.kr' && url.pathname === '/info/licenseType1.do') {
      return language === 'ko' ? '공공누리 제1유형' : 'KOGL Type 1';
    }
    if (url.hostname === 'creativecommons.org') {
      const license = url.pathname.match(/^\/licenses\/(by(?:-sa)?)\/(\d+\.\d+)(?:\/|$)/);
      if (license) return `CC ${license[1].toUpperCase()} ${license[2]}`;
      if (/^\/publicdomain\/zero\/1\.0(?:\/|$)/.test(url.pathname)) return 'CC0 1.0';
    }
  } catch {}
  return language === 'ko' ? '사진 이용 허락' : 'Photo license';
}
