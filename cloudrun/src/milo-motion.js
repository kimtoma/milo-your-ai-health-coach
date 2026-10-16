export const MOODS = ['idle','wave','listening','thinking','comfort','celebrate','walk','stretch','squat','meal','injection'];

export function conversationMood(text='') {
  if (/아프|힘들|불안|우울|지쳤|메스|구역|걱정|sad|worried|anxious|nause|pain|tired|overwhelm|sick/i.test(text)) return 'comfort';
  if (/걷|산책|운동|걸었|walk|jog|exercise|workout|run\b/i.test(text)) return 'walk';
  return 'listening';
}

export function poseAt(mood, time, reduced=false) {
  const t = reduced ? 0.7 : time;
  const p = {lift:0,lean:0,turn:0,head:-.08,headY:0,armL:-.22,armR:.22,armLX:0,armRX:0,legL:0,legR:0,squash:1,smile:1,open:0,closed:0,brow:0,holding:0};
  if (!reduced) {p.lift=Math.sin(t*1.7)*.012;p.head+=Math.sin(t*.8)*.018;}
  switch(mood) {
    case 'wave': p.armR=2.4+Math.sin(t*8)*.23;p.head=-.08;p.smile=1.2;break;
    case 'listening': p.head=.10;p.armL=.13;p.armR=-.13;break;
    case 'thinking': p.head=-.13;p.headY=.05;p.armL=-.65;p.armLX=-.8;p.brow=.1;break;
    case 'comfort': p.head=.13;p.lean=.035;p.armL=-.65;p.armR=.65;p.armLX=-.65;p.armRX=-.65;p.smile=.55;p.brow=.55;break;
    case 'celebrate': p.armL=-2.25+Math.sin(t*7)*.10;p.armR=2.25-Math.sin(t*7)*.10;p.open=.95;p.closed=1;p.lift=reduced?0:Math.abs(Math.sin(t*5))*.13;p.squash=1+Math.sin(t*10)*.025;break;
    case 'walk': p.armLX=Math.sin(t*6)*.65;p.armRX=-p.armLX;p.legL=-Math.sin(t*6)*.45;p.legR=-p.legL;p.lift=reduced?0:Math.abs(Math.sin(t*6))*.045;p.lean=Math.sin(t*6)*.035;p.open=.25;break;
    case 'meal': p.holding=1;p.armL=-.32;p.armR=.28;p.armLX=-1.05;p.armRX=-.9-Math.sin(t*2.7)*.2;p.head=.05;p.open=(Math.sin(t*2.7)+1)/2>.8?.7:0;break;
    case 'injection': p.armL=-.3;p.armR=.4;p.armRX=-.6;p.head=.08;p.closed=(Math.sin(t*1.7)+1)/2>.87?1:0;break;
    case 'stretch': p.armL=-2.75;p.armR=2.75;p.closed=1;p.head=Math.sin(t*1.2)*.08;p.squash=1.025;break;
    case 'squat': {const down=reduced?.65:(Math.sin(t*2.8)+1)/2;p.lift=-down*.22;p.squash=1-down*.10;p.armLX=-1.25;p.armRX=-1.25;p.legL=-down*.32;p.legR=-down*.32;p.brow=.35;break;}
  }
  return p;
}

export function easePose(current, target, delta) {
  const alpha = 1-Math.exp(-Math.min(Math.max(delta,0),.1)*10);
  for (const key of Object.keys(target)) current[key] += (target[key]-current[key])*alpha;
  return current;
}
