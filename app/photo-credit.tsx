import type {Place} from '@/lib/catalog';
import {photoLicenseLabel} from '@/lib/photo-license';

type CreditPlace = Pick<Place,'image'|'imageCredit'|'imageLicense'|'imageLicenseUrl'|'imageSource'|'imageRemote'|'imageNote'|'imageNoteKo'|'photos'|'source'>;

/** Keep the image's exact creator, source and reuse conditions beside its display. */
export default function PhotoCredit({place,language}:{place:CreditPlace;language:'ko'|'en'}) {
  const ko=language==='ko',photo=place.photos?.find(item=>item.src===place.image);
  const credit=photo?.credit||place.imageCredit;
  const licenseUrl=photo?.licenseUrl||place.imageLicenseUrl;
  const source=photo?.source||place.imageSource||place.imageRemote;
  if(!place.image||!credit)return null;
  const license=licenseUrl?photoLicenseLabel(licenseUrl,language):place.imageLicense;
  return <p className="editorial-photo-credit">{credit}{license&&<> · {licenseUrl?<a href={licenseUrl} target="_blank" rel="noopener noreferrer">{license}</a>:license}</>}{source&&<> · <a href={source} target="_blank" rel="noopener noreferrer">{ko?'사진 출처':'Photo source'}</a></>}<span>{ko?(place.imageNoteKo||'크기 조정·WebP 변환. 화면에 따라 일부가 잘릴 수 있어요.'):(place.imageNote||'Resized and converted to WebP. Display may crop the image.')}</span></p>;
}
