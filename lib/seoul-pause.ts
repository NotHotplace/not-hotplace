import records from './seoul-pause-evidence.json';
export type SeoulPauseEvidence = {
 readiness:string;id:string;hookKo:string;hookEn:string;fitKo:string;fitEn:string;cautionKo:string;cautionEn:string;
 checked:string;sources:{labelKo:string;labelEn:string;url:string;kind:string;factsKo:string;factsEn:string}[];
 unknownKo:string;unknownEn:string;
};
export const seoulPauseEvidence:SeoulPauseEvidence[]=records;
export function seoulPauseFor(id:string){return seoulPauseEvidence.find(record=>record.id===id);}
