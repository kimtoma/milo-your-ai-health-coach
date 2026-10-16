const distress=/아프|힘들|불안|우울|지쳤|메스|구역|걱정|sad|worried|anxious|nause|pain|tired|overwhelm|sick/i;
const rules=[
  ['walk',/걷기|걸었|걸음|산책|걷고|운동했|운동을 했|walk(?:ed|ing)?|jog(?:ged|ging)?|exercis(?:e|ed|ing)|workout|ran\b/i],
  ['meal',/먹었|먹고|먹음|식사했|식사 기록|밥먹|아침.*먹|점심.*먹|저녁.*먹|\bate\b|eating|had (?:a |some |my )?(?:salad|lunch|breakfast|dinner|meal)|meal (?:record|log)/i],
  ['injection',/(?:주사|위고비|마운자로|투여).{0,18}(?:맞았|맞음|맞고|했어|완료|기록)|(?:맞았|맞음).{0,10}주사|injected|(?:took|had|got).{0,20}(?:injection|shot|dose)|(?:injection|shot).{0,12}(?:done|taken|record|log)/i],
  ['celebrate',/체중.*(?:쟀|측정|기록)|몸무게.*(?:쟀|측정|기록)|weighed|weight (?:record|log)|잘했|해냈|proud|did it/i]
];
export function conversationMoods(text=''){
  if(distress.test(text))return ['comfort'];
  const found=rules.map(([mood,pattern])=>({mood,index:String(text).search(pattern)})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index).map(x=>x.mood);
  return found.length?found:['listening'];
}
export function moodForRecord(record){return {injection:'injection',meal:'meal',activity:'walk',checkin:'comfort',weight:'celebrate',plan:'listening'}[record.kind]||'celebrate';}
