export const TYPES = {
  injection: { title: '주사 기록', short: '주사', icon: 'syringe' },
  weight: { title: '체중 기록', short: '체중', icon: 'monitor_weight' },
  meal: { title: '식사 기록', short: '식사', icon: 'restaurant' },
  activity: { title: '활동 기록', short: '활동', icon: 'directions_walk' },
  checkin: { title: '컨디션 기록', short: '컨디션', icon: 'sentiment_satisfied' },
  plan: { title: '처방 계획', short: '처방', icon: 'assignment' }
};

export function validateRecord(kind, fields, unit = 'kg', now = new Date()) {
  if (!TYPES[kind]) throw new Error('기록 종류를 선택해 주세요.');
  const date = new Date(fields.date);
  if (!Number.isFinite(date.getTime()) || date > new Date(now.getTime() + 60000)) throw new Error('실제로 기록한 날짜와 시간을 확인해 주세요. 미래 기록은 남길 수 없어요.');
  const record = { id: crypto.randomUUID(), kind, date: date.toISOString(), note: String(fields.note || '').trim().slice(0, 2000) };
  const decimal = (value, name) => {
    const text = String(value || '').trim().replace(',', '.');
    if (text.length > 40 || !/^\d+(?:\.\d+)?$/.test(text) || !Number.isFinite(Number(text)) || Number(text) <= 0) throw new Error(`${name} 값을 정확히 입력해 주세요.`);
    return text;
  };
  if (kind === 'injection' || kind === 'plan') {
    record.medication = String(fields.medication || '').trim().slice(0, 80);
    if (!record.medication) throw new Error('약 이름을 입력해 주세요.');
    record.dose = kind === 'plan' && !String(fields.dose || '').trim() ? null : decimal(fields.dose, '용량');
    record.site = String(fields.site || '').trim();
    if (kind === 'plan') {
      record.weekday = fields.weekday || null;
      record.time = fields.time || null;
      if (record.weekday && !['월','화','수','목','금','토','일'].includes(record.weekday)) throw new Error('일정의 요일을 확인해 주세요.');
      if (record.time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(record.time)) throw new Error('일정의 시간을 확인해 주세요.');
    }
  } else if (kind === 'weight') {
    const entered = decimal(fields.weight, '측정 체중');
    record.kg = Number(entered) / (unit === 'lb' ? 2.2046226218 : 1);
    if (record.kg > 700) throw new Error('측정 체중과 단위를 다시 확인해 주세요.');
  } else if (kind === 'meal') {
    record.foods = String(fields.foods || '').trim().slice(0, 400);
    if (!record.foods) throw new Error('먹은 음식을 적어 주세요.');
  } else if (kind === 'activity') {
    record.activity = String(fields.activity || '').trim().slice(0, 160);
    if (!record.activity) throw new Error('어떤 활동을 했는지 적어 주세요.');
    record.minutes = fields.minutes ? decimal(fields.minutes, '활동 시간') : null;
  } else {
    record.energy = fields.energy ? Number(fields.energy) : null;
    if (record.energy !== null && (!Number.isInteger(record.energy) || record.energy < 1 || record.energy > 5)) throw new Error('컨디션을 1~5 사이에서 선택해 주세요.');
    record.symptoms = String(fields.symptoms || '').trim().slice(0, 400) || null;
    if (!record.energy && !record.symptoms && !record.note) throw new Error('컨디션이나 오늘의 이야기를 하나 이상 남겨 주세요.');
  }
  return record;
}

export function weightValue(kg, unit = 'kg') {
  return Number(kg * (unit === 'lb' ? 2.2046226218 : 1)).toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

export function titleFor(record, unit = 'kg') {
  if (record.kind === 'weight') return `${weightValue(record.kg, unit)} ${unit}`;
  if (record.kind === 'injection') return `${record.medication} ${record.dose} mg`;
  if (record.kind === 'plan') return `${record.medication} 처방 계획`;
  return TYPES[record.kind].title;
}

export function detailFor(record) {
  if (record.kind === 'injection') return [record.site || '부위 미기록', record.note].filter(Boolean).join(' · ');
  if (record.kind === 'plan') return [record.dose ? `${record.dose} mg` : '용량 미기록', record.weekday ? `매주 ${record.weekday}요일` : '', record.time || '', '실제 주사 기록과 별도'].filter(Boolean).join(' · ');
  if (record.kind === 'meal') return record.foods;
  if (record.kind === 'activity') return record.activity + (record.minutes ? ` · ${record.minutes}분` : '');
  if (record.kind === 'checkin') return [record.energy ? `컨디션 ${record.energy}/5` : '', record.symptoms || '증상 미기록', record.note].filter(Boolean).join(' · ');
  return record.note || '직접 측정한 체중';
}

export function withinDays(records, days, now = new Date()) {
  const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
  return records.filter(record => new Date(record.date) >= start && new Date(record.date) <= now);
}

export function visitSummary(records, days = 30, now = new Date(), unit = 'kg') {
  const selected = withinDays(records, days, now).sort((a,b) => new Date(a.date) - new Date(b.date));
  const weights = selected.filter(r => r.kind === 'weight');
  const injections = selected.filter(r => r.kind === 'injection');
  const checkins = selected.filter(r => r.kind === 'checkin');
  return {
    selected, weights, injections, checkins,
    lines: [
      `최근 ${days}일 동안 직접 남긴 기록 ${selected.length}건`,
      weights.length ? `체중: ${weightValue(weights[0].kg, unit)} ${unit} → ${weightValue(weights.at(-1).kg, unit)} ${unit} (측정 ${weights.length}회)` : '체중: 기록 없음',
      injections.length ? `주사 기록: ${injections.length}회\n${injections.map(r => `${new Date(r.date).toLocaleDateString('ko-KR')} ${r.medication} ${r.dose} mg · ${r.site || '부위 미기록'}`).join('\n')}` : '주사: 기록 없음',
      checkins.length ? `컨디션 기록: ${checkins.length}회\n${checkins.map(r => `${new Date(r.date).toLocaleDateString('ko-KR')} · ${detailFor(r)}`).join('\n')}` : '컨디션·증상: 기록 없음'
    ]
  };
}
