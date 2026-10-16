import type {Place} from '@/lib/catalog';
import {photoLicenseLabel} from '@/lib/photo-license';

type CreditPlace = Pick<Place,'image'|'imageCredit'|'imageCreditUrl'|'imageLicense'|'imageLicenseUrl'|'imageSource'|'imageRemote'|'imageNote'|'imageNoteKo'|'photos'|'source'>;

/** Keep the image's exact creator, source and reuse conditions beside its display. */
export default function PhotoCredit({place,language,compact=false}:{place:CreditPlace;language:'ko'|'en';compact?:boolean}) {
  const ko=language==='ko',photo=place.photos?.find(item=>item.src===place.image);
  const credit=photo?.credit||place.imageCredit;
  const licenseUrl=photo?.licenseUrl||place.imageLicenseUrl;
  const source=photo?.source||place.imageSource||place.imageRemote;
  if(!place.image||!credit)return null;
  const license=licenseUrl?photoLicenseLabel(licenseUrl,language):place.imageLicense;
  const note=ko?(place.imageNoteKo||'크기 조정·WebP 변환. 화면에 따라 일부가 잘릴 수 있어요.'):(place.imageNote||'Resized and converted to WebP. Display may crop the image.');
  const attribution=<>{place.imageCreditUrl?<a href={place.imageCreditUrl} target="_blank" rel="noopener noreferrer">{credit}</a>:credit}{license&&<> · {licenseUrl?<a href={licenseUrl} target="_blank" rel="noopener noreferrer">{license}</a>:license}</>}{source&&<> · <a href={source} target="_blank" rel="noopener noreferrer">{ko?'사진 출처':'Photo source'}</a></>}</>;
  if(!compact)return <p className="editorial-photo-credit">{attribution}<span>{note}</span></p>;
  // Preserve the source's opening photo/capture sentence; move the complete,
  // unchanged technical and reuse note into native keyboard-accessible details.
  const opening=note.split(/(?<=[.!?])\s/)[0];
  const captureNote=/^(Resized|크기 조정|크기를 조정)/.test(opening)?undefined:opening;
  return <div className="editorial-photo-caption"><p className="editorial-photo-credit">{attribution}{captureNote&&<span>{captureNote}</span>}</p><details className="editorial-photo-details"><summary>{ko?'사진 상세 정보':'Photo details'}</summary><p>{note}</p></details></div>;
}
