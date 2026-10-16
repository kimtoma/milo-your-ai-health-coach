// Synthetic judging data is isolated from the user's own record store.
const meals=[
  ['현미밥, 닭가슴살, 나물','Brown rice, chicken and vegetables'],
  ['달걀 샌드위치와 우유','Egg sandwich and milk'],
  ['두부 샐러드와 고구마','Tofu salad and sweet potato'],
  ['생선구이, 밥, 채소','Grilled fish, rice and vegetables'],
  ['그릭 요거트와 과일','Greek yogurt and fruit']
];
const activities=[['저녁 산책','Evening walk'],['가벼운 스트레칭','Gentle stretching'],['공원 걷기','Walk in the park']];
const sites=['복부 왼쪽','복부 오른쪽','허벅지 왼쪽','허벅지 오른쪽'];
function bilingual(ko,en){return {ko,en};}
export function createDemoRecords(now=new Date()){
  const records=[];
  const add=(day,kind,extra,hour=9)=>{
    const date=new Date(now.getFullYear(),now.getMonth(),now.getDate()-29+day,hour,10);
    if(date>now)date.setTime(now.getTime()-60000);
    records.push({id:`demo-v1-${day}-${kind}`,kind,date:date.toISOString(),note:'',demo:true,...extra});
  };
  for(let day=0;day<30;day++){
    const kg=Number((78.4-day*.05+Math.sin(day*.8)*.13).toFixed(2));
    add(day,'weight',{kg,demoText:{note:bilingual('데모용 아침 측정','Sample morning measurement')}},8);
    const meal=meals[day%meals.length];
    add(day,'meal',{demoText:{foods:bilingual(...meal)}},12);
    const symptoms=day%11===3?bilingual('가벼운 메스꺼움을 느꼈어요','I noticed mild nausea'):day%7===2?null:bilingual('없음','None');
    add(day,'checkin',{energy:[3,4,3,2,4,4,3][day%7],symptoms:null,demoText:{symptoms,note:bilingual(day%6===0?'오늘은 조금 쉬어 갔어요':'나의 속도로 하루를 보냈어요',day%6===0?'I took things slowly today':'A day at my own pace')}},18);
    if(day%3!==1){const activity=activities[day%3];add(day,'activity',{minutes:String(15+(day%4)*5),demoText:{activity:bilingual(...activity)}},17);}
    if(day%7===0)add(day,'injection',{medication:'마운자로',dose:'2.5',site:sites[Math.floor(day/7)%4],demoText:{medication:bilingual('마운자로','Mounjaro'),note:bilingual('심사용으로 생성한 예시 투여 기록','Synthetic injection record for the demo')}},9);
  }
  add(0,'plan',{medication:'마운자로',dose:'2.5',weekday:['일','월','화','수','목','금','토'][new Date(records[0].date).getDay()],time:'09:10',demoText:{medication:bilingual('마운자로','Mounjaro'),note:bilingual('샘플 계획 · 실제 처방이 아닙니다','Sample plan · Not an actual prescription')}},8);
  return records;
}
export function demoRecordForLanguage(record,language='ko'){
  if(!record.demo||!record.demoText)return record;
  const result={...record};
  for(const[key,value]of Object.entries(record.demoText))result[key]=value?.[language]??value?.ko??null;
  return result;
}
