import english from './en.json' with { type: 'json' };
let language='ko';
export function setLanguage(value){language=value==='en'?'en':'ko';}
export function getLanguage(){return language;}
export function locale(){return language==='en'?'en-US':'ko-KR';}
const escapePattern=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Localize authored copy only. Interpolated user data is inserted afterwards.
const fragments=Object.keys(english).filter(key=>key.length>1).sort((a,b)=>b.length-a.length);
const fragmentPattern=new RegExp(fragments.map(escapePattern).join('|'),'g');
export function tr(text){
  const value=String(text??'');
  if(language==='ko')return value;
  return english[value]??value.replace(fragmentPattern,match=>english[match]).replace(/>([^<>]+)</g,(whole,copy)=>english[copy]?`>${english[copy]}<`:whole);
}
export function html(strings,...values){
  if(language==='ko')return strings.reduce((out,part,i)=>out+(i?String(values[i-1]??''):'')+part,'');
  let authored=strings.reduce((out,part,i)=>out+(i?`\uE000${i-1}\uE001`:'')+part,'');
  const token='(\\uE000\\d+\\uE001)';
  const formats=[
    [`직접 기록한 체중 ${token}개의 변화 그래프`,'Chart of $1 recorded weight measurements'],
    [`직접 입력한 측정값 ${token}개 · 측정하지 않은 날은 값이 없어요\\.`,'$1 measurements entered by you · Unmeasured days stay empty.'],
    [`최근 ${token}일 기록 요약`,'Records from the last $1 days'],
    [`이 브라우저에 저장한 기록 ${token}건을 JSON 파일로\\.`,'Export $1 records from this browser as JSON.'],
    [`이 브라우저에 저장된 기록 ${token}건을 비워요\\. 필요한 기록은 먼저 파일로 내보내 주세요\\.`,'Clear $1 records stored in this browser. Export anything you need first.'],
    [`직접 남긴 처방 계획 ${token}건`,'$1 saved prescribed plans'],
    [`내가 확인한 메모 ${token}개`,'$1 notes reviewed by you'],
    [`소개 ${token} / 4`,'Introduction $1 / 4'],
    [`${token}님의 Milo`,"Milo with $1"],
    [`메모 ${token} 삭제`,'Delete note $1'],
    [`측정 체중 \\(${token}\\)`,'Measured weight ($1)'],
    [`${token}을 저장했어요\\.`,'$1 saved.'],
    [`${token} · 직접 입력한 측정값`,'$1 · Entered manually'],
    [`${token}건`,'$1 records'],
    [`${token}회`,'$1 times'],
    [`${token} 회`,'$1 times']
  ];
  for(const[pattern,replacement]of formats)authored=authored.replace(new RegExp(pattern,'g'),replacement);
  authored=tr(authored);
  return authored.replace(/\uE000(\d+)\uE001/g,(_,i)=>String(values[Number(i)]??''));
}
export function weekdayLabel(day){return language==='ko'?`${day}요일`:({월:'Monday',화:'Tuesday',수:'Wednesday',목:'Thursday',금:'Friday',토:'Saturday',일:'Sunday'}[day]||day);}
export function siteLabel(site){return language==='en'?(english[site]||site):site;}
