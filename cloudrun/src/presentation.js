import {TYPES,titleFor as koreanTitle,detailFor as koreanDetail,visitSummary as koreanSummary,weightValue} from './model.js';
import {getLanguage,tr,locale,weekdayLabel,siteLabel} from './i18n.js';
export function titleFor(record,unit='kg'){
  if(getLanguage()==='ko')return koreanTitle(record,unit);
  if(record.kind==='weight')return `${weightValue(record.kg,unit)} ${unit}`;
  if(record.kind==='injection')return `${record.medication} ${record.dose} mg`;
  if(record.kind==='plan')return `${record.medication} plan`;
  return tr(TYPES[record.kind].title);
}
export function detailFor(r){
  if(getLanguage()==='ko')return koreanDetail(r);
  if(r.kind==='injection')return [r.site?siteLabel(r.site):'Site not recorded',r.note].filter(Boolean).join(' · ');
  if(r.kind==='plan')return [r.dose?`${r.dose} mg`:'Dose not recorded',r.weekday?`Every ${weekdayLabel(r.weekday)}`:'',r.time||'','Separate from injections taken'].filter(Boolean).join(' · ');
  if(r.kind==='meal')return r.foods;
  if(r.kind==='activity')return r.activity+(r.minutes?` · ${r.minutes} min`:'');
  if(r.kind==='checkin')return [r.energy?`How I feel: ${r.energy}/5`:'',r.symptoms||'Symptoms not recorded',r.note].filter(Boolean).join(' · ');
  return r.note||'Weight entered manually';
}
export function visitSummary(records,days=30,now=new Date(),unit='kg'){
  const s=koreanSummary(records,days,now,unit);if(getLanguage()==='ko')return s;
  const date=r=>new Date(r.date).toLocaleDateString(locale());
  s.lines=[
    `${s.selected.length} records entered in the last ${days} days`,
    s.weights.length?`Weight: ${weightValue(s.weights[0].kg,unit)} ${unit} → ${weightValue(s.weights.at(-1).kg,unit)} ${unit} (${s.weights.length} measurements)`:'Weight: no records',
    s.injections.length?`Injections: ${s.injections.length}\n${s.injections.map(r=>`${date(r)} ${r.medication} ${r.dose} mg · ${r.site?siteLabel(r.site):'Site not recorded'}`).join('\n')}`:'Injections: no records',
    s.checkins.length?`Check-ins: ${s.checkins.length}\n${s.checkins.map(r=>`${date(r)} · ${detailFor(r)}`).join('\n')}`:'Check-ins and symptoms: no records'
  ];return s;
}
