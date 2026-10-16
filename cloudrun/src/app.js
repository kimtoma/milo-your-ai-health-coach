import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/dialog/dialog.js';
import '@material/web/ripple/ripple.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import { TYPES, validateRecord, weightValue, withinDays } from './model.js';
import {titleFor,detailFor,visitSummary} from './presentation.js';
import {tr,html,setLanguage,getLanguage,locale,weekdayLabel} from './i18n.js';
import {createDemoRecords,demoRecordForLanguage} from './demo.js';
import {buildReport} from './report.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = name => html`<span class="symbols" aria-hidden="true">${name}</span>`;
const mi = name => html`<md-icon aria-hidden="true">${name}</md-icon>`;
const STORAGE = 'milo.material.records.v1';
const DEMO_STORAGE = 'milo.material.demo.records.v1';
const DEMO_MODE = 'milo.material.demo.mode.v1';
const PREFS = 'milo.material.preferences.v1';
let storageError = false;
function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { storageError = true; return fallback; }
}
const restored = load(STORAGE, []);
const state = {
  route: location.hash.slice(1) || 'milo', realRecords: Array.isArray(restored) ? restored.filter(r => r && TYPES[r.kind] && r.id && Number.isFinite(new Date(r.date).getTime())) : [],
  demoMode:load(DEMO_MODE,null), demoRecords:load(DEMO_STORAGE,null),
  get records(){return this.demoMode?(this.demoRecords||[]).map(r=>demoRecordForLanguage(r,getLanguage())):this.realRecords;},
  set records(value){if(this.demoMode)this.demoRecords=value;else this.realRecords=value;},
  preferences: { language:'ko', theme:'light', unit:'kg', palette:'blue', name:'', nameDraft:'', introStep:0, onboardingDone:false, memories:[], ...load(PREFS, {}) },
  messages:loadConversation().messages, composer:loadConversation().composer, busy:false, filter:'all', recordsSection:0, query:'', period:30, ai:'checking', story:'', questions:'', lastRecord:null
};
setLanguage(state.preferences.language);
const journalRoutes = [
  ['overview','오늘의 요약','오늘 남긴 기록을 한눈에','light_mode'],
  ['progress','변화 보기','내가 측정한 체중의 흐름','show_chart'],
  ['plan','나의 일정','의료진에게 안내받은 계획','assignment'],
  ['visit','진료 준비','기록과 질문을 차분히 정리','clinical_notes'],
  ['story','작은 성취 공유','나만의 한 장으로 남기기','auto_awesome']
];
const routeTitles = {milo:'Milo',journal:'기록',overview:'오늘의 요약',progress:'변화 보기',plan:'나의 일정',visit:'진료 준비',story:'작은 성취 공유',settings:'앱 사용 방식',me:'나',health:'나의 건강',report:'리포트'};
let snackTimer;
let recordKind;
const greetingDate = {format:date=>new Intl.DateTimeFormat(locale(),{month:'long',day:'numeric',weekday:'long'}).format(date)};
function persistRecords(next) {
  try { localStorage.setItem(state.demoMode?DEMO_STORAGE:STORAGE, JSON.stringify(next)); state.records = next; return true; }
  catch { toast(tr('브라우저에 저장하지 못했어요. 저장 공간과 설정을 확인해 주세요.')); return false; }
}
function savePreferences() {
  try { localStorage.setItem(PREFS, JSON.stringify(state.preferences)); }
  catch { toast(tr('이 브라우저에서 설정을 저장하지 못했어요.')); applyTheme(); render(); return false; }
  applyTheme(); render(); return true;
}
function applyTheme() {
  setLanguage(state.preferences.language);
  document.documentElement.lang=getLanguage();
  $('.skip-link').textContent=tr('본문으로 이동');
  $('#record-dialog').setAttribute('aria-label',tr('기록 남기기'));
  $('#info-dialog').setAttribute('aria-label',tr('상세 정보'));
  document.title=getLanguage()==='en'?'Milo — My health companion':'Milo — 나의 건강 메이트';
  const { theme, palette } = state.preferences;
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const palettes = { blue:dark?['#a9c7ff','#073069','#21477f','#dce7ff']:['#2c68ce','#ffffff','#dce7ff','#123b78'], sage:dark?['#a6d6b9','#123a26','#28513c','#c4efd5']:['#2d6c54','#ffffff','#d4eedf','#133e2b'], indigo:dark?['#c9bfff','#30275b','#4a4078','#e7dfff']:['#6256b1','#ffffff','#e7e0ff','#372a71'] };
  const values = palettes[palette] || palettes.blue;
  ['primary','on-primary','primary-container','on-primary-container'].forEach((token,i)=>document.documentElement.style.setProperty(html`--md-sys-color-${token}`,values[i]));
}
function toast(message, action, callback) {
  clearTimeout(snackTimer);
  const node = $('#snackbar'); node.replaceChildren();
  const label = document.createElement('span'); label.textContent = message; node.append(label);
  if (action) { const button = document.createElement('button'); button.textContent = action; button.onclick = () => { callback(); node.hidden=true; }; node.append(button); }
  node.hidden = false; snackTimer = setTimeout(()=>{node.hidden=true;}, 9000);
}
function navigate(route) {
  state.route = routeTitles[route] ? route : 'milo';
  if(state.route==='report')state.period=30;
  history.pushState(null,'',html`#${state.route}`); render(); window.scrollTo(0,0);
}
window.addEventListener('popstate',()=>{state.route=location.hash.slice(1)||'milo';render();});
window.addEventListener('hashchange',()=>{state.route=location.hash.slice(1)||'milo';render();});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);

