'use client';
import {useState} from 'react';
import type {PlacePhoto} from '@/lib/catalog';
import {photoLicenseLabel} from '@/lib/photo-license';
export default function PlaceGallery({photos, name, language}: {photos: PlacePhoto[]; name: string; language: 'ko'|'en'}) {
  const [selected, setSelected] = useState(0);
  const photo = photos[selected], ko = language === 'ko';
  if (!photo) return null;
  return <div className="place-photo-gallery">
    <figure className="place-cover"><img src={photo.src} alt={ko ? photo.altKo : photo.altEn} width={photo.width} height={photo.height} fetchPriority="high"/>
      <figcaption>{photo.credit} · <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photoLicenseLabel(photo.licenseUrl, language)}</a> · <a href={photo.source} target="_blank" rel="noopener noreferrer">{ko ? '사진 출처' : 'Photo source'}</a><span>{ko ? '크기 조정·WebP 변환. 화면에 따라 일부가 잘릴 수 있어요.' : 'Resized and converted to WebP. Display may crop the image.'}</span></figcaption>
    </figure>
    <div className="place-photo-thumbnails" aria-label={ko ? name+' 사진 선택' : 'Choose a photo of '+name}>{photos.map((item,index) => <button key={item.src} type="button" aria-pressed={index===selected} aria-label={ko ? `사진 ${index+1}: ${item.altKo}` : `Photo ${index+1}: ${item.altEn}`} onClick={() => setSelected(index)}><img src={item.src} alt="" loading="lazy" width={item.width} height={item.height}/><span>{index+1} / {photos.length}</span></button>)}</div>
  </div>;
}
