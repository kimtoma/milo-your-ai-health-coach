import {withinDays} from './model.js';
export function buildReport(records,days=30,now=new Date()){
  const selected=withinDays(records,days,now).filter(r=>r.kind!=='plan').sort((a,b)=>new Date(a.date)-new Date(b.date));
  const ofKind=kind=>selected.filter(r=>r.kind===kind);
  const weights=ofKind('weight'),injections=ofKind('injection'),meals=ofKind('meal'),activities=ofKind('activity'),checkins=ofKind('checkin');
  const knownDurations=activities.filter(r=>r.minutes!==null&&r.minutes!==undefined&&r.minutes!=='');
  const symptomMissing=checkins.filter(r=>!r.symptoms).length;
  const symptomNone=checkins.filter(r=>['없음','none'].includes(String(r.symptoms).trim().toLowerCase())).length;
  return {days,selected,weights,injections,meals,activities,checkins,knownDurations,
    activityMinutes:knownDurations.reduce((sum,r)=>sum+Number(r.minutes),0),symptomMissing,symptomNone,
    symptomNoted:checkins.length-symptomMissing-symptomNone,
    firstWeight:weights[0]?.kg??null,lastWeight:weights.at(-1)?.kg??null,
    weightChange:weights.length>1?weights.at(-1).kg-weights[0].kg:null,
    recordedDays:new Set(selected.map(r=>new Date(r.date).toDateString())).size,
    demo:selected.length>0&&selected.every(r=>r.demo)
  };
}