function navItem(route,label,symbol) {
  const recordsRoutes=['journal','progress','health','overview','report'];
  const meRoutes=['me','plan','visit','story','settings'];
  const active=route==='journal'?recordsRoutes.includes(state.route):route==='me'?meRoutes.includes(state.route):state.route===route;
  return html`<button class="nav-item ${active?'active':''}" data-action="navigate" data-route="${route}" ${active?'aria-current="page"':''}>${icon(symbol)}<span class="nav-label">${label}</span><span class="rail-label">${label}</span><md-ripple></md-ripple></button>`;
}
function shell(content) {
  const title = tr(routeTitles[state.route] || 'Milo');
  const aiLabel = state.ai === 'checking' ? tr('연결 확인 중') : state.ai === 'error' ? tr('연결 다시 확인') : state.ai === 'demo' ? tr('오프라인 체험') : 'Gemini';
  return html`<div class="app-shell">
    <aside class="sidebar" aria-label="주 메뉴">
      <div class="brand"><img class="brand-mark" src="/assets/milo-rounded.png" alt=""><div class="brand-copy"><div class="brand-name">Milo<span style="color:var(--md-sys-color-primary)">.</span></div><div class="brand-sub">나의 건강 메이트</div></div></div>
      <md-filled-tonal-button class="nav-add" data-action="log" aria-label="기록 남기기">${mi('add')}<span class="button-label">기록 남기기</span></md-filled-tonal-button>
      <nav class="nav-list">${navItem('milo','Milo','chat_bubble')}${navItem('journal',tr('기록'),'menu_book')}${navItem('me',tr('나'),'person')}</nav>
      <div class="sidebar-bottom">${navItem('settings',tr('설정'),'settings')}<div class="local-note">${icon('lock')}<span>나의 기록은<br>이 브라우저 안에</span></div></div>
    </aside>
    <div class="main-shell"><header class="topbar"><div><div class="topbar-title">${title}</div><div class="topbar-sub">${state.route==='milo'?tr('나의 속도에 맞춰, 함께.'):greetingDate.format(new Date())}</div></div><div class="topbar-actions">
      ${state.route==='milo'?html`<button class="connection-pill" data-action="connection" aria-label="AI 연결 및 데이터 안내"><span class="status-dot" ${state.ai==='error'?'style="background:var(--md-sys-color-error)"':''}></span><span class="connection-label">${aiLabel}</span>${icon('expand_more')}</button><md-icon-button data-action="new-chat" aria-label="새 대화">${mi('edit_square')}</md-icon-button>`:''}
      <md-icon-button class="mobile-only" data-action="navigate" data-route="settings" aria-label="설정">${mi('settings')}</md-icon-button>
    </div></header><main class="workspace" id="main" tabindex="-1">${renderModeBanner()}${content}</main></div>
    <div class="mobile-nav"><nav aria-label="주 메뉴">${[['milo','Milo','chat_bubble'],['journal',tr('기록'),'menu_book'],['me',tr('나'),'person']].map(([r,l,i])=>{const active=r==='milo'?state.route==='milo':r==='journal'?['journal','progress','health','overview','report'].includes(state.route):['me','plan','visit','story','settings'].includes(state.route);return html`<button class="mobile-destination ${active?'active':''}" data-action="navigate" data-route="${r}" ${active?'aria-current="page"':''}><span class="nav-indicator">${icon(i)}</span>${tr(l)}</button>`;}).join('')}</nav><md-filled-icon-button class="mobile-fab" data-action="log" aria-label="기록 남기기">${mi('add')}</md-filled-icon-button></div>
  </div>`;
}
function starter(title,sub,symbol,kind,route) {
  return html`<button class="starter" data-action="${kind?'log':'navigate'}" ${kind?html`data-kind="${kind}"`:html`data-route="${route}"`}>${icon(symbol)}<span><b>${title}</b><small>${sub}</small></span><md-ripple></md-ripple></button>`;
}
function renderMilo() {
  const today = state.records.filter(r=>r.kind!=='plan'&&new Date(r.date).toDateString()===new Date().toDateString()).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const welcome = html`<section class="welcome" aria-label="Milo와 시작하기"><button class="mascot-button" data-action="hello" aria-label="Milo와 인사하기"><img class="mascot" src="/assets/milo-rounded.png" alt="둥근 몸으로 손을 흔드는 새 Milo" width="164" height="164"></button><div class="eyebrow">매일 조금씩, 나의 속도로</div><h1>오늘의 작은 기록,<br>함께 남겨볼까요?</h1><p class="intro">주사와 체중, 그리고 오늘의 이야기.<br>알려준 만큼만 함께 남겨요.</p><div class="starters">${starter(tr('주사 남기기'),tr('약 이름과 용량을 정확하게'),'syringe','injection')}${starter(tr('체중 남기기'),tr('오늘 측정한 나의 변화'),'monitor_weight','weight')}${starter(tr('한 주 돌아보기'),tr('쌓인 기록을 차분히 살펴요'),'show_chart',null,'progress')}${starter(tr('진료 준비'),tr('다음 만남을 위한 메모'),'clinical_notes',null,'visit')}</div></section>`;
  const transcript = html`<section class="transcript" aria-label="Milo와의 대화" aria-live="polite">${state.messages.map((m,i)=>html`<article class="message ${m.role} ${m.error?'error':''}">${m.role==='assistant'?'<img class="message-avatar" src="/assets/milo-rounded.png" alt="">':''}<div class="message-body">${m.role==='assistant'?'<div class="speaker">Milo</div>':''}${esc(m.text)}${m.role==='assistant'&&!m.error?html`<div class="message-reactions"><button data-action="reaction" data-index="${i}" aria-label="답변에 공감하기" aria-pressed="${!!m.liked}">${icon(m.liked?'favorite':'favorite_border')}</button></div>`:''}</div></article>`).join('')}${state.busy?html`<article class="message"><img class="message-avatar" src="/assets/milo-rounded.png" alt=""><div><div class="muted small">Milo가 답변을 준비하고 있어요</div><div class="thinking" role="status" aria-label="답변 기다리는 중"><i></i><i></i><i></i></div></div></article>`:''}${state.messages.length&&!state.busy?html`<div class="chat-followups"><md-outlined-button data-action="log" data-kind="injection">주사 기록</md-outlined-button><md-outlined-button data-action="log" data-kind="weight">체중 기록</md-outlined-button><md-text-button data-action="navigate" data-route="journal">기록 보기</md-text-button></div>`:''}</section>`;
  return html`<div class="milo-layout"><div class="conversation">${state.messages.length?transcript:welcome}<div class="composer-wrap"><form class="composer" id="chat-form"><md-icon-button data-action="log" type="button" aria-label="기록 종류 선택">${mi('add')}</md-icon-button><textarea id="chat-input" aria-label="Milo에게 메시지" placeholder="Milo에게 편하게 이야기해요" rows="1" maxlength="8000">${esc(state.composer)}</textarea><md-filled-icon-button id="send-button" type="submit" aria-label="메시지 보내기" ${state.busy?'disabled':''}>${mi('arrow_upward')}</md-filled-icon-button></form><p class="composer-note">${icon('lock')}보내는 대화만 Gemini에 전달돼요 · 기록은 내가 확인한 뒤에</p></div></div>
    <aside class="context-panel" aria-label="오늘의 기록 요약"><section class="today-card"><div class="section-line"><h2>오늘의 기록</h2><span class="muted small">${new Date().toLocaleDateString(locale(),{month:'numeric',day:'numeric'})}</span></div>${today.length?today.slice(0,4).map(r=>html`<div class="mini-record">${icon(TYPES[r.kind].icon)}<div><strong>${esc(titleFor(r,state.preferences.unit))}</strong><small>${esc(detailFor(r))}</small></div></div>`).join(''):html`<div class="today-empty"><div class="empty-orbit">${icon('edit_note')}</div><b>작은 기록부터 시작해요</b><p>오늘의 주사, 체중, 컨디션.<br>하나씩 남겨도 충분해요.</p></div>`}<md-text-button data-action="navigate" data-route="journal">기록 열기${mi('arrow_forward')}</md-text-button></section><section class="care-note">${icon('favorite')}<b>완벽하지 않아도 괜찮아요.</b><p>기록이 비어 있는 날도, 잠시 쉬어가는 날도 나의 여정에 포함돼요.</p></section><div class="context-links">${icon('verified_user')}내가 선택한 기록만, 내 브라우저에.</div></aside></div>`;
}
function journalTools() {return html`<nav class="journal-tools" aria-label="기록 메뉴">${journalRoutes.map(([r,l,s,i])=>html`<button class="journal-tool" data-action="navigate" data-route="${r}">${icon(i)}<span><b>${l}</b><small>${s}</small></span>${icon('chevron_right').replace('class="symbols"','class="symbols chevron"')}<md-ripple></md-ripple></button>`).join('')}</nav>`;}
function heading(title,description,eyebrow='MY JOURNAL',action='') {return html`<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;}
function back() {const me=['plan','visit','story','settings'].includes(state.route);return html`<md-text-button class="route-back no-print" data-action="navigate" data-route="${me?'me':'journal'}">${mi('arrow_back')}${me?tr('나'):tr('기록')}</md-text-button>`;}
function empty(title,description,symbol='menu_book',kind) {return html`<div class="empty-state">${icon(symbol)}<h2>${title}</h2><p>${description}</p>${kind?html`<md-filled-button data-action="log" data-kind="${kind}">${mi('add')}첫 기록 남기기</md-filled-button>`:''}</div>`;}
function recordRows(records) {
  let lastDay='';
  return [...records].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(r=>{const day=new Date(r.date).toLocaleDateString(locale(),{month:'long',day:'numeric',weekday:'short'});const label=day===lastDay?'':html`<h3 class="timeline-day">${day}</h3>`;lastDay=day;return html`${label}<button class="record-row" data-action="detail" data-id="${r.id}"><span class="icon-tile">${icon(TYPES[r.kind].icon)}</span><span class="record-main"><b>${esc(titleFor(r,state.preferences.unit))}</b><small>${esc(detailFor(r))}</small></span><time>${new Date(r.date).toLocaleTimeString(locale(),{hour:'numeric',minute:'2-digit'})}</time>${icon('chevron_right')}</button>`;}).join('');
}
function renderJournal() {
  const section=state.recordsSection;
  const filters=[['all',tr('전체')],...Object.entries(TYPES).filter(([k])=>k!=='plan').map(([k,v])=>[k,tr(v.short)])];
  return html`<div class="page-content records-page">${heading(section===0?tr('하루를 이루는 작은 순간들'):section===1?tr('나의 기록을 천천히'):tr('나의 건강도 한곳에서'),section===0?tr('남겨 둔 기록에서 다시 보고 싶은 순간을 찾아요.'):section===1?tr('목표나 예측 대신, 나의 실제 흐름을 살펴요.'):tr('기록의 출처와 연결 상태를 함께 확인해요.'),'THE DAYS, KEPT',html`<md-filled-tonal-button class="desktop-only" data-action="log">${mi('add')}기록 추가</md-filled-tonal-button>`)}<md-tabs id="records-sections" active-tab-index="${section}" aria-label="기록 화면"><md-primary-tab>기록</md-primary-tab><md-primary-tab>흐름</md-primary-tab><md-primary-tab>건강</md-primary-tab></md-tabs><div class="records-report-link"><md-outlined-button data-action="navigate" data-route="report">${mi('clinical_notes')}리포트 보기</md-outlined-button></div><div class="records-tab-content">${section===1?renderProgress(true):section===2?renderHealth(true):html`<md-outlined-text-field id="journal-search" label="다시 보고 싶은 순간" value="${esc(state.query)}" type="search">${mi('search').replace('<md-icon','<md-icon slot="leading-icon"')}</md-outlined-text-field><div class="filter-row" style="margin-top:20px" role="group" aria-label="기록 필터">${filters.map(([k,l])=>html`<button class="filter ${state.filter===k?'active':''}" data-action="filter" data-filter="${k}" aria-pressed="${state.filter===k}">${tr(l)}</button>`).join('')}</div><section id="record-results" aria-label="기록 타임라인">${journalResults()}</section>`}</div></div>`;
}
function journalResults() {
  const query=state.query.trim().toLowerCase();
  const records=state.records.filter(r=>(state.filter==='all'||r.kind===state.filter)&&(!query||[titleFor(r,state.preferences.unit),detailFor(r)].join(' ').toLowerCase().includes(query)));
  return records.length?recordRows(records):empty(query?tr('일치하는 기록이 없어요'):state.records.length?tr('이 종류의 기록은 아직 없어요'):tr('나의 이야기는 여기서 시작돼요'),query?tr('다른 단어나 기록 종류로 찾아보세요.'):tr('주사, 체중, 식사, 활동, 컨디션. 남기고 싶은 순간부터 기록해 보세요.'),'menu_book',query?null:'injection');
}
function renderOverview() {
  const today=state.records.filter(r=>new Date(r.date).toDateString()===new Date().toDateString()&&r.kind!=='plan');
  const rows=Object.entries(TYPES).filter(([k])=>k!=='plan').map(([k,v])=>{const matches=today.filter(r=>r.kind===k);return html`<div class="summary-row"><span>${tr(v.title)}</span><b>${matches.length?html`${matches.length}건`:tr('미기록')}</b></div>`;}).join('');
  return html`<div class="page-content">${back()}${heading(tr('오늘은 어떤 하루였나요?'),tr('직접 남긴 기록만 모았어요. 비어 있는 값은 0으로 채우지 않아요.'),'TODAY')}<div class="two-pane"><section class="surface-card"><h2>${greetingDate.format(new Date())}</h2>${today.length?recordRows(today):empty(tr('오늘의 첫 기록을 기다려요'),tr('몸의 변화나 작은 한 끼, 기억하고 싶은 것부터 남겨요.'),'light_mode','checkin')}</section><aside class="surface-card"><h2>오늘의 한눈 보기</h2><div class="summary-list">${rows}</div><p class="caption">걸음 수·수면 등 기기 건강 데이터는 이 웹 앱과 연결되어 있지 않아요.</p></aside></div></div>`;
}
function chart(weights) {
  if(weights.length<2) return empty(tr('기록이 쌓이면 변화가 보여요'),weights.length?tr('체중 기록을 한 번 더 남기면 그래프로 이어볼 수 있어요.'):tr('측정한 체중을 남기면 나의 흐름을 볼 수 있어요.'),'show_chart','weight');
  const unit=state.preferences.unit;const values=weights.map(r=>r.kg*(unit==='lb'?2.2046226218:1));const min=Math.min(...values)-.5,max=Math.max(...values)+.5;
  const x=i=>46+i/(weights.length-1)*484;const y=v=>205-(v-min)/(max-min)*165;
  const ticks=[min,(min+max)/2,max];
  return html`<div class="chart-box"><svg class="weight-chart" viewBox="0 0 560 255" role="img" aria-label="직접 기록한 체중 ${weights.length}개의 변화 그래프">${ticks.map(v=>html`<line class="chart-grid" x1="46" y1="${y(v)}" x2="530" y2="${y(v)}"/><text class="chart-label" x="2" y="${y(v)+4}">${v.toFixed(1)}</text>`).join('')}<polyline class="chart-line" points="${values.map((v,i)=>html`${x(i)},${y(v)}`).join(' ')}"/>${values.map((v,i)=>html`<circle class="chart-dot" cx="${x(i)}" cy="${y(v)}" r="5"><title>${new Date(weights[i].date).toLocaleDateString(locale())}: ${v.toFixed(2)} ${unit}</title></circle>`).join('')}<text class="chart-label" x="46" y="240">${new Date(weights[0].date).toLocaleDateString(locale(),{month:'numeric',day:'numeric'})}</text><text class="chart-label" text-anchor="end" x="530" y="240">${new Date(weights.at(-1).date).toLocaleDateString(locale(),{month:'numeric',day:'numeric'})}</text></svg></div>`;
}
function periodControl() {return html`<div class="filter-row no-print" role="group" aria-label="조회 기간">${[7,30,90].map(d=>html`<button class="filter ${state.period===d?'active':''}" data-action="period" data-days="${d}" aria-pressed="${state.period===d}">${d===7?tr('1주'):d===30?tr('1개월'):tr('3개월')}</button>`).join('')}</div>`;}
function renderProgress(embedded=false) {
  const weights=withinDays(state.records,state.period).filter(r=>r.kind==='weight').sort((a,b)=>new Date(a.date)-new Date(b.date));
  const unit=state.preferences.unit;
  return html`<div class="page-content">${embedded?'':back()+heading(tr('나의 변화를 차분히'),tr('목표나 예측 대신, 직접 측정한 기록의 흐름을 살펴요.'),'PROGRESS')}${periodControl()}<div class="surface-card">${weights.length?html`<div class="weight-summary"><div><span>최근 측정</span><strong>${weightValue(weights.at(-1).kg,unit)} <small style="font-size:14px">${unit}</small></strong></div><div><span>선택 기간 기록</span><strong>${weights.length}<small style="font-size:14px"> 회</small></strong></div></div>`:''}${chart(weights)}${weights.length?html`<p class="caption">직접 입력한 측정값 ${weights.length}개 · 측정하지 않은 날은 값이 없어요.</p>`:''}</div>${weights.length?html`<section style="margin-top:28px"><h2 style="font-size:16px">기록한 측정값</h2>${recordRows(weights)}</section>`:''}</div>`;
}
function renderPlan() {
  const plans=state.records.filter(r=>r.kind==='plan').sort((a,b)=>new Date(b.date)-new Date(a.date));
  return html`<div class="page-content">${back()}${heading(tr('나의 일정'),tr('의료진에게 안내받은 내용을 그대로 남겨요.'),'MY SCHEDULE')}<div class="two-pane"><div class="surface-card">${plans.length?html`<div class="section-line"><h2>최근 남긴 계획</h2><md-text-button data-action="log" data-kind="plan">새 계획${mi('add')}</md-text-button></div>${recordRows(plans)}`:empty(tr('아직 남긴 처방 계획이 없어요'),tr('안내받은 약 이름과 일정을 남겨 주세요. 용량은 선택이에요. 계획을 저장해도 주사를 맞았다는 기록은 생기지 않아요.'),'assignment','plan')}</div><aside class="care-note"><b>계획과 실제 기록은 따로</b><p>처방 계획을 바꿔도 이전 주사 기록의 약 이름과 용량은 바뀌지 않아요. 실제로 주사를 맞은 뒤 ‘주사 기록’에 남겨 주세요.</p><md-text-button data-action="log" data-kind="injection">주사 기록 남기기${mi('arrow_forward')}</md-text-button></aside></div></div>`;
}
function renderVisit() {
  const s=visitSummary(state.records,state.period,new Date(),state.preferences.unit);
  return html`<div class="page-content">${back()}${heading(tr('다음 진료, 조금 더 편안하게'),tr('내가 남긴 기록과 궁금한 점을 한곳에 모아요.'),'PREPARE FOR A VISIT',html`<md-outlined-button class="desktop-only no-print" data-action="print">${mi('print')}인쇄 / PDF</md-outlined-button>`)}${periodControl()}<div class="two-pane"><section class="surface-card" id="visit-summary"><h2>최근 ${state.period}일 기록 요약</h2>${s.selected.length?html`<div class="summary-list"><div class="summary-row"><span>체중 측정</span><b>${s.weights.length}회</b></div><div class="summary-row"><span>실제 주사 기록</span><b>${s.injections.length}회</b></div><div class="summary-row"><span>컨디션 기록</span><b>${s.checkins.length}회</b></div></div><div class="visit-facts">${s.lines.slice(1).map(line=>html`<p>${esc(line)}</p>`).join('')}</div><p class="caption">직접 남긴 사실을 정리한 요약이에요. 증상 미기록은 ‘증상 없음’과 다르게 표시해요.</p>`:empty(tr('아직 요약할 기록이 없어요'),tr('기록을 남기면 여기에 모여요. 궁금한 질문은 지금부터 적어둘 수 있어요.'),'clinical_notes','injection')}<div class="no-print" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:20px"><md-outlined-button data-action="download-visit">${mi('download')}텍스트 저장</md-outlined-button><md-text-button class="mobile-only" data-action="print">인쇄 / PDF</md-text-button></div></section><aside class="surface-card"><h2>의료진에게 물어볼 것</h2><textarea id="visit-questions" class="note-field" maxlength="2000" placeholder="예: 최근 느꼈던 변화에 대해 물어보고 싶어요." aria-label="의료진에게 물어볼 질문">${esc(state.questions)}</textarea><p class="caption">공유하기 전에 내용과 포함된 기록을 확인해 주세요. 자동으로 전송되지 않아요.</p></aside></div></div>`;
}
function renderStory() {
  return html`<div class="page-content">${back()}${heading(tr('작은 성취도, 나의 이야기'),tr('체중이나 건강 기록을 자동으로 넣지 않아요. 내가 고른 이야기만 남겨요.'),'SMALL WINS')}<div class="two-pane"><div class="story-preview"><img src="/assets/milo-rounded.png" alt="작은 성취를 응원하는 Milo"><blockquote id="story-preview">${esc(state.story||tr('오늘의 나를 위해\n작은 한 걸음을 내디뎠어요.'))}</blockquote><small>나의 속도로, Milo와 함께.</small></div><section class="surface-card story-editor"><h2>어떤 순간을 기억할까요?</h2><textarea class="note-field" id="story-input" maxlength="180" aria-label="작은 성취 이야기" placeholder="기억하고 싶은 작은 순간을 적어 주세요.">${esc(state.story)}</textarea><p class="caption">최대 180자 · 입력한 문장만 이미지에 담겨요.</p><md-filled-button data-action="download-story" style="margin-top:24px">${mi('download')}이미지로 저장</md-filled-button></section></div></div>`;
}
function renderSettings() {
  const p=state.preferences;
  return html`<div class="page-content" style="max-width:800px">${back()}${heading(tr('나에게 맞는 Milo'),tr('보기 편한 화면과 나의 기록을 직접 관리해요.'),'PREFERENCES')}<section class="surface-card settings-section demo-settings"><h2>심사용 데모</h2><p>실제 기록과 분리된 30일 샘플로 Milo를 둘러보세요.</p><div class="demo-settings-actions"><md-filled-tonal-button data-action="toggle-demo">${state.demoMode?tr('내 기록으로 돌아가기'):tr('30일 데모 보기')}</md-filled-tonal-button><md-outlined-button data-action="navigate" data-route="report">30일 리포트</md-outlined-button>${state.demoMode?html`<md-text-button data-action="reset-demo">샘플 다시 만들기</md-text-button>`:''}</div></section><section class="surface-card settings-section"><h2>Language / 언어</h2><div class="settings-row"><div><strong>앱 언어</strong><p>메뉴와 안내, 앞으로 받을 답변의 언어를 선택해요.</p></div><div class="segmented language-control" role="group" aria-label="Language"><button data-action="preference" data-key="language" data-value="ko" class="${p.language!=='en'?'selected':''}" aria-pressed="${p.language!=='en'}">KOREAN</button><button data-action="preference" data-key="language" data-value="en" class="${p.language==='en'?'selected':''}" aria-pressed="${p.language==='en'}">ENGLISH</button></div></div></section><section class="surface-card settings-section"><h2>화면과 표시</h2><div class="settings-row"><div><strong>화면 테마</strong><p>지금 편안한 화면을 선택해요.</p></div><div class="segmented" role="group" aria-label="화면 테마">${[['light',tr('밝게')],['dark',tr('어둡게')],['system',tr('기기 설정')]].map(([v,l])=>html`<button class="${p.theme===v?'selected':''}" data-action="preference" data-key="theme" data-value="${v}" aria-pressed="${p.theme===v}">${tr(l)}</button>`).join('')}</div></div><div class="settings-row"><div><strong>나의 색상</strong><p>Milo Blue를 기본으로.</p></div><div class="palette-options">${[['blue','Milo Blue','#2c68ce'],['sage','Sage','#2d6c54'],['indigo','Soft Indigo','#6256b1']].map(([v,l,c])=>html`<button class="palette-swatch ${p.palette===v?'selected':''}" style="--swatch:${c}" data-action="preference" data-key="palette" data-value="${v}" aria-label="${l}" aria-pressed="${p.palette===v}"></button>`).join('')}</div></div><div class="settings-row"><div><strong>체중 단위</strong><p>기록은 kg 기준으로 보관해요.</p></div><div class="segmented" role="group" aria-label="체중 단위">${['kg','lb'].map(v=>html`<button class="${p.unit===v?'selected':''}" data-action="preference" data-key="unit" data-value="${v}" aria-pressed="${p.unit===v}">${v}</button>`).join('')}</div></div></section><section class="surface-card settings-section"><h2>나의 데이터</h2><div class="settings-row"><div><strong>기록 내보내기</strong><p>이 브라우저에 저장한 기록 ${state.records.length}건을 JSON 파일로.</p></div><md-outlined-button data-action="export">${mi('download')}내보내기</md-outlined-button></div><div class="settings-row"><div><strong>기록 비우기</strong><p>이 브라우저의 기록을 삭제해요.</p></div><md-text-button class="danger-button" data-action="clear-records">기록 비우기</md-text-button></div><div class="privacy-callout">${icon('lock')}<div>기록은 이 브라우저의 저장 공간에만 보관돼요. 다른 기기와 자동 동기화되지 않으며, 브라우저 데이터를 지우면 사라질 수 있어요. 대화에서 보내는 메시지만 Gemini로 전달돼요.</div></div></section></div>`;
}
function render() {
  if(!state.preferences.onboardingDone){$('#app').innerHTML=renderIntroduction();bindIntroduction();return;}
  ensureDemoMode();
  const views={report:renderReport,me:renderMe,health:renderHealth,milo:renderMilo,journal:renderJournal,overview:renderOverview,progress:renderProgress,plan:renderPlan,visit:renderVisit,story:renderStory,settings:renderSettings};
  if(!views[state.route])state.route='milo';
  $('#app').innerHTML=shell(views[state.route]());
  $('#records-sections')?.addEventListener('change',event=>{const index=event.target.activeTabIndex;if(index!==state.recordsSection){state.recordsSection=index;render();}});
  $('#journal-search')?.addEventListener('input',event=>{state.query=event.target.value;$('#record-results').innerHTML=journalResults();});
  const input=$('#chat-input');
  if(input){input.addEventListener('input',()=>{state.composer=input.value;persistConversation();input.style.height='auto';input.style.height=Math.min(input.scrollHeight,130)+'px';});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();sendChat();}});}
  $('#story-input')?.addEventListener('input',e=>{state.story=e.target.value;$('#story-preview').textContent=state.story||tr('오늘의 나를 위해\n작은 한 걸음을 내디뎠어요.');});
  $('#visit-questions')?.addEventListener('input',e=>{state.questions=e.target.value;});
}

async function sendChat() {
  const text=state.composer.trim();if(!text||state.busy)return;
  state.messages.push({role:'user',text});state.composer='';persistConversation();state.busy=true;render();
  requestAnimationFrame(()=>$('#chat-input')?.scrollIntoView({block:'nearest',behavior:'smooth'}));
  try {
    const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,language:getLanguage(),history:state.messages.slice(0,-1).filter(m=>!m.error).slice(-6).map(m=>({role:m.role,text:m.text.slice(0,1500)}))}),signal:AbortSignal.timeout(130000)});
    const data=await response.json();if(!response.ok)throw new Error(data.error||tr('Milo와 연결하지 못했어요. 잠시 후 다시 보내 주세요.'));
    state.messages.push({role:'assistant',text:data.reply});state.ai=data.mode==='live'?'live':'demo';
  } catch {
    state.messages.push({role:'assistant',text:tr('지금은 답변을 받지 못했어요. 보내려던 내용은 입력창에 남겨둘게요. 직접 기록은 계속 사용할 수 있어요.'),error:true});state.composer=text;state.ai='error';
  } finally {persistConversation();state.busy=false;if(state.route==='milo'){render();requestAnimationFrame(()=>$('#chat-input')?.scrollIntoView({block:'nearest',behavior:'smooth'}));}}
}

function localDateTime() {const now=new Date();return new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);}
function field(id,label,type='text',extra='') {return html`<md-outlined-text-field id="${id}" label="${label}" type="${type}" ${extra}></md-outlined-text-field>`;}
async function showRecord(kind) {
  recordKind=kind;
  if(!kind){$('#record-headline').textContent=tr('어떤 순간을 남길까요?');$('#record-content').innerHTML=html`<p class="form-help">Milo와 대화하지 않아도, 원하는 기록을 바로 남길 수 있어요.</p><div class="log-types">${Object.entries(TYPES).map(([k,v])=>html`<button class="log-type" data-action="log-type" data-kind="${k}">${icon(v.icon)}${tr(v.title)}<md-ripple></md-ripple></button>`).join('')}</div>`;$('#record-actions').innerHTML=tr('<md-text-button data-action="close-record">닫기</md-text-button>');}
  else {
    $('#record-headline').textContent=tr(TYPES[kind].title);
    const helpers={injection:tr('실제로 맞은 약 이름과 용량을 확인해 주세요. 약을 선택해도 용량은 자동으로 채우지 않아요.'),weight:tr('지금 직접 측정한 값을 남겨요.'),meal:tr('먹은 음식과 기억하고 싶은 이야기를 남겨요.'),activity:tr('어떤 활동을 했는지 남겨요. 시간은 비워둬도 괜찮아요.'),checkin:tr('느꼈던 만큼만 적어 주세요. 비워둔 증상은 ‘미기록’으로 남아요.'),plan:tr('의료진에게 처방받은 내용을 남겨요. 저장해도 실제 주사 기록은 만들어지지 않아요.')};
    let fields='';
    if(kind==='injection'||kind==='plan')fields=html`<div><div class="field-label">약 이름 빠른 선택</div><div class="choice-chips"><button class="choice-chip" data-action="medication" data-name="${'마운자로'}">마운자로</button><button class="choice-chip" data-action="medication" data-name="${'위고비'}">위고비</button></div></div>${field('log-medication',tr('약 이름'),'text','required maxlength="80"')}${field('log-dose',kind==='plan'?tr('처방 용량 (mg, 선택)'):tr('실제 용량 (mg)'),'text',html`inputmode="decimal" ${kind==='injection'?'required':''} supporting-text="안내받았거나 실제 맞은 용량 그대로 입력"`)}${kind==='plan'?html`<div class="form-row"><label class="native-field">요일 (선택)<select id="log-weekday"><option value="">선택하지 않음</option>${['월','화','수','목','금','토','일'].map(day=>html`<option value="${day}">${weekdayLabel(day)}</option>`).join('')}</select></label><label class="native-field">시간 (선택)<input id="log-time" type="time"></label></div>`:''}${kind==='injection'?html`<label class="native-field">투여 부위 (선택)<select id="log-site"><option value="">기록하지 않음</option>복부 왼쪽</option><option>복부 오른쪽</option><option>허벅지 왼쪽</option><option>허벅지 오른쪽</option><option>위팔 왼쪽</option><option>위팔 오른쪽</option></select></label>`:''}`;
    if(kind==='weight')fields=field('log-weight',html`측정 체중 (${state.preferences.unit})`,'text','inputmode="decimal" required');
    if(kind==='meal')fields=field('log-foods',tr('먹은 음식'),'textarea','required rows="2" maxlength="400"');
    if(kind==='activity')fields=html`${field('log-activity',tr('활동 이름'),'text','required maxlength="160"')}${field('log-minutes',tr('활동 시간 (분, 선택)'),'text','inputmode="decimal"')}`;
    if(kind==='checkin')fields=html`<label class="native-field">오늘의 컨디션 (선택)<select id="log-energy"><option value="">선택하지 않음</option><option value="1">1 · 많이 지쳐요</option><option value="2">2 · 조금 피곤해요</option><option value="3">3 · 보통이에요</option><option value="4">4 · 괜찮아요</option><option value="5">5 · 활기차요</option></select></label>${field('log-symptoms',tr('느낀 증상 (선택)'),'text',tr('maxlength="400" supporting-text="증상이 없었다면 ‘없음’이라고 직접 적어 주세요."'))}`;
    $('#record-content').innerHTML=html`<p class="form-help">${helpers[kind]}</p><div class="form-stack">${fields}<label class="native-field">${kind==='plan'?tr('처방 날짜'):tr('기록 날짜와 시간')}<input id="log-date" type="datetime-local" value="${localDateTime()}" max="${localDateTime()}" required></label>${field('log-note',tr('덧붙일 이야기 (선택)'),'textarea','rows="2" maxlength="2000"')}</div><p class="form-error" id="log-error" role="alert"></p>`;
    $('#record-actions').innerHTML=tr('<md-text-button data-action="close-record">취소</md-text-button><md-filled-button data-action="save-record">확인하고 저장</md-filled-button>');
    if(kind==='injection'||kind==='plan')$('#log-medication').addEventListener('input',()=>{$('#log-dose').value='';});
  }
  const dialog=$('#record-dialog');if(!dialog.open)await dialog.show();
}
async function saveRecord() {
  const value=id=>$(html`#log-${id}`)?.value||'';
  let record;
  try {record=validateRecord(recordKind,{medication:value('medication'),dose:value('dose'),weight:value('weight'),foods:value('foods'),activity:value('activity'),minutes:value('minutes'),energy:value('energy'),symptoms:value('symptoms'),site:value('site'),weekday:value('weekday'),time:value('time'),note:value('note'),date:value('date')},state.preferences.unit);}
  catch(error){$('#log-error').textContent=tr(error.message);return;}
  if(record.kind==='injection'&&state.records.some(r=>r.kind==='injection'&&r.medication===record.medication&&Number(r.dose)===Number(record.dose)&&Math.abs(new Date(r.date)-new Date(record.date))<60000)){$('#log-error').textContent=tr('같은 시각에 남긴 주사 기록이 있어요. 기록을 확인해 주세요.');return;}
  if(!persistRecords([...state.records,record]))return;
  await $('#record-dialog').close();render();toast(html`${tr(TYPES[record.kind].title)}을 저장했어요.`,tr('되돌리기'),()=>{if(persistRecords(state.records.filter(r=>r.id!==record.id))){render();toast(tr('방금 저장한 기록을 되돌렸어요.'));}});
}
async function info(title,content,actions=tr('<md-text-button data-action="close-info">닫기</md-text-button>')) {
  $('#info-headline').textContent=title;$('#info-content').innerHTML=content;$('#info-actions').innerHTML=actions;
  if(!$('#info-dialog').open)await $('#info-dialog').show();
}
function detail(id) {
  const r=state.records.find(r=>r.id===id);if(!r)return;
  const values=[[tr('기록 종류'),tr(TYPES[r.kind].title)],[tr('기록 내용'),titleFor(r,state.preferences.unit)],[tr('세부 내용'),detailFor(r)],[tr('날짜'),new Date(r.date).toLocaleString(locale())]];
  info(tr(TYPES[r.kind].title),html`<dl class="detail-grid">${values.map(([k,v])=>html`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p class="caption">이 기록은 현재 브라우저에만 저장되어 있어요.</p>`,html`<md-text-button class="danger-button" data-action="delete-record" data-id="${id}">삭제</md-text-button><md-text-button data-action="close-info">닫기</md-text-button>`);
}
function download(name,text,type='text/plain;charset=utf-8') {const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function downloadStory() {
  const text=state.story.trim();if(!text){toast(tr('먼저 기억하고 싶은 이야기를 적어 주세요.'));$('#story-input')?.focus();return;}
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d');ctx.fillStyle='#e2eaff';ctx.fillRect(0,0,1080,1920);
  const image=new Image();image.src='/assets/milo-rounded.png';await image.decode();ctx.drawImage(image,300,250,480,480);await document.fonts.ready;
  ctx.fillStyle='#21334f';ctx.font='600 64px "Noto Sans KR", sans-serif';ctx.textAlign='center';const lines=[];for(const paragraph of text.split('\n')){let current='';for(const char of paragraph){if(ctx.measureText(current+char).width>850&&current){lines.push(current);current=char;}else current+=char;}lines.push(current);}
  let exportLines=lines;let size=64;while(exportLines.length*size*1.5>800&&size>32){size-=2;ctx.font=html`600 ${size}px "Noto Sans KR", sans-serif`;exportLines=[];for(const paragraph of text.split('\n')){let current='';for(const char of paragraph){if(ctx.measureText(current+char).width>850&&current){exportLines.push(current);current=char;}else current+=char;}exportLines.push(current);}}if(exportLines.length*size*1.5>800){toast(tr('줄바꿈을 조금 줄여 주세요. 문장 전체가 카드에 들어가도록 조정해요.'));return;}exportLines.forEach((line,i)=>ctx.fillText(line,540,870+i*size*1.5));ctx.font='400 30px "Noto Sans KR", sans-serif';ctx.fillStyle='#516581';ctx.fillText(tr('나의 속도로, Milo와 함께.'),540,1770);
  canvas.toBlob(blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=tr('Milo-나의-작은-성취.png');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(tr('나의 이야기 이미지를 저장했어요.'));},'image/png');
}
async function action(node) {
  const {action:a,route,kind,id,key,value}=node.dataset;
  if(await latestAction(node))return;
  if(a==='navigate')return navigate(route);
  if(a==='log'||a==='log-type')return showRecord(kind);
  if(a==='close-record')return $('#record-dialog').close();
  if(a==='close-info')return $('#info-dialog').close();
  if(a==='save-record'){if(node.disabled)return;node.disabled=true;try{return await saveRecord();}finally{node.disabled=false;}}
  if(a==='medication'){$('#log-medication').value=node.dataset.name;$('#log-dose').value='';$('#log-dose').focus();return;}
  if(a==='filter'){state.filter=node.dataset.filter;render();return;}
  if(a==='period'){state.period=Number(node.dataset.days);render();return;}
  if(a==='detail')return detail(id);
  if(a==='hello'){node.classList.remove('hello');void node.offsetWidth;node.classList.add('hello');return;}
  if(a==='preference'){state.preferences[key]=value;if(key==='language')$('#snackbar').hidden=true;savePreferences();return;}
  if(a==='reaction'){const m=state.messages[Number(node.dataset.index)];m.liked=!m.liked;persistConversation();render();return;}
  if(a==='new-chat'){if(state.busy){toast(tr('지금 준비 중인 답변을 받은 뒤 새 대화를 시작할 수 있어요.'));return;}if(state.composer.trim()){toast(tr('입력 중인 이야기를 먼저 보내거나 지워 주세요.'));return;}state.messages=[];persistConversation();render();return;}
  if(a==='connection')return info(tr('Milo와 대화하기'),html`<div class="form-stack"><p>보내는 메시지와 최근 대화의 일부가 Google Gemini로 전달되어 답변을 만들어요.</p><p>저장한 건강 기록은 대화에 자동으로 첨부하지 않아요. 보내고 싶은 내용만 직접 적어 주세요.</p><div class="privacy-callout">${icon('lock')}나의 기록은 현재 브라우저에 저장돼요. iOS 앱의 기록이나 다른 기기와 자동으로 연결되지 않아요.</div><p class="caption">${state.ai==='error'?tr('현재 대화 연결에 문제가 있어요. 직접 기록은 계속 사용할 수 있어요.'):tr('AI는 의료진을 대신하지 않아요. 처방이나 용량 변경은 담당 의료진과 상의해 주세요.')}</p></div>`);
  if(a==='delete-record'){const r=state.records.find(r=>r.id===id);if(!r)return;if(persistRecords(state.records.filter(r=>r.id!==id))){await $('#info-dialog').close();render();toast(tr('기록을 삭제했어요.'),tr('되돌리기'),()=>{if(persistRecords([...state.records,r]))render();});}return;}
  if(a==='export'){download(tr('Milo-나의-기록.json'),JSON.stringify({format:'milo-journal-v1',exportedAt:new Date().toISOString(),records:state.records},null,2),'application/json');toast(tr('기록 파일을 내보냈어요.'));return;}
  if(a==='clear-records')return info(tr('기록을 비울까요?'),html`<p>이 브라우저에 저장된 기록 ${state.records.length}건을 비워요. 필요한 기록은 먼저 파일로 내보내 주세요.</p>`,html`<md-text-button data-action="close-info">취소</md-text-button><md-filled-button data-action="confirm-clear">기록 비우기</md-filled-button>`);
  if(a==='confirm-clear'){const previous=[...state.records];if(persistRecords([])){await $('#info-dialog').close();render();toast(tr('기록을 비웠어요.'),tr('되돌리기'),()=>{if(persistRecords([...previous,...state.records]))render();});}return;}
  if(a==='download-visit'){const summary=visitSummary(state.records,state.period,new Date(),state.preferences.unit);download(tr('Milo-진료-준비.txt'),html`Milo 진료 준비\n${new Date().toLocaleDateString(locale())}\n\n${summary.lines.join('\n\n')}\n\n의료진에게 물어볼 질문\n${state.questions||tr('아직 작성하지 않음')}\n\n직접 남긴 사실을 정리한 기록입니다.`);toast(tr('진료 준비 내용을 저장했어요.'));return;}
  if(a==='print'){window.print();return;}
  if(a==='download-story')return downloadStory();
}
document.addEventListener('click',event=>{const node=event.composedPath().find(el=>el?.dataset?.action);if(node)Promise.resolve(action(node)).catch(error=>{console.error('Milo action failed',error.name);toast(tr('작업을 마치지 못했어요. 다시 시도해 주세요.'));});});
document.addEventListener('submit',event=>{if(event.target.id==='chat-form'){event.preventDefault();sendChat();}});
applyTheme();render();
if(storageError)toast('이 브라우저의 저장 공간을 읽지 못했어요. 기록 저장 상태를 확인해 주세요.');
fetch('/health').then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{state.ai=data.aiConfigured?'ready':'demo';if(state.route==='milo')render();}).catch(()=>{state.ai='error';if(state.route==='milo')render();});

function loadConversation() {
  const saved=load('milo.material.conversation.v1',{});
  const messages=Array.isArray(saved?.messages)?saved.messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-100):[];
  return {messages,composer:typeof saved?.composer==='string'?saved.composer.slice(0,8000):''};
}
function persistConversation() {
  try {localStorage.setItem('milo.material.conversation.v1',JSON.stringify({messages:state.messages.slice(-100),composer:state.composer}));}
  catch {toast(tr('대화를 이 브라우저에 보관하지 못했어요. 저장 공간을 확인해 주세요.'));}
}
function renderIntroduction() {
  const step=Math.max(0,Math.min(3,Number(state.preferences.introStep)||0));
  const pages=[
    [tr('안녕, 나는 Milo예요.'),tr('나의 속도로, 함께 걷는 친구'),tr('주사와 체중, 그리고 말로 다 담기 어려운 하루.\n작은 이야기부터 편하게 들려주세요.')],
    [tr('내 몸의 속도를 존중해요.'),tr('비교하지 않아도 괜찮아요'),tr('잘한 날도, 쉬어 가는 날도 나의 하루니까요.\n숫자보다 오늘의 나를 먼저 살펴요.')],
    [tr('매일의 작은 순간을 함께.'),tr('기억하고 싶은 만큼만'),tr('오늘의 대화는 이어 두고, 남기고 싶은 기록은\n내가 내용을 확인한 뒤에 저장해요.')],
    [tr('어떻게 불러드릴까요?'),tr('우리, 조금 더 편하게'),tr('이름이나 별명을 알려주세요.\n지금 정하지 않아도 괜찮아요.')]
  ];
  const [title,kicker,body]=pages[step];
  return html`<main id="main" class="introduction"><header class="intro-top"><div class="intro-brand">Milo<span>.</span></div><md-text-button data-action="intro-skip">나중에 할게요</md-text-button></header><div class="intro-body"><div class="intro-illustration"><img src="/assets/milo-rounded.png" alt="손을 흔들며 반기는 파란 Milo" width="260" height="260"></div><div class="intro-copy"><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${esc(body)}</p>${step===3?html`<md-outlined-text-field id="intro-name" label="이름 또는 별명 (선택)" maxlength="24" value="${esc(state.preferences.nameDraft||state.preferences.name)}" autocomplete="nickname" supporting-text="‘나’에서 언제든 바꿀 수 있어요."></md-outlined-text-field>`:''}</div></div><footer class="intro-footer"><div class="intro-progress" aria-label="소개 ${step+1} / 4">${pages.map((_,i)=>html`<span class="${i===step?'current':''}"></span>`).join('')}</div><div class="intro-controls">${step?html`<md-text-button data-action="intro-back">${mi('arrow_back')}이전</md-text-button>`:'<span></span>'}<md-filled-button data-action="${step===3?'intro-finish':'intro-next'}">${step===3?tr('Milo와 시작하기'):tr('다음')}${mi('arrow_forward')}</md-filled-button></div><p class="intro-privacy">${icon('lock')}시작하기 위해 건강 정보를 입력할 필요는 없어요.</p></footer></main>`;
}
function bindIntroduction() {
  $('#intro-name')?.addEventListener('input',event=>{
    state.preferences.nameDraft=event.target.value;
    try {localStorage.setItem(PREFS,JSON.stringify(state.preferences));}catch{storageError=true;}
  });
}
function meRow(label,description,symbol,action,route='') {
  return html`<button class="me-row" data-action="${action}" ${route?html`data-route="${route}"`:''}><span class="me-icon">${icon(symbol)}</span><span class="me-label"><b>${label}</b><small>${description}</small></span>${icon('chevron_right')}<md-ripple></md-ripple></button>`;
}
function renderMe() {
  const name=state.preferences.name;
  const plans=state.records.filter(r=>r.kind==='plan');
  const memories=Array.isArray(state.preferences.memories)?state.preferences.memories:[];
  return html`<div class="page-content me-page">${heading(name?html`${esc(name)}님의 Milo`:tr('나의 방식대로, Milo'),tr('편안하게 부를 이름부터, 나에게 맞는 앱 사용 방식까지.'),'A LITTLE MORE ME')}<section class="profile-panel"><img src="/assets/milo-rounded.png" alt="나의 친구 Milo" width="110" height="110"><div><h2>나는 이렇게 불러줘요</h2><p>이름은 선택이에요. 언제든 바꿀 수 있어요.</p><div class="name-editor"><md-outlined-text-field id="profile-name" label="이름 또는 별명" value="${esc(name)}" maxlength="24" autocomplete="nickname"></md-outlined-text-field><md-filled-tonal-button data-action="save-name">저장</md-filled-tonal-button></div></div></section><div class="me-columns"><section><h2 class="group-title">나와 함께하는 것들</h2><div class="me-group">${meRow(tr('나의 일정'),plans.length?html`직접 남긴 처방 계획 ${plans.length}건`:tr('안내받은 처방 계획을 남겨요'),'assignment','navigate','plan')}${meRow(tr('Milo가 알고 있는 것'),memories.length?html`내가 확인한 메모 ${memories.length}개`:tr('기억해 두고 싶은 나의 이야기'),'favorite','memories')}${meRow(tr('진료 준비'),tr('기록과 질문을 한곳에'),'clinical_notes','navigate','visit')}${meRow(tr('작은 성취 공유'),tr('내가 고른 문장으로 만드는 한 장'),'auto_awesome','navigate','story')}</div></section><section><h2 class="group-title">나에게 맞는 사용 방식</h2><div class="me-group">${meRow(tr('앱 사용 방식'),tr('화면 테마 · 색상 · 체중 단위'),'settings','navigate','settings')}${meRow(tr('알림'),tr('웹에서 가능한 알림 안내'),'notifications','reminders')}${meRow(tr('건강 정보'),tr('기기 건강 데이터 연결 상태'),'favorite_border','health-info')}${meRow(tr('AI 연결'),tr('Gemini와 대화 · 데이터 안내'),'chat_bubble','connection')}${meRow(tr('나의 데이터'),tr('내 기록을 내보내고 관리해요'),'lock','navigate','settings')}</div></section></div><p class="me-footnote">한국어 · 이 브라우저에 보관되는 나의 공간</p></div>`;
}
function renderHealth(embedded=false) {
  const weights=state.records.filter(r=>r.kind==='weight').sort((a,b)=>new Date(a.date)-new Date(b.date));
  const activities=withinDays(state.records,7).filter(r=>r.kind==='activity');
  const recent=weights.at(-1);
  return html`<div class="health-content">${embedded?'':back()+heading(tr('나의 건강도 한곳에서'),tr('직접 남긴 기록과 건강 데이터의 연결 상태를 구분해요.'),'MY HEALTH')}<div class="health-grid"><section class="surface-card"><div class="health-card-label">${icon('monitor_weight')}최근 체중 기록</div>${recent?html`<div class="health-value">${weightValue(recent.kg,state.preferences.unit)}<span>${state.preferences.unit}</span></div><p class="caption">${new Date(recent.date).toLocaleDateString(locale())} · 직접 입력한 측정값</p>`:html`<h2>아직 측정 기록이 없어요</h2><p class="muted">측정한 만큼만 기록해요.</p>`}<md-text-button data-action="log" data-kind="weight">체중 남기기${mi('add')}</md-text-button></section><section class="surface-card"><div class="health-card-label">${icon('directions_walk')}최근 일주일의 활동</div>${activities.length?html`<div class="health-value">${activities.length}<span>건</span></div><p class="caption">직접 남긴 활동 기록 · 걸음 수와는 달라요.</p>`:html`<h2>나의 움직임을 기다려요</h2><p class="muted">산책도 가벼운 스트레칭도 좋아요.</p>`}<md-text-button data-action="log" data-kind="activity">활동 남기기${mi('add')}</md-text-button></section></div><section class="health-connection"><span class="me-icon">${icon('favorite_border')}</span><div><h2>기기 건강 데이터</h2><p>현재 웹 앱에는 연결되어 있지 않아요. 걸음 수·수면·심박수는 기기에서 가져오지 않아요.</p></div><md-outlined-button data-action="health-info">연결 안내</md-outlined-button></section></div>`;
}
async function showMemories() {
  const memories=Array.isArray(state.preferences.memories)?state.preferences.memories:[];
  return info(tr('Milo가 알고 있는 것'),html`<p class="form-help">내가 직접 확인한 나의 이야기를 보관해요. 이 메모는 현재 브라우저에만 저장되며 AI 대화에 자동으로 보내지 않아요.</p>${memories.length?html`<ul class="memory-list">${memories.map((m,i)=>html`<li><span>${esc(m)}</span><md-icon-button data-action="delete-memory" data-index="${i}" aria-label="메모 ${i+1} 삭제">${mi('close')}</md-icon-button></li>`).join('')}</ul>`:tr('<p class="muted" style="margin-bottom:20px">아직 확인한 메모가 없어요.</p>')}<md-outlined-text-field id="memory-input" label="기억해 두고 싶은 이야기" type="textarea" rows="2" maxlength="300" supporting-text="예: 산책은 저녁 시간이 편해요."></md-outlined-text-field>`,html`<md-text-button data-action="close-info">닫기</md-text-button><md-filled-button data-action="save-memory">메모 저장</md-filled-button>`);
}
async function latestAction(node) {
  const a=node.dataset.action;
  if(await demoAction(node))return true;
  if(a.startsWith('intro-')){
    if(a==='intro-next')state.preferences.introStep=Math.min(3,state.preferences.introStep+1);
    if(a==='intro-back')state.preferences.introStep=Math.max(0,state.preferences.introStep-1);
    if(a==='intro-finish'||a==='intro-skip'){
      state.preferences.name=String(state.preferences.nameDraft||state.preferences.name||'').trim().slice(0,24);
      state.preferences.onboardingDone=true;
      state.route='milo';history.replaceState(null,'','#milo');
    }
    savePreferences();return true;
  }
  if(a==='save-name'){
    state.preferences.name=String($('#profile-name').value||'').trim().slice(0,24);if(savePreferences())toast(tr('부를 이름을 저장했어요.'));return true;
  }
  if(a==='memories'){await showMemories();return true;}
  if(a==='save-memory'){
    const text=String($('#memory-input').value||'').trim();
    if(!text){$('#memory-input').focus();toast(tr('저장할 이야기를 먼저 적어 주세요.'));return true;}
    if(!Array.isArray(state.preferences.memories))state.preferences.memories=[];
    state.preferences.memories.push(text.slice(0,300));if(savePreferences()){await $('#info-dialog').close();toast(tr('나의 메모를 저장했어요.'));}return true;
  }
  if(a==='delete-memory'){
    state.preferences.memories.splice(Number(node.dataset.index),1);savePreferences();await showMemories();return true;
  }
  if(a==='reminders'){
    await info(tr('나에게 맞는 알림'),html`<p>이 웹 앱은 브라우저가 닫혀 있을 때 주사 일정이나 생활 알림을 보내지 않아요.</p><p>의료진에게 안내받은 처방 계획은 ‘나의 일정’에서 직접 남기고 확인할 수 있어요. 정해진 시간의 알림이 필요하다면 기기의 캘린더나 알림 앱을 함께 이용해 주세요.</p>`);return true;
  }
  if(a==='health-info'){
    await info(tr('건강 데이터 연결 안내'),html`<p>현재 Cloud Run 웹 앱은 Apple 건강이나 Android Health Connect와 연결되어 있지 않아요.</p><p>기록 화면의 체중과 활동은 내가 직접 입력한 값이에요. iOS 앱에 저장한 기록과 건강 데이터는 이 브라우저로 자동 전송되지 않아요.</p>`);return true;
  }
  return false;
}

function ensureDemoMode(){
  if(typeof state.demoMode!=='boolean'){
    state.demoMode=state.realRecords.length===0;
    try{localStorage.setItem(DEMO_MODE,JSON.stringify(state.demoMode));}catch{storageError=true;}
  }
  if(state.demoMode&&!Array.isArray(state.demoRecords)){
    state.demoRecords=createDemoRecords();
    try{localStorage.setItem(DEMO_STORAGE,JSON.stringify(state.demoRecords));}catch{storageError=true;}
  }
}
function renderModeBanner(){
  return state.demoMode?html`<aside class="mode-banner demo-banner no-print" aria-label="데모 데이터 안내"><span class="mode-label">DEMO</span><div><b>30일 샘플 기록을 둘러보고 있어요</b><p>심사용 예시 데이터 · 실제 건강 기록과 별도로 보관돼요.</p></div><div class="mode-actions"><md-text-button data-action="navigate" data-route="report">리포트 보기</md-text-button><md-text-button data-action="toggle-demo">내 기록으로</md-text-button></div></aside>`:html`<aside class="mode-banner personal-banner no-print"><span class="mode-label">${tr('내 기록')}</span><p>현재 브라우저에 직접 남긴 기록이에요.</p><md-text-button data-action="toggle-demo">30일 데모 보기</md-text-button></aside>`;
}
function renderReport(){
  const r=buildReport(state.records,state.period);
  const unit=state.preferences.unit;
  const en=getLanguage()==='en';
  const title=en?`${state.period}-day report`:`나의 ${state.period}일 리포트`;
  const formatDate=date=>new Date(date).toLocaleDateString(locale(),{year:'numeric',month:'short',day:'numeric'});
  const value=kg=>kg===null?'—':`${weightValue(kg,unit)} ${unit}`;
  const delta=r.weightChange===null?'—':`${r.weightChange>0?'+':r.weightChange<0?'-':''}${weightValue(Math.abs(r.weightChange),unit)} ${unit}`;
  const stats=[[tr('체중 측정'),r.weights.length,tr('회')],[tr('실제 주사 기록'),r.injections.length,tr('회')],[tr('식사 기록'),r.meals.length,tr('건')],[tr('기록한 활동 시간'),r.knownDurations.length?r.activityMinutes:'—',tr('분')]];
  return html`<article class="page-content report-page">${back()}${heading(title,tr('남긴 기록을 바탕으로 정리한 기간 리포트예요.'),'MY REPORT',html`<div class="report-actions no-print"><md-outlined-button data-action="download-report">${mi('download')}CSV 저장</md-outlined-button><md-filled-button data-action="print">${mi('print')}인쇄 / PDF</md-filled-button></div>`)}<div class="report-source ${state.demoMode?'sample-source':''}"><b>${state.demoMode?tr('DEMO · 심사용 샘플 리포트'):tr('직접 입력한 기록의 리포트')}</b><p>${state.demoMode?tr('모든 수치와 이야기는 기능 시연을 위해 만든 가상 데이터입니다.'):tr('현재 브라우저에 저장한 기록만 사용했어요.')}</p></div>${periodControl()}${r.selected.length?html`<div class="report-period"><span>${formatDate(r.selected[0].date)} - ${formatDate(r.selected.at(-1).date)}</span><span>${tr('기록이 있는 날')}: ${r.recordedDays} / ${state.period}</span></div><section class="report-stats" aria-label="기간 기록 요약">${stats.map(([label,count,suffix])=>html`<div><span>${label}</span><strong>${count}<small>${suffix}</small></strong></div>`).join('')}</section><section class="surface-card report-weight"><div class="section-line"><h2>체중의 흐름</h2><span class="report-change">${delta}</span></div><div class="report-weight-values"><div><span>처음 측정</span><b>${value(r.firstWeight)}</b></div><div><span>최근 측정</span><b>${value(r.lastWeight)}</b></div></div>${chart(r.weights)}<p class="caption">처음과 마지막 측정값의 차이예요. 목표·예측·치료 효과를 판단하는 값은 아니에요.</p></section><div class="report-two-column"><section class="surface-card"><h2>기록된 일상</h2><div class="summary-row"><span>식사 기록</span><b>${r.meals.length}</b></div><div class="summary-row"><span>활동 기록</span><b>${r.activities.length}</b></div><div class="summary-row"><span>시간이 입력된 활동</span><b>${r.knownDurations.length}</b></div><div class="summary-row"><span>컨디션 기록</span><b>${r.checkins.length}</b></div></section><section class="surface-card"><h2>증상 기록의 상태</h2><div class="summary-row"><span>증상 내용 있음</span><b>${r.symptomNoted}</b></div><div class="summary-row"><span>‘없음’으로 기록</span><b>${r.symptomNone}</b></div><div class="summary-row"><span>증상 미기록</span><b>${r.symptomMissing}</b></div><p class="caption">기록하지 않은 증상을 ‘없음’으로 계산하지 않아요.</p></section></div><section class="surface-card injection-report"><h2>실제 주사 기록</h2>${r.injections.length?html`<div class="report-table-wrap"><table class="report-table"><thead><tr><th>날짜</th><th>약 이름</th><th>용량</th><th>투여 부위</th></tr></thead><tbody>${r.injections.map(record=>html`<tr><td>${formatDate(record.date)}</td><td>${esc(record.medication)}</td><td>${esc(record.dose)} mg</td><td>${esc(record.site?getLanguage()==='en'?tr(record.site):record.site:tr('미기록'))}</td></tr>`).join('')}</tbody></table></div>`:html`<p class="muted">이 기간에 남긴 주사 기록이 없어요.</p>`}<p class="caption">계획은 실제 주사 횟수에 포함하지 않아요. 약 이름과 용량은 기록 당시의 값이에요.</p></section><footer class="report-footer"><p>${tr('생성일')}: ${formatDate(new Date())}</p><p>${state.demoMode?tr('DEMO · 실제 건강 기록이 아닙니다.'):tr('공유 전에 기록과 기간을 확인해 주세요.')}</p><span>Milo · ${tr('나의 속도로, 함께.')}</span></footer>`:empty(tr('리포트로 정리할 기록이 없어요'),tr('기록을 남기거나 30일 데모를 열어 기능을 둘러보세요.'),'clinical_notes','weight')}</article>`;
}
async function demoAction(node){
  const a=node.dataset.action;
  if(a==='toggle-demo'){
    state.demoMode=!state.demoMode;ensureDemoMode();
    localStorage.setItem(DEMO_MODE,JSON.stringify(state.demoMode));
    render();toast(state.demoMode?tr('30일 샘플 기록을 열었어요. 실제 기록은 그대로 보관돼요.'):tr('내 기록으로 돌아왔어요. 샘플은 별도로 보관돼요.'));return true;
  }
  if(a==='reset-demo'){
    await info(tr('샘플을 다시 만들까요?'),html`<p>데모 기록만 오늘을 기준으로 새로 만들어요. 내 기록은 바뀌지 않아요.</p>`,html`<md-text-button data-action="close-info">취소</md-text-button><md-filled-button data-action="confirm-demo-reset">샘플 다시 만들기</md-filled-button>`);return true;
  }
  if(a==='confirm-demo-reset'){
    const previous=state.demoRecords;state.demoRecords=createDemoRecords();localStorage.setItem(DEMO_STORAGE,JSON.stringify(state.demoRecords));await $('#info-dialog').close();render();toast(tr('30일 샘플을 다시 만들었어요.'),tr('되돌리기'),()=>{state.demoRecords=previous;localStorage.setItem(DEMO_STORAGE,JSON.stringify(previous));render();});return true;
  }
  if(a==='download-report'){
    const r=buildReport(state.records,state.period);
    const cell=value=>{let text=String(value??'');if(/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
    const rows=[[tr('데이터 출처'),tr('날짜'),tr('기록 종류'),tr('기록 내용'),tr('세부 내용')],...r.selected.map(record=>[state.demoMode?'DEMO':'PERSONAL',record.date,tr(TYPES[record.kind].title),titleFor(record,state.preferences.unit),detailFor(record)])];
    download(`Milo-${state.demoMode?'demo':'personal'}-${state.period}-day-report.csv`,'\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8');toast(tr('리포트의 기록을 CSV로 저장했어요.'));return true;
  }
  return false;
}
