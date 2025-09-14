// Canvas (retina)
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');


// === Mobile helpers: fullscreen + orientation + touch behavior ===
canvas.style.touchAction = 'none';
document.documentElement.style.touchAction = 'none';

function preventNativeScroll(e){
  // allow scrolling only on inputs, if any
  if (e.target && e.target.closest('input,textarea,select,[contenteditable]')) return;
  e.preventDefault();
}
document.addEventListener('touchmove', preventNativeScroll, {passive:false});
document.addEventListener('gesturestart', (e)=>e.preventDefault(), {passive:false});
document.addEventListener('dblclick', (e)=>e.preventDefault(), {passive:false});

function updateOrientationClass(){
  const portrait = window.matchMedia('(orientation: portrait)').matches;
  document.body.classList.toggle('portrait', portrait);
}
addEventListener('orientationchange', ()=>{ updateOrientationClass(); fitCanvas(); });
addEventListener('resize', ()=>{ updateOrientationClass(); fitCanvas(); });
if (window.visualViewport) visualViewport.addEventListener('resize', ()=>{ updateOrientationClass(); fitCanvas(); });

async function requestFullscreenLandscape(){
  try{
    const el = document.documentElement; // fallback to root
    if (!document.fullscreenElement && el.requestFullscreen) {
      await el.requestFullscreen({ navigationUI: 'hide' });
    }
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape').catch(()=>{});
    }
  }catch(_){}
}
async function exitFullscreenIfNeeded(){
  try{
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  }catch(_){}
}
updateOrientationClass();

// --- Eye overlay (drugi canvas tylko na oczy) ---

// === Mobile helpers: fullscreen + orientation + touch behavior ===
canvas.style.touchAction = 'none';
document.documentElement.style.touchAction = 'none';

function preventNativeScroll(e){
  // allow scrolling only on inputs, if any
  if (e.target && e.target.closest('input,textarea,select,[contenteditable]')) return;
  e.preventDefault();
}
document.addEventListener('touchmove', preventNativeScroll, {passive:false});
document.addEventListener('gesturestart', (e)=>e.preventDefault(), {passive:false});
document.addEventListener('dblclick', (e)=>e.preventDefault(), {passive:false});

function updateOrientationClass(){
  const portrait = window.matchMedia('(orientation: portrait)').matches;
  document.body.classList.toggle('portrait', portrait);
}
addEventListener('orientationchange', ()=>{ updateOrientationClass(); fitCanvas(); });
addEventListener('resize', ()=>{ updateOrientationClass(); fitCanvas(); });
if (window.visualViewport) visualViewport.addEventListener('resize', ()=>{ updateOrientationClass(); fitCanvas(); });

async function requestFullscreenLandscape(){
  try{
    const el = document.documentElement; // fallback to root
    if (!document.fullscreenElement && el.requestFullscreen) {
      await el.requestFullscreen({ navigationUI: 'hide' });
    }
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape').catch(()=>{});
    }
  }catch(_){}
}
async function exitFullscreenIfNeeded(){
  try{
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  }catch(_){}
}
updateOrientationClass();

// --- Eye overlay (drugi canvas tylko na oczy) ---
const eyeLayer = document.createElement('canvas');
const eyeCtx   = eyeLayer.getContext('2d', { alpha: true });
(function attachEyeLayer(){
  const parent = canvas.parentElement || document.body;
  if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
  eyeLayer.style.position = 'absolute';
  eyeLayer.style.pointerEvents = 'none';
  eyeLayer.style.zIndex = '1002';
  eyeLayer.style.mixBlendMode = 'normal'; // <— ważne: zero miksowania z tłem
  parent.appendChild(eyeLayer);
})();
function sizeAndPlaceEyeLayer(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const r   = canvas.getBoundingClientRect();
  const pr  = (canvas.parentElement || document.body).getBoundingClientRect();
  // ustaw overlay dokładnie nad canvasem (pozycja + rozmiar)
  eyeLayer.style.left   = (r.left - pr.left) + 'px';
  eyeLayer.style.top    = (r.top  - pr.top ) + 'px';
  eyeLayer.style.width  = r.width  + 'px';
  eyeLayer.style.height = r.height + 'px';
  eyeLayer.width  = Math.max(1, Math.round(r.width  * dpr));
  eyeLayer.height = Math.max(1, Math.round(r.height * dpr));
  eyeCtx.setTransform(dpr,0,0,dpr,0,0);
  eyeCtx.imageSmoothingEnabled = true;
}
function fitCanvas(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  let cssW, cssH;
  if (document.body.classList.contains('minigame')){
    const vv = window.visualViewport;
    cssW = Math.round((vv ? vv.width : window.innerWidth));
    cssH = Math.round((vv ? vv.height : window.innerHeight));
  } else {
    cssW = canvas.clientWidth;
    const ratio = canvas.height && canvas.width ? (canvas.height/canvas.width) : (150/300);
    cssH = Math.round(cssW * ratio);
  }
  canvas.width  = Math.max(1, Math.round(cssW * dpr));
  canvas.height = Math.max(1, Math.round(cssH * dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);
  sizeAndPlaceEyeLayer();
}
addEventListener('resize', fitCanvas);
if (window.visualViewport) visualViewport.addEventListener('resize', fitCanvas);
fitCanvas();
function setEyeLayerVisible(show){
  eyeLayer.style.display = show ? '' : 'none';
}
// UI
const feedBtn  = document.getElementById('feed');
const sleepBtn = document.getElementById('sleep');
const wakeBtn  = document.getElementById('wake');
const bathBtn  = document.getElementById('bath');
const resetBtn = document.getElementById('reset');

// Stat bars
const glodekFill  = document.getElementById('glodekFill');
const humorekFill = document.getElementById('humorekFill');
const spankoFill  = document.getElementById('spankoFill');
const kapuFill    = document.getElementById('kapuFill');

// Modal + imię/kolor
const introModal = document.getElementById('introModal');
const nameInput  = document.getElementById('nameInput');
const nameBadge  = document.getElementById('nameBadge');
const modalSave  = document.getElementById('modalSave');
const colorButtons = Array.from(document.querySelectorAll('.color-option'));

// ===== State (anim) =====
let t = 0, last = performance.now();
let frameDt = 0;
let sleeping = false;
let eyeOpen = 1, eyeVel = 0, nextBlinkAt = 1 + Math.random()*2.5;
let eatTimer = 0, snackProg = 0, chewPhase = 0;
let petTimer = 0;
const hearts = [];

// Tryb kąpieli (gąbka)
let bathMode = false;
let spongePointerId = null;
const sponge = { x: null, y: null, active: false };

// Mizianie – aktywny palec/mysz
let petPointerId = null;
let petActive = false;

// Otoczenie (tła)
let env = 'ocean'; // 'ocean' | 'jaskinia' | 'polana' | 'chmury'

// Brud — frakcja zsynchronizowana z paskiem
const MAX_DIRT = 120;
let dirtSeeds = [];

// ===== Dzień / noc =====
const NIGHT_START = 21; // 21:00
const DAY_START   = 8;  // 08:00
const NIGHT_MOOD_DROP  = 0.60; // spadek humorku / s tylko, gdy obudzony w nocy i NIE śpi

// Nocny override: obudzony w nocy do końca danej nocy (po kliknięciu „Obudź”)
let night = { overrideAwake: false, key: null };

// ===== Wskaźnik miłości (bazowy + minigry) =====
let love = { percent: 0, lastIncrementAt: 0, lastResetAt: 0 };
let dayActions = { key: dayKey(new Date()), feed: 0, pet: false, counted: false };

// Blokady miłości po przegranej (24h) i „raz dziennie” per minigra
let loveLocks = { sky:0, cave:0, meadow:0, bubbles:0 }; // timestamp do kiedy blokada
let dailyWin = { sky:'', cave:'', meadow:'', bubbles:'' }; // dayKey ostatniej nagrody

// ===== Mini-gry (tryb, stan) =====
let mode = 'home'; // 'home' | 'game'
let game = null;   // obiekt stanu aktualnej mini-gry

// Po-grze: komunikat na scenie głównej
let postMsg = null; // {text, btn, rect}

// DOM sloty / overlay
let petNameSlot = null;       // slot na imię w panelu statystyk
let namePlaceholderEl = null; // element w logo (#logoName)
let pageOverlay = null;       // blokada i blur reszty strony

// DOM-owy badge z imieniem ma znikać w minigrach
function hideNameBadge(hide){
  if(!nameBadge) return;
  nameBadge.style.display = hide ? 'none' : '';
}

// Player / zapis
const SAVE_KEY = 'axolotl-save-v1';
const DEFAULT_STATS = { glodek: 0, humorek: 100, spanko: 100, kapuKapu: 1 }; // start: 0/100/100/0
const DEFAULT_PLAYER = { name: null, color: 'pink' };
let stats = { ...DEFAULT_STATS };
let player = { ...DEFAULT_PLAYER };
const clamp = (x,a=0,b=100)=>Math.max(a,Math.min(b,x));

// Palety kolorów
const PALETTES = {
  pink:   { body:'#fff1f8', belly:'#fff9fe', frill:'#ffb6cf', blush:'#ffc2d7', tongue:'#ff9fc5' },
  blue:   { body:'#e7f3ff', belly:'#f4faff', frill:'#9fd3ff', blush:'#b9e0ff', tongue:'#b5c9ff' },
  yellow: { body:'#fff6cf', belly:'#fff9df', frill:'#ffd782', blush:'#ffe09a', tongue:'#ffc47a' }
};

// Tempa zmian
const RATES = {
  glodekPerSec:       0.02,
  spankoUpSec:        0.04,
  spankoDnSec:        0.02,
  humorekPetSec:      0.60,   // tylko w dzień
  kapuUpSec:          0.015,
  humorekDnSec: 0.015
};

// Spadek humorku przez brud
const DIRTY_THRESHOLD = 75;      // próg 75%
const DIRTY_MOOD_DROP = 0.05;    // spadek humorku / s gdy próg przekroczony

let lastSavedAt = Date.now();

// FORCE FIRST RUN (fallback iOS PWA)
const FORCE_FLAG = 'axolotl-force-first-run';
const forcedFirstRun = sessionStorage.getItem(FORCE_FLAG) === '1';
if (forcedFirstRun) {
  try{ localStorage.clear(); }catch{}
  stats  = { ...DEFAULT_STATS };
  player = { ...DEFAULT_PLAYER };
}

// ======= Helpers czasu / dnia =======
function pad2(n){ return n<10 ? '0'+n : ''+n; }
function dayKey(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function prevDayKey(d){
  const x = new Date(d.getTime());
  x.setDate(x.getDate()-1);
  return dayKey(x);
}
function isNightNow(d=new Date()){
  const h = d.getHours();
  return (h >= NIGHT_START) || (h < DAY_START);
}
// klucz nocy: 21:00..23:59 -> dziś; 00:00..07:59 -> wczoraj
function nightKeyForDate(d=new Date()){
  const h = d.getHours();
  return (h >= NIGHT_START) ? dayKey(d)
       : (h < DAY_START)    ? prevDayKey(d)
       : null;
}
function nightOverrideActive(d=new Date()){
  const k = nightKeyForDate(d);
  return !!(night.overrideAwake && night.key && k && night.key === k);
}

// ===== Zapis/odczyt =====
function saveState(){
  try{
    const now = Date.now();
    const payload = {
      v:11, sleeping, stats, player, env, savedAt: now,
      night, love, dayActions,
      loveLocks, dailyWin
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    lastSavedAt = now;
  }catch{}
}
function applyProgress(dtSec, { sleeping: wasSleeping=false, petting=false } = {}){
  if (dtSec <= 0 || !isFinite(dtSec)) return;

  // dzien/noc – modyfikatory
  const nightNow  = isNightNow();
  const awakeAtNight = nightNow && nightOverrideActive() && !wasSleeping; // tylko gdy obudzony i nie śpi

  // głodek/spanko standardowo
  stats.glodek = clamp(stats.glodek + RATES.glodekPerSec * dtSec);
  const dSpanko = wasSleeping ? RATES.spankoUpSec : -RATES.spankoDnSec;
  stats.spanko = clamp(stats.spanko + dSpanko * dtSec);

  // MIZIANIE: w nocy nie wpływa na humorek; w dzień tak
  const allowPetMood = !nightNow; // tylko w dzień
  if (petting && allowPetMood){
    stats.humorek = clamp(stats.humorek + (RATES.humorekPetSec) * dtSec);
  }

  // nocny spadek humorku TYLKO gdy obudzony w nocy i NIE śpi
  if (awakeAtNight) stats.humorek = clamp(stats.humorek - NIGHT_MOOD_DROP * dtSec);

  // spadek humorku przez brud >= 75%
  if (stats.kapuKapu >= DIRTY_THRESHOLD) {
    stats.humorek = clamp(stats.humorek - DIRTY_MOOD_DROP * dtSec);
  }

  // brud rośnie
  stats.kapuKapu = clamp(stats.kapuKapu + RATES.kapuUpSec * dtSec);
  // bazowy spadek humorku w czasie, gdy nie śpi
if (!wasSleeping) {
  stats.humorek = clamp(stats.humorek - RATES.humorekDnSec * dtSec);
}

}
function loadState(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) { lastSavedAt = Date.now(); return; }
    const data = JSON.parse(raw);
    if(typeof data.sleeping === 'boolean') sleeping = data.sleeping;

    const s = { ...DEFAULT_STATS, ...(data.stats||{}) };
    if('hunger' in s && !('glodek' in s))   s.glodek   = s.hunger;
    if('energy' in s && !('spanko' in s))   s.spanko   = s.energy;
    if('mood'   in s && !('humorek' in s))  s.humorek  = s.mood;
    if(!('kapuKapu' in s))                  s.kapuKapu = DEFAULT_STATS.kapuKapu;
    stats = {
      glodek:  clamp(s.glodek),
      humorek: clamp(s.humorek),
      spanko:  clamp(s.spanko),
      kapuKapu:clamp(s.kapuKapu)
    };

    player = { ...DEFAULT_PLAYER, ...(data.player||{}) };
    if(!player.color) player.color = 'pink';
    env = data.env || 'ocean';

    night = { overrideAwake:false, key:null, ...(data.night||{}) };
    love  = { percent:0, lastIncrementAt:0, lastResetAt:0, ...(data.love||{}) };
    dayActions = { key: dayKey(new Date()), feed:0, pet:false, counted:false, ...(data.dayActions||{}) };

    loveLocks = { sky:0, cave:0, meadow:0, bubbles:0, ...(data.loveLocks||{}) };
    dailyWin  = { sky:'', cave:'', meadow:'', bubbles:'', ...(data.dailyWin||{}) };

    const then = Number(data.savedAt)||Date.now();
    const now  = Date.now();
    const deltaSec = Math.max(0, (now - then) / 1000);
    applyProgress(deltaSec, { sleeping });
    lastSavedAt = now;
    saveState();
  }catch{
    lastSavedAt = Date.now();
  }
}

// ====== UI ======
function setButtonsEnabled(enabled){
  const disabled = !enabled || mode==='game' || !!postMsg; // <- zablokuj przyciski przy komunikatach
  // Nakarm: aktywny tylko >=75% głodka i nie w śnie
  feedBtn.disabled  = disabled || sleeping || !(stats.glodek >= 75);
  sleepBtn.disabled = disabled || sleeping;
  wakeBtn.disabled  = disabled || !sleeping;
  // Kąpiel: jeśli JUŻ jesteśmy w kąpieli -> zawsze można zakończyć,
  // jeśli nie — aktywna tylko powyżej 75%
  bathBtn.disabled  = disabled || (!bathMode && !(stats.kapuKapu > 75));
}

function ensurePetNameSlot(){
  if (petNameSlot) return;
  // znajdź kontener statystyk na podstawie jednego z pasków
  const anchor = humorekFill || glodekFill || spankoFill || kapuFill;
  const panel = anchor ? (anchor.closest('.stats') || anchor.parentElement?.parentElement) : null;
  if (!panel) return;
  petNameSlot = document.createElement('div');
  petNameSlot.id = 'petNameSlot';
  petNameSlot.style.margin = '6px 0 4px';
  petNameSlot.style.font = '600 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
  petNameSlot.style.textAlign = 'center';
  panel.insertBefore(petNameSlot, panel.firstChild);
}

// === ZMIANA: szukamy / tworzymy #logoName w .logo (bez skanowania „Aksolotek”) ===
function findNamePlaceholder(){
  if (namePlaceholderEl) return;
  // 1) dedykowany slot w logo
  namePlaceholderEl = document.querySelector('#logoName');
  if (!namePlaceholderEl){
    const logo = document.querySelector('.logo');
    if (logo){
      let span = logo.querySelector('#logoName');
      if (!span){
        span = document.createElement('span');
        span.id = 'logoName';
        logo.appendChild(span);
      }
      namePlaceholderEl = span;
    }
  }
}

function setPageOverlay(on){
  if (on){
    if (!pageOverlay){
      pageOverlay = document.createElement('div');
      pageOverlay.style.position = 'fixed';
      pageOverlay.style.inset = '0';
      pageOverlay.style.zIndex = '900';
      pageOverlay.style.background = 'rgba(0,0,0,0.25)';
      pageOverlay.style.backdropFilter = 'blur(3px)';
      pageOverlay.style.pointerEvents = 'auto';
    }
    if (!pageOverlay.isConnected) document.body.appendChild(pageOverlay);
    // upewnij się, że canvas jest nad overlayem
    canvas.style.position = 'relative';
    canvas.style.zIndex = '1001';
  }else{
    if (pageOverlay?.isConnected) pageOverlay.remove();
  }
}

function syncUIFromState(){
  const ready = Boolean(player.name);
  setButtonsEnabled(ready);
  if(ready){
    if(sleeping){ sleepBtn.disabled=true; wakeBtn.disabled=false; eyeOpen=0; eyeVel=0; }
    else { sleepBtn.disabled=false; wakeBtn.disabled=true; }
  }
  bathBtn.textContent = bathMode ? 'Zakończ kąpiel' : 'Kąpiel 🛁';

  // podświetlenie wybranego otoczenia
  document.querySelectorAll('[data-env]').forEach(btn=>{
    const on = btn.dataset.env===env;
    btn.setAttribute('aria-pressed', on ? 'true':'false');
    btn.classList.toggle('selected', on);
  });

  // imię znika w minigrach
  hideNameBadge(mode==='game');
}
function pct(v){ return `${(Math.round(v*10)/10).toFixed(1)}%`; } // 1 miejsce po przecinku
function updateStatsUI(){
  if(glodekFill)  glodekFill.style.width  = pct(stats.glodek);
  if(humorekFill) humorekFill.style.width = pct(stats.humorek);
  if(spankoFill)  spankoFill.style.width  = pct(stats.spanko);
  if(kapuFill)    kapuFill.style.width    = pct(stats.kapuKapu);
}

// === ZMIANA: imię w logo, bez duplikatu nad statami, bez „Aksolotek” ===
function updateNameBadge(){
  // chowamy istniejący badge przy canvasie
  if (nameBadge) nameBadge.style.display = 'none';

  ensurePetNameSlot();
  findNamePlaceholder();

  const show = !!player.name && mode!=='game';
  const txtLogo  = player.name ? `${player.name}` : '';
  const txtPanel = player.name ? `★ ${player.name}` : '';

  if (namePlaceholderEl){
    namePlaceholderEl.textContent = show ? txtLogo : '';
    // jeżeli mamy slot w logo, nie wyświetlaj nad statami
    if (petNameSlot){ petNameSlot.style.display = 'none'; }
  } else if (petNameSlot){
    // Fallback: brak slotu w logo — pokaż nad statami
    petNameSlot.style.display = show ? '' : 'none';
    petNameSlot.textContent = show ? txtPanel : '';
  }
}
loadState();
syncUIFromState();
updateStatsUI();
updateNameBadge();

// Pierwsze uruchomienie: modal imię + kolor
let chosenColor = player.color || 'pink';
function openIntroIfNeeded(){
  if(player.name) return;
  introModal.classList.add('show');
  nameInput.placeholder = '';
  modalSave.disabled = true;
  nameInput.value = '';
  const validate = ()=>{ modalSave.disabled = nameInput.value.trim().length === 0; };
  nameInput.addEventListener('input', validate);
  validate();

  colorButtons.forEach(btn=>{
    const c = btn.getAttribute('data-color');
    btn.classList.toggle('selected', c === chosenColor);
    btn.onclick = ()=>{
      chosenColor = c;
      colorButtons.forEach(b=>b.classList.toggle('selected', b===btn));
    };
  });

  nameInput.focus();
}
modalSave.onclick = ()=>{
  const nm = nameInput.value.trim();
  if(!nm) return; // bezpiecznik
  player.name = nm;
  player.color = chosenColor || 'pink';
  saveState();
  updateNameBadge();
  introModal.classList.remove('show');
  syncUIFromState();
};

// Jeśli wymuszono „first run”, pokaż modal i WTEDY wyczyść sessionStorage
if (forcedFirstRun) {
  openIntroIfNeeded();
  try { sessionStorage.clear(); } catch{}
} else {
  openIntroIfNeeded();
}

// ====== Otoczenie: UI ======
function setEnvironment(e){
  const v = (typeof e === 'string') ? e : (e?.target?.dataset?.env);
  if(!v) return;
  env = v;
  saveState();
  syncUIFromState();
}
// jeżeli w HTML nie ma przycisków otoczenia — dobuduj
(function ensureEnvPanel(){
  const centerPanel = (el)=>{
    if(!el) return;
    el.classList.add('env-panel');
    el.style.display = 'flex';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.style.gap = '8px';
    el.style.width = '100%';
    el.style.margin = '6px 0';
  };

  const existing = document.querySelectorAll('[data-env]');
  if(existing.length>0){
    existing.forEach(btn=>btn.addEventListener('click', setEnvironment));
    centerPanel(document.querySelector('.env-panel') || existing[0]?.parentElement);
  }else{
    const wrap = document.querySelector('.wrap') || document.body;
    const panel = document.createElement('div');
    panel.className = 'panel env-panel';
    panel.innerHTML = `
      <span style="opacity:.85;color:#cbd5e1">Otoczenie:</span>
      <button data-env="ocean">🌊 Ocean</button>
      <button data-env="jaskinia">🪨 Jaskinia</button>
      <button data-env="polana">🌿 Polana</button>
      <button data-env="chmury">☁️ Chmury</button>
    `;
    wrap.appendChild(panel);
    panel.querySelectorAll('button[data-env]').forEach(btn=>{
      btn.addEventListener('click', setEnvironment);
    });
    centerPanel(panel);
  }
})();

// ===== Dzień/noc – egzekwowanie =====
function enforceDayNight(){
  const nightNow = isNightNow();
  if(nightNow){
    if(!nightOverrideActive()){
      if (!sleeping){ sleeping = true; syncUIFromState(); }
    }
  }else{
    if(night.overrideAwake){
      night.overrideAwake = false;
      night.key = null;
    }
  }
}

// ===== Wskaźnik miłości – logika (bazowa) =====
function ensureDayWindow(){
  const k = dayKey(new Date());
  if(dayActions.key !== k){
    dayActions.key = k;
    dayActions.feed = 0;
    dayActions.pet  = false;
    dayActions.counted = false;
  }
}
function tryAwardLoveBase(){
  ensureDayWindow();
  if(!dayActions.counted && dayActions.feed >= 5 && dayActions.pet){
    love.percent = clamp(love.percent + 0.5, 0, 100);
    love.lastIncrementAt = Date.now();
    dayActions.counted = true;
    saveState();
  }
}
// — dodatkowe przyrosty z minigier: raz dziennie na dany typ i brak przyrostu przy blokadzie 24h po porażce
function canAddLoveForGame(type){
  const now = Date.now();
  if(loveLocks[type] && now < loveLocks[type]) return false;
  const k = dayKey(new Date());
  return dailyWin[type] !== k;
}
function addLoveForGame(type){
  if(!canAddLoveForGame(type)) return false;
  love.percent = clamp(love.percent + 0.5, 0, 100);
  love.lastIncrementAt = Date.now();
  dailyWin[type] = dayKey(new Date());
  saveState();
  return true;
}
function lockLoveForGame(type){
  loveLocks[type] = Date.now() + 24*3600*1000;
  saveState();
}
function maybeResetLove(){
  if(love.percent <= 0) return;
  const now = Date.now();
  if(love.lastIncrementAt === 0) return;
  if(now - love.lastIncrementAt >= 24*3600*1000 && !dayActions.counted){
    if(now - (love.lastResetAt||0) > 30000){
      love.percent = 0;
      love.lastResetAt = now;
      saveState();
    }
  }
}

// Interactions
function getCanvasPos(e){
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function pointInRect(x,y, r){ return x>=r.x && x<=r.x+r.w && y>=r.y && y<=r.y+r.h; }

// hit-testy
function insideEllipse(px, py, cx, cy, rx, ry){
  const dx = (px - cx) / rx, dy = (py - cy) / ry;
  return dx*dx + dy*dy <= 1;
}
function isOverAxolotl(x, y){
  const r = canvas.getBoundingClientRect();
  const W = r.width, H = r.height;
  const S = Math.min(W,H)*0.46;
  const cx = W/2;
  const headY = H*0.40;
  const bodyY = H*0.63;
  const bodyRx = S*0.36;
  const breath = Math.sin(t*2*(sleeping?0.5:1));
  const bodyRy = S*0.56*(1+breath*0.02);
  const headRx = S*0.50, headRy = S*0.36;
  return insideEllipse(x, y, cx, bodyY, bodyRx, bodyRy) || insideEllipse(x, y, cx, headY, headRx, headRy);
}

// --- CZYSZCZENIE ---
function cleanAtPoint(x, y, amount=1){
  if(!isOverAxolotl(x,y)) return;
  // w trybie kąpieli czyścimy tylko do 40% (nie mniej)
  if(bathMode){
    stats.kapuKapu = Math.max(40, clamp(stats.kapuKapu - amount));
  }else{
    stats.kapuKapu = clamp(stats.kapuKapu - amount);
  }
  updateStatsUI();
  syncUIFromState();
  saveState();
}

// === HEARTS ===
function startPettingAt(x,y){
  petTimer = 0.7;
  for(let i=0;i<3;i++){
    const hx = x + (Math.random()*20-10);
    const hy = y + (Math.random()*10-5);
    hearts.push({x: hx, y: hy, vx:(Math.random()*0.4-0.2), vy:-(0.8+Math.random()*0.6), life:1});
  }
  // zalicz mizianie (dla miłości bazowej) – niezależnie od pory
  dayActions.pet = true;
  tryAwardLoveBase();
}

// ====== HOME: przycisk mini-gry w prawym dolnym rogu (zależnie od tła) ======
let homeMiniBtn = null; // {x,y,w,h,type,label}
function homeMiniButtonMeta(){
  switch(env){
    case 'chmury':  return {type:'sky',    label:'Chmureczki Skakaneczki', emoji:'☁️'};
    case 'jaskinia':return {type:'cave',   label:'Jaskiniowa Ucieczka',    emoji:'🪨'};
    case 'polana':  return {type:'meadow', label:'Motylkowi Przyjaciele',  emoji:'🦋'};
    case 'ocean':
    default:        return {type:'bubbles',label:'Bąbeleczki',             emoji:'🫧'};
  }
}
function drawHomeMiniButton(W,H){
  if(!player.name || mode!=='home') { homeMiniBtn=null; return; }
  const meta = homeMiniButtonMeta();
  ctx.save();
  ctx.font='bold 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
  const txtW = ctx.measureText(`${meta.emoji}  ${meta.label}`).width;
  const pad = 12, bw = Math.min(12+txtW+12, Math.max(160, txtW+40));
  const bh = 40;
  const x = W - bw - pad;
  const y = H - bh - pad;
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = 'rgba(15,23,42,0.65)';
  if(ctx.roundRect) ctx.roundRect(x,y,bw,bh,12);
  else { ctx.fillRect(x,y,bw,bh); }
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle='#fff';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(`${meta.emoji}  ${meta.label}`, x+bw/2, y+bh/2);
  ctx.restore();
  homeMiniBtn = {x,y,w:bw,h:bh,type:meta.type,label:meta.label};
}

// ====== MOUSE/TOUCH HOME & GAME ======
canvas.addEventListener('pointerdown', (e)=>{
  e.preventDefault();
  const p = getCanvasPos(e);

  // Post-Game komunikat — tylko przycisk „Wyjdź” działa
  if(mode==='home' && postMsg){
    if(postMsg.rect && pointInRect(p.x,p.y, postMsg.rect)){
      postMsg = null;
      setPageOverlay(false); // odblokuj stronę
      syncUIFromState();
      setEyeLayerVisible(true);
    }
    // blokuj inne interakcje podczas komunikatu
    return;
  }

  if(mode==='game'){ gamePointerDown(e); return; }

  if(!player.name) return;
  canvas.setPointerCapture(e.pointerId);

  // Klik przycisku mini-gry na tle (prawy-dolny)
  if(homeMiniBtn && pointInRect(p.x,p.y,homeMiniBtn)){
    enterMiniGame(homeMiniBtn.type);
    return;
  }

  if(bathMode){
    sponge.x = p.x; sponge.y = p.y;
    sponge.active = true;
    spongePointerId = e.pointerId;
    cleanAtPoint(p.x, p.y, 2.5);
    return;
  }

  if(isOverAxolotl(p.x, p.y)){
    petActive = true;
    petPointerId = e.pointerId;
    startPettingAt(p.x, p.y);
  }
});
canvas.addEventListener('pointermove', (e)=>{
  e.preventDefault();
  if(mode==='game'){ gamePointerMove(e); return; }
  if(!player.name) return;
  const p = getCanvasPos(e);

  if(bathMode){
    if(spongePointerId !== e.pointerId || !sponge.active) return;
    sponge.x = p.x; sponge.y = p.y;
    cleanAtPoint(p.x, p.y, 0.5);
    return;
  }

  if(petActive && petPointerId === e.pointerId && isOverAxolotl(p.x, p.y)){
    startPettingAt(p.x, p.y);
  }
});
function endPetting(e){
  if(mode==='game'){ gamePointerUp(e); return; }
  if(petActive && petPointerId === e.pointerId){
    petActive = false;
    petPointerId = null;
  }
}
canvas.addEventListener('pointerup', endPetting);
canvas.addEventListener('pointercancel', endPetting);
canvas.addEventListener('pointerout', (e)=>{ if(mode!=='game' && !bathMode) endPetting(e); });

// ====== Przyciski główne ======
feedBtn.onclick = ()=>{
  if(!player.name) return;
  if(sleeping) return;
  if(!(stats.glodek >= 75)) return;
  if(eatTimer>0) return;
  eatTimer=1.2; snackProg=0; chewPhase=0;
  // Nakarm: -30%
  stats.glodek  = clamp(stats.glodek - 30);
  ensureDayWindow();
  dayActions.feed = (dayActions.feed||0) + 1;
  tryAwardLoveBase();
  saveState(); updateStatsUI(); syncUIFromState();
};
sleepBtn.onclick = ()=>{
  if(!player.name) return;
  sleeping=true; syncUIFromState(); saveState();
};
wakeBtn.onclick = ()=>{
  if(!player.name) return;
  if(isNightNow()){
    night.overrideAwake = true;
    night.key = nightKeyForDate();
  }
  sleeping=false; eyeOpen=1; eyeVel=0;
  nextBlinkAt = t + 1 + Math.random()*2.5;
  syncUIFromState(); saveState();
};
bathBtn.onclick = ()=>{
  if(!player.name) return;
  // Wejście do kąpieli – tylko jeśli >75%; wyjście – zawsze wolno
  if(!bathMode && !(stats.kapuKapu>75)) return;
  bathMode = !bathMode;
  if(bathMode){
    const r = canvas.getBoundingClientRect();
    sponge.x = r.width * 0.82;
    sponge.y = r.height * 0.80;
    sponge.active = false;
  }else{
    sponge.active = false;
    spongePointerId = null;
  }
  syncUIFromState();
};

// RESET — 100% first-run po kliknięciu
resetBtn.onclick = async ()=>{
  resetBtn.disabled = true;
  try { sessionStorage.setItem(FORCE_FLAG, '1'); } catch {}

  try{
    try{ localStorage.clear(); }catch{}
    if ('caches' in window) {
      try{
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }catch{}
    }
    if (window.indexedDB && indexedDB.databases) {
      try{
        const dbs = await indexedDB.databases();
        await Promise.all((dbs||[]).map(db=> new Promise(res=>{
          try{
            const req = indexedDB.deleteDatabase(db.name);
            req.onsuccess = req.onerror = req.onblocked = ()=>res();
          }catch{ res(); }
        })));
      }catch{}
    }
    if ('serviceWorker' in navigator) {
      try{
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }catch{}
    }
  }finally{
    const url = new URL(location.href);
    url.searchParams.set('reset', Date.now().toString());
    location.replace(url.toString());
  }
};

// Helpers rysunku
function ellipseFill(x,y,rx,ry){ ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill(); }
function heart(x,y,a=8){
  ctx.save(); ctx.translate(x,y); ctx.fillStyle='#ff6b6b';
  ctx.beginPath(); ctx.moveTo(0,0);
  ctx.bezierCurveTo(-a,-a, -2*a, a*0.3, 0, a*1.6);
  ctx.bezierCurveTo(2*a, a*0.3, a,-a, 0,0);
  ctx.fill(); ctx.restore();
}

// --- OCZY: rysowanie na overlay (poza głównym canvasem)
function drawEyesOverlay(cx, headY, S, p){
  eyeCtx.clearRect(0,0, eyeLayer.width, eyeLayer.height);

  const g = eyeCtx;
  const eyeY = headY - S*0.02, eyeR = S*0.050;

  g.save();
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.filter = 'none';
  g.shadowColor = 'rgba(0,0,0,0)';
  g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0;
  g.lineCap = 'round'; g.lineJoin = 'round';

  // lewy i prawy środek oka (prawe przesunięte w lewo o ~S*0.01)
  const leftX  = cx - S*0.16;
  const rightX = cx + S*0.15;  // było: + S*0.16

  function one(x){
    if (p.eyeOpen > 0.07) {
      // klip do elipsy, żeby błysk nigdy nie wyszedł poza kontur
      g.save();
      g.beginPath(); g.ellipse(x, eyeY, eyeR, eyeR, 0, 0, Math.PI*2); g.clip();

      // źrenica
      g.save(); g.translate(x, eyeY); g.scale(1, p.eyeOpen);
      g.fillStyle = '#0b0b0b';
      g.beginPath(); g.ellipse(0,0, eyeR, eyeR, 0, 0, Math.PI*2); g.fill();
      g.restore();

      // biały błysk — minimalnie mniejszy i głębiej w oku
      g.fillStyle = '#ffffff';
      const hlR = eyeR * 0.18;
      g.beginPath();
      g.arc(x + eyeR*0.32, eyeY - eyeR*0.32*p.eyeOpen, hlR, 0, Math.PI*2);
      g.fill();

      g.restore();
    } else {
      // zamknięte — łuk
      g.strokeStyle = '#0b0b0b';
      g.lineWidth = Math.max(2, S*0.012);
      g.beginPath(); g.arc(x, eyeY, eyeR*0.9, Math.PI*0.1, Math.PI*0.9); g.stroke();
    }
  }

  one(leftX);
  one(rightX);
  g.restore();
}


// Brud: pozycje i rysowanie (1:1 z paskiem)
function ensureDirtSeeds(count, sampler){
  if(dirtSeeds.length >= count) return;
  while(dirtSeeds.length < count){
    dirtSeeds.push(sampler());
  }
}
function drawDirtByFraction(frac){
  const n = Math.max(0, Math.min(MAX_DIRT, Math.round(frac * MAX_DIRT)));
  for(let i=0;i<n;i++){
    const d = dirtSeeds[i];
    ctx.fillStyle = '#8a5a44';
    ctx.beginPath();
    const r = 2 + (i % 4);
    ctx.arc(d.x, d.y, r, 0, Math.PI*2);
    ctx.fill();
  }
}

// ====== Tła (otoczenia) ======

// Oceaniczne tło
function drawOceanBackground(W,H){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,   '#0e2a47');
  g.addColorStop(0.5, '#114a68');
  g.addColorStop(1,   '#0f3452');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  ctx.globalAlpha = 0.25;
  for(let i=0;i<3;i++){
    const y = (H*0.2)*(i+1) + Math.sin(t*0.6 + i)*10;
    ctx.beginPath();
    ctx.moveTo(0,y);
    for(let x=0;x<=W;x+=20){
      const yy = y + Math.sin((x*0.02) + t*0.8 + i)*8;
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(W, y+60);
    ctx.lineTo(0, y+60);
    ctx.closePath();
    ctx.fillStyle = i%2 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  function seaweed(baseX, hueShift=0){
    ctx.save();
    ctx.translate(baseX, H);
    for(let i=0;i<4;i++){
      const h = 140 + i*30 + Math.sin(t*0.9 + i)*10;
      ctx.beginPath();
      ctx.moveTo(0,0);
      const sway = Math.sin(t*1.2 + i)*12;
      ctx.bezierCurveTo( -10, -h*0.3,  10+sway, -h*0.7,  0, -h );
      ctx.lineWidth = 10 - i*1.5;
      ctx.strokeStyle = `hsl(${150+hueShift}, 45%, ${30+i*6}%)`;
      ctx.stroke();
    }
    ctx.restore();
  }
  seaweed(W*0.12,  0);
  seaweed(W*0.18,  8);
  seaweed(W*0.85, -6);
  seaweed(W*0.78,  6);

  for(let i=0;i<10;i++){
    const x = (i*W/10 + (t*30*i)%W) % W;
    const y = H - ((t*40 + i*80) % (H+80));
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(x, y, 4 + (i%3), 0, Math.PI*2); ctx.fillStyle='#dff6ff'; ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Jaskinia
function drawCaveBackground(W,H){
  const g = ctx.createRadialGradient(W*0.5, H*0.3, H*0.2, W*0.5, H*0.7, H*0.9);
  g.addColorStop(0, '#1b1d27');
  g.addColorStop(1, '#0a0b10');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

  ctx.globalAlpha = 0.10;
  for(let i=0;i<4;i++){
    const y = H*0.15 + i*H*0.2 + Math.sin(t*0.3 + i)*8;
    ctx.beginPath();
    ctx.moveTo(0,y);
    for(let x=0;x<=W;x+=24){
      const yy = y + Math.sin(x*0.02 + t*0.5 + i)*6;
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
    ctx.fillStyle = '#202434'; ctx.fill();
  }
  ctx.globalAlpha = 1;

  // stalaktyty
  ctx.fillStyle = '#0f1320';
  for(let i=0;i<14;i++){
    const x = (i+0.5)*W/14 + Math.sin(t*0.2 + i)*10;
    const w = 10 + (i%3)*6;
    const h = H*0.10 + (i%5)*12 + Math.sin(t*0.7 + i)*6;
    ctx.beginPath();
    ctx.moveTo(x,0);
    ctx.lineTo(x+w*0.4,h*0.6);
    ctx.lineTo(x, h);
    ctx.lineTo(x-w*0.4, h*0.6);
    ctx.closePath(); ctx.fill();
  }

  // robaczki świętojańskie
  for(let i=0;i<18;i++){
    const x = (W*((i*67)%97)/97 + Math.sin(t*0.6+i)*30) % W;
    const y = H*0.25 + Math.sin(t*0.9 + i*0.7)*H*0.25 + (i%3)*14;
    const pulse = (Math.sin(t*3 + i)*0.5+0.5)*0.8 + 0.2;
    ctx.beginPath();
    ctx.arc(x,y, 2.2+ (i%2), 0, Math.PI*2);
    ctx.fillStyle = `rgba(210,255,170,${0.6*pulse})`;
    ctx.fill();
  }

  // kropelki
  ctx.globalAlpha = 0.25;
  for(let i=0;i<10;i++){
    const x = ((i*W/10) + (t*30 + i*40)) % W;
    const y = (t*120 + i*50) % (H*0.8);
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fillStyle = '#9cc3ff'; ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Polana
function drawMeadowBackground(W,H){
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#8ed1ff');
  sky.addColorStop(1,'#e0f7ff');
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);

  // słońce
  ctx.globalAlpha=0.35;
  ctx.beginPath(); ctx.arc(W*0.15, H*0.18, H*0.16, 0, Math.PI*2); ctx.fillStyle='#fff8cc'; ctx.fill();
  ctx.globalAlpha=1;

  // trawa (warstwy falujące)
  function grass(yBase, hue){
    ctx.fillStyle = hue;
    ctx.beginPath();
    ctx.moveTo(0, H - yBase);
    for(let x=0;x<=W;x+=14){
      const yy = H - yBase - 10*Math.sin(x*0.04 + t*1.2);
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  }
  grass(H*0.22, '#6fbf73');
  grass(H*0.18, '#58a85c');
  grass(H*0.14, '#4c9651');

  // pyłki
  ctx.globalAlpha = 0.5;
  for(let i=0;i<24;i++){
    const x = (i*W/24 + (t*20 + i*30)) % W;
    const y = H*0.45 + Math.sin(t*0.9 + i)*H*0.25;
    ctx.beginPath(); ctx.arc(x,y,1.6,0,Math.PI*2); ctx.fillStyle='#ffffff'; ctx.fill();
  }
  ctx.globalAlpha = 1;

  // motylki-ambient (inne niż łapane)
  for(let i=0;i<6;i++){
    const x = (W*((i*37)%97)/97 + t*20 + i*50) % W;
    const y = H*0.3 + Math.sin(t*1.1 + i)*40;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(Math.sin(t*3+i)*0.3);
    ctx.beginPath();
    ctx.ellipse(0,0,6,10,0,0,Math.PI*2);
    ctx.ellipse(0,0,6,10,Math.PI/2,0,Math.PI*2);
    ctx.fillStyle = '#ffd5e5'; ctx.fill();
    ctx.restore();
  }
}

// Chmury — mocniej niebieskie dla kontrastu
function drawCloudsBackground(W,H){
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#5aa3ff');
  sky.addColorStop(0.6,'#82c0ff');
  sky.addColorStop(1,'#d9efff');
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);

  ctx.save();
  const rg = ctx.createRadialGradient(W*0.5, H*0.55, Math.min(W,H)*0.2, W*0.5, H*0.55, Math.max(W,H)*0.8);
  rg.addColorStop(0, 'rgba(0,0,0,0)');
  rg.addColorStop(1, 'rgba(0,0,40,0.10)');
  ctx.fillStyle = rg;
  ctx.fillRect(0,0,W,H);
  ctx.restore();

  function cloud(y, speed, scale){
    const xOff = (t*speed) % (W+300);
    const x = W - xOff;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.93;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-40,0,26,0,Math.PI*2);
    ctx.arc(0,-10,34,0,Math.PI*2);
    ctx.arc(50,0,28,0,Math.PI*2);
    ctx.arc(14,12,24,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // więcej chmur (tło)
  for(let i=0;i<8;i++){
    const y = H*0.25 + Math.sin(t*0.7 + i)*20 + (i%3)*26;
    const speed = 12 + i*10;
    const scale = 0.8 + (i%3)*0.25;
    cloud(y, speed, scale);
  }
}

// wybór tła
function drawEnvironmentBackground(W,H){
  switch(env){
    case 'jaskinia': return drawCaveBackground(W,H);
    case 'polana'  : return drawMeadowBackground(W,H);
    case 'chmury'  : return drawCloudsBackground(W,H);
    case 'ocean':
    default        : return drawOceanBackground(W,H);
  }
}

// Wskaźnik miłości – rysowanie (prawy górny róg)
function drawLoveIndicator(W,H){
  const pctVal = love.percent || 0;
  const boxW = 110, boxH = 34;
  const x = W - boxW - 12;
  const y = 12;
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(20,28,44,0.35)';
  ctx.beginPath();
  const r = 10;
  if(ctx.roundRect){ ctx.roundRect(x, y, boxW, boxH, r); }
  else{
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+boxW-r,y); ctx.quadraticCurveTo(x+boxW,y, x+boxW,y+r);
    ctx.lineTo(x+boxW,y+boxH-r); ctx.quadraticCurveTo(x+boxW,y+boxH, x+boxW-r,y+boxH);
    ctx.lineTo(x+r,y+boxH); ctx.quadraticCurveTo(x,y+boxH, x,y+boxH-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y, x+r,y);
  }
  ctx.fill();
  ctx.globalAlpha = 1;

  // serduszko
  ctx.fillStyle = '#ff6b9a';
  ctx.beginPath();
  const hx = x+16, hy = y+18, a=7;
  ctx.moveTo(hx,hy-2);
  ctx.bezierCurveTo(hx+a, hy-12, hx+18, hy-2, hx, hy+10);
  ctx.bezierCurveTo(hx-18, hy-2, hx-a, hy-12, hx, hy-2);
  ctx.fill();

  // tekst %
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${pctVal.toFixed(1)}%`, x+34, y+17);
  ctx.restore();
}
function drawMouth(ctx, cx, headY, S, p){
  const yTop   = headY + S * 0.08;
  const mouthW = S * 0.125;
  const R      = mouthW / 2;

  // offscreen dla prostego „zamykania” podczas przeżuwania
  const dpr  = Math.max(1, window.devicePixelRatio || 1);
  const pad  = 4;
  const wCSS = mouthW + pad * 2;
  const hCSS = R + pad * 2;

  const oc = document.createElement('canvas').getContext('2d');
  oc.canvas.width  = Math.ceil(wCSS * dpr);
  oc.canvas.height = Math.ceil(hCSS * dpr);
  oc.setTransform(dpr, 0, 0, dpr, 0, 0);
  oc.translate(wCSS / 2, pad);

  // buzia
  oc.fillStyle = '#111';
  oc.beginPath();
  oc.moveTo(-R, 0); oc.lineTo(R, 0); oc.arc(0, 0, R, 0, Math.PI, false);
  oc.closePath(); oc.fill();

  // język
  const tongueR  = R * 0.55;
  const tongueCY = R * 0.40;
  const palette  = PALETTES[player.color] || PALETTES.pink;
  oc.fillStyle = palette.tongue;
  oc.beginPath(); oc.arc(0, tongueCY, tongueR, 0, Math.PI, false); oc.fill();

  // „zamykanie” przy jedzeniu
  const close = p.eating ? (0.50 - 0.50 * Math.sin(p.chew * 2.6)) : 0.0;
  const cutH  = close * (R + 2);
  oc.globalCompositeOperation = 'destination-out';
  oc.fillRect(-R - 3, (R - cutH) - 1, mouthW + 6, R + 6);
  oc.globalCompositeOperation = 'source-over';

  ctx.drawImage(oc.canvas, cx - wCSS / 2, yTop - pad, wCSS, hCSS);
}

// ========= Rysunek aksolotla (scena główna) =========
function drawAxolotl(ctx, W, H, p){
  const cx = W/2;
  const S  = Math.min(W,H)*0.46;
  const headY = H*0.40;
  const bodyY = H*0.63;

  // TŁO + wskaźnik + przycisk mini-gry
  drawEnvironmentBackground(W,H);
  drawLoveIndicator(W,H);

  if(!player.name){
    // jeśli brak imienia (ekran intro), wyczyść overlay oczu
    eyeCtx.clearRect(0,0, eyeLayer.width, eyeLayer.height);
    return;
  }

  const palette = PALETTES[player.color] || PALETTES.pink;

  ctx.save();

  // OGON
  ctx.save();
  const tailAnchorX = cx + S*0.02;
  const tailAnchorY = bodyY + S*0.45;
  ctx.translate(tailAnchorX, tailAnchorY);
  ctx.rotate(p.tail);
  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.moveTo(-S*0.06, -S*0.10);
  ctx.quadraticCurveTo( S*0.02, -S*0.02,  S*0.36,  S*0.24);
  ctx.quadraticCurveTo( S*0.18,  S*0.40, -S*0.02,  S*0.28);
  ctx.quadraticCurveTo(-S*0.14,  S*0.18, -S*0.06, -S*0.10);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  if (p.wiggle>0){
    const a = Math.sin(t*16)*p.wiggle*0.06;
    ctx.translate(cx,(headY+bodyY)/2);
    ctx.rotate(a);
    ctx.translate(-cx,-(headY+bodyY)/2);
  }

  const bodyRx = S*0.36;
  const bodyRy = S*0.56*(1+p.breath*0.02);

  // Górne łapki
  (function drawUpperArms(){
    function arm(thetaDeg){
      const th  = thetaDeg * Math.PI / 180;
      const ax = cx + bodyRx * Math.cos(th);
      const ay = bodyY + bodyRy * Math.sin(th) + S * 0.60;
      const L     = S * 0.35;
      const rBase = S * 0.050;
      const rEnd  = S * 0.115;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(th);
      ctx.fillStyle = palette.body;
      const base = -rBase * 1.25;
      ctx.beginPath();
      ctx.moveTo(base, -rBase*0.78);
      ctx.quadraticCurveTo(L*0.42, -rBase*0.70, L - rEnd, -rEnd);
      ctx.arc(L - rEnd, 0, rEnd, -Math.PI/2, Math.PI/2, false);
      ctx.quadraticCurveTo(L*0.42,  rBase*0.70, base,  rBase*0.78);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    arm(235);
    arm(-55);
  })();

  // Tułów
  ctx.fillStyle = palette.body;
  ellipseFill(cx, bodyY, bodyRx, bodyRy);

  // Brzuszek
  ctx.fillStyle = palette.belly;
  ellipseFill(cx, bodyY+S*0.03, S*0.28, S*0.42*(1+p.breath*0.02));

  // Dolne łapki
  ctx.fillStyle = palette.body;
  function limb(x,y,rx,ry,rot){ ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ellipseFill(0,0,rx,ry); ctx.restore(); }
  limb(cx - S*0.26, bodyY + S*0.33, S*0.14, S*0.085, -0.25);
  limb(cx + S*0.26, bodyY + S*0.33, S*0.14, S*0.085,  0.25);

  // Skrzela
  const headRx = S*0.50, headRy = S*0.36;
  const EAR_Y_OFF = -S*0.10;
  function anchorOnHead(theta){
    return { x: cx + headRx * Math.cos(theta), y: headY + headRy * Math.sin(theta) + EAR_Y_OFF };
  }
  function capsuleFromHead(theta, length, thickness){
    const a = anchorOnHead(theta);
    const dirAng = Math.atan2(Math.sin(theta), Math.cos(theta));
    const r = thickness/2;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(dirAng);
    ctx.fillStyle = palette.frill;
    ctx.beginPath();
    ctx.moveTo(-r, -r);
    ctx.lineTo(length, -r);
    ctx.arc(length, 0, r, -Math.PI/2, Math.PI/2);
    ctx.lineTo(-r, r);
    ctx.arc(-r, 0, r, Math.PI/2, -Math.PI/2);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const fr = p.frill*0.05, THK = S*0.14;
  const LEN = [S*0.22, S*0.30, S*0.24];
  const L_ANG = [(150*Math.PI/180)+fr,(180*Math.PI/180)+fr,(210*Math.PI/180)+fr];
  const R_ANG = [( 30*Math.PI/180)-fr,(  0*Math.PI/180)-fr,(-30*Math.PI/180)-fr];
  capsuleFromHead(L_ANG[0], LEN[0], THK);
  capsuleFromHead(L_ANG[1], LEN[1], THK);
  capsuleFromHead(L_ANG[2], LEN[2], THK);
  capsuleFromHead(R_ANG[0], LEN[0], THK);
  capsuleFromHead(R_ANG[1], LEN[1], THK);
  capsuleFromHead(R_ANG[2], LEN[2], THK);

    // Głowa
// Głowa
ctx.fillStyle = palette.body;
ellipseFill(cx, headY, headRx, headRy);

// Rumieńce — reset, żeby nigdy nie były „wyszarzone”
ctx.globalAlpha = 1;
ctx.globalCompositeOperation = 'source-over';
ctx.filter = 'none';
ctx.shadowColor = 'rgba(0,0,0,0)';
ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

ctx.fillStyle = palette.blush;
ellipseFill(cx - S*0.235, headY + S*0.015, S*0.028, S*0.028);
ellipseFill(cx + S*0.235, headY + S*0.015, S*0.028, S*0.028);


  // Usta z językiem — PRZED oczami (oczy są na overlayu)
  drawMouth(ctx, cx, headY, S, p);

  // Oczy (overlay z białymi kropkami)
  drawEyesOverlay(cx, headY, S, p);

  // BRUD (1:1 z paskiem — od 0 do 100)
  if(stats.kapuKapu > 0){
    if(dirtSeeds.length === 0){
      const sampler = ()=>{
        const pickHead = Math.random() < 0.45;
        let px, py;
        if(pickHead){
          const ang = Math.random()*Math.PI*2;
          const rr  = Math.sqrt(Math.random());
          px = cx + headRx * rr * Math.cos(ang);
          py = headY + headRy * rr * Math.sin(ang);
        }else{
          const ang = Math.random()*Math.PI*2;
          const rr  = Math.sqrt(Math.random());
          px = cx + bodyRx * rr * Math.cos(ang);
          py = bodyY + bodyRy * rr * Math.sin(ang);
        }
        return {x:px, y:py};
      };
      ensureDirtSeeds(MAX_DIRT, sampler);
    }
    const frac = stats.kapuKapu / 100;
    drawDirtByFraction(Math.max(0, Math.min(1, frac)));
  } else if (dirtSeeds.length>0){
    dirtSeeds.length = 0;
  }

  // Serca (poza kąpielą)
  if(!bathMode) hearts.forEach(h=> heart(h.x,h.y,8));

  // GĄBKA — absolutnie czysta (bez plam)
  if(bathMode){
    const r = canvas.getBoundingClientRect();
    const Wc = r.width, Hc = r.height;
    const S = Math.min(Wc,Hc)*0.46;
    const spongeR = S * 0.16;
    const x = sponge.x ?? (W*0.82);
    const y = sponge.y ?? (H*0.80);
    ctx.save();
    // pełny reset efektów
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    ctx.translate(x, y);
    // gąbka
    ctx.fillStyle = '#ffd660';
    ellipseFill(0,0, spongeR*1.1, spongeR*0.75);
    // delikatny połysk (biały, nie szary)
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ellipseFill(-spongeR*0.3, -spongeR*0.25, spongeR*0.35, spongeR*0.22);
    ctx.restore();
  }

  // PRZEKĄSKA — robaczek
  if (p.snack>0){
    const u = p.snack;
    const startX = cx - S*0.80, startY = headY + S*0.02;
    const endX   = cx + S*0.02,  endY   = headY + S*0.08;
    const midX   = cx - S*0.32,  midY   = headY - S*0.18;
    const x = (1-u)*(1-u)*startX + 2*(1-u)*u*midX + u*u*endX;
    const y = (1-u)*(1-u)*startY + 2*(1-u)*u*midY + u*u*endY;

    ctx.save();
    ctx.globalAlpha = u<0.95 ? 1 : 1-(u-0.95)/0.05;
    ctx.translate(x,y);
    ctx.rotate(Math.sin(u*10 + t*8)*0.2);
    ctx.strokeStyle='#ff7aa8';
    ctx.lineWidth=4;
    ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-10,0);
    for(let i=-10;i<=10;i+=2) ctx.lineTo(i, Math.sin((i+u*40)/6)*2);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // przycisk mini-gry (prawe-dolne)
  drawHomeMiniButton(W,H);
}

// ========= MINI-GRY – wspólne narzędzia / outcome =========
function enterMiniGame(type){
  if(!player.name) return;
  mode = 'game';
  document.body.classList.add('minigame');
  updateOrientationClass();
  requestFullscreenLandscape();

  setEyeLayerVisible(false);
  bathMode = false;
  syncUIFromState();

  const common = {
    type,
    startedAt: performance.now(),
    score: 0,
    over: false,
    win: false,
    timeLeft: 45, // domyślny limit czasu
    buttons: { back: {x: null, y: null, w: 90, h: 32} }
  };

  if(type==='sky'){
    // Chmureczki Skakaneczki — 60s biegu, gracz stoi w miejscu i tylko skacze
    env = 'chmury';
    game = {
      ...common,
      title: 'Chmureczki Skakaneczki',
      duration: 60,            // pełna minuta
      elapsed: 0,
      g: 1400,
      dist: 0,
      player: {x: 140, y: 280, vx: 0, vy: 0, onGround: false}, // stoi (vx=0)
      platforms: [],
      nextPlatX: 200
    };
    spawnSkyInitial();
  }else if(type==='cave'){
    // Jaskiniowa Ucieczka — 60s; ciągła generacja klifów
    env = 'jaskinia';
    game = {
      ...common,
      title: 'Jaskiniowa Ucieczka',
      timeLeft: 60, // minuta biegu
      g: 1700,
      player: {x: 120, y: 320, vy: 0, onGround: true, sliding:false, slideT:0},
      speed: 300,
      obstacles: [],
      nextObsX: 280
    };
  }else if(type==='meadow'){
    env = 'polana';
    game = {
      ...common,
      title: 'Motylkowi Przyjaciele',
      timeLeft: 45,
      player: {x: 180, y: 300, target: null},
      butterflies: [],
      colors: ['#ff9f1c','#2ec4b6','#e71d36','#8338ec','#ffd166','#06d6a0']
    };
    for(let i=0;i<10;i++) spawnButterfly();
  }else if(type==='bubbles'){
    env = 'ocean';
    game = {
      ...common,
      title: 'Bąbeleczki',
      timeLeft: 45,
      bubbles: [],
      spawnT: 0
    };
  }

  saveState();
}
function exitMiniGameWithoutReward(){
  document.body.classList.remove('minigame');
  exitFullscreenIfNeeded();
  updateOrientationClass();
  game = null;
  mode = 'home';
  syncUIFromState();
}
function showPostMessage(text){
  postMsg = { text, btn:'Wyjdź', rect:null };
  setPageOverlay(true); // zablokuj i rozmyj resztę strony
  setEyeLayerVisible(false);
  syncUIFromState(); // zablokuj przyciski podczas komunikatu
}
function endGame(outcome){
  if(!game) return;
  const type = game.type;
  if(type==='sky'){ // Chmureczki Skakaneczki
    if(outcome==='win'){
      stats.kapuKapu = 0; // pełne umycie
      addLoveForGame('sky');
      showPostMessage('Brawo kochanie! Chmurki pozwoliły aksolotkowi się umyć! Jeeej! 😘💖💞💋🥰');
    }else{
      stats.kapuKapu = clamp(stats.kapuKapu + 10);
      lockLoveForGame('sky');
      showPostMessage('O nieee! Aksolotek spadł i wpadł do błotka! Jest teraz bardziej brudny! 😭🥺😢💔❤️');
    }
  }else if(type==='cave'){ // Jaskiniowa Ucieczka
    if(outcome==='win'){
      stats.glodek = 0;
      addLoveForGame('cave');
      showPostMessage('Udało Ci się! Na końcu była duża rybka i aksolotek jest teraz najedzony! 😘💖💞💋🥰');
    }else{
      // przegrana w jaskini = bardziej brudny i głodniejszy
      stats.kapuKapu = clamp(stats.kapuKapu + 10);
      stats.glodek   = clamp(stats.glodek + 10);
      lockLoveForGame('cave');
      showPostMessage('Niestety, aksolotek spadł i się ubrudził, a do tego bardzo zgłodniał! 😭🥺😢💔❤️');
    }
  }else if(type==='meadow'){ // Motylkowi Przyjaciele
    if(outcome==='win'){
      stats.humorek = 100;
      addLoveForGame('meadow');
      showPostMessage('OMG aksolotek ma teraz przyjaciół! Na 100% jest szczęśliwy! 😘💖💞💋🥰');
    }else{
      stats.humorek = clamp(stats.humorek - 10);
      lockLoveForGame('meadow');
      showPostMessage('Niestety, ale wszyscy przyjaciele uciekli i aksolotek jest sam! 😭🥺😢💔❤️');
    }
  }else if(type==='bubbles'){ // Bąbeleczki
    if(outcome==='win'){
      stats.spanko = 100;
      addLoveForGame('bubbles');
      showPostMessage('Chyba w tych bąbelkach coś było, bo aksolotek tryska energią! Hihi 😘💖💞💋🥰');
    }else{
      stats.spanko = clamp(stats.spanko - 10);
lockLoveForGame('bubbles');
showPostMessage('Niestety kochanie, ale aksolotek nie złapał duzio bąbelków i do tego się bardzo zmęczył! 😭🥺😢💔❤️');
    }
  }

  updateStatsUI(); syncUIFromState(); saveState();
  exitMiniGameWithoutReward();
}

// HUD gry
function drawHUDGame(W,H){
  ctx.save();
  // tytuł gry
  ctx.fillStyle = 'rgba(15,23,42,0.35)';
  ctx.fillRect(10,10, Math.min(300, W-220), 34);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(game.title || 'Mini-gra', 18, 27);

  // przycisk WYJDŹ — wyjście w trakcie = przegrana
  const bx = W-95, by = 14, bw = 82, bh = 26;
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('Wyjdź', bx+bw/2, by+bh/2);
  game.buttons.back.x = bx; game.buttons.back.y = by; game.buttons.back.w = bw; game.buttons.back.h = bh;

  // Czas / Punkty
  ctx.fillStyle = 'rgba(15,23,42,0.35)';
  if(game.type==='sky'){
    ctx.fillRect(200,10, 160, 34);
    ctx.fillStyle = '#fff';
    ctx.textAlign='center';
    const left = Math.max(0, Math.ceil(game.duration - game.elapsed));
    ctx.fillText(`Czas: ${left}s`, 280, 27);
  }else{
    ctx.fillRect(200,10, 200, 34);
    ctx.fillStyle = '#fff';
    ctx.textAlign='center';
    ctx.fillText(`Czas: ${Math.ceil(game.timeLeft)}  •  ${Math.floor(game.score)} pkt`, 300, 27);
  }

  ctx.restore();
}

// ====== MINI-GRY: 1) CHMURECZKI SKAKANECZKI (Chmury, 60s) ======
function spawnSkyInitial(){
  const dpr = Math.max(1, window.devicePixelRatio||1);
  const H = canvas.height/dpr, W = canvas.width/dpr;
  game.platforms = [];
  let x = 100;
  let lastY = 320;
  // startowa paczka chmur
  for(let i=0;i<24;i++){
    const w = 140 + Math.random()*90;
    const y = clamp(lastY + (-50 + Math.random()*100), 150, 420);
    game.platforms.push({x, y, w});
    // odstępy (1–2 skoki)
    const gap = 160 + Math.random()*160; // 160..320
    x += gap;
    lastY = y;
  }
  game.nextPlatX = x;
}
function skySpawnMore(){
  const dpr = Math.max(1, window.devicePixelRatio||1);
  const W = canvas.width/dpr;
  // Generuj do przodu – nextPlatX liczymy względem przewijania
  while(game.nextPlatX < W + 800){
    const w = 140 + Math.random()*90;
    const lastY = game.platforms.length ? game.platforms[game.platforms.length-1].y : 320;
    const y = clamp(lastY + (-50 + Math.random()*100), 150, 420);
    const x = game.nextPlatX;
    game.platforms.push({x, y, w});
    const gap = 160 + Math.random()*160; // 160..320
    game.nextPlatX += gap;
  }
}
function updateSky(dt, W, H){
  const p = game.player;
  // zegar 60s
  game.elapsed += dt;

  // grawitacja i pionowy ruch gracza (x nie zmieniamy — stoi)
  p.vy += game.g*dt;
  p.y  += p.vy*dt;

  // przesuw świata w lewo („bieg chmur”)
  const scroll = 180*dt;
  game.platforms.forEach(pl=> pl.x -= scroll);
  // przesuwamy także „punkt przyszłej chmury”
  game.nextPlatX -= scroll;

  game.dist += scroll;
  game.score += scroll*0.25;

  // spawn kolejnych chmur
  skySpawnMore();

  // kolizje z platformami (kontakt od góry)
  p.onGround = false;
  for(const pl of game.platforms){
    if(140 > pl.x-10 && 140 < pl.x+pl.w+10){ // x gracza stałe ~140
      const groundY = pl.y - 12;
      if(p.vy>0 && p.y >= groundY && p.y <= groundY+28){
        p.y = groundY; p.vy = 0; p.onGround = true;
      }
    }
  }
  // usuwanie poza ekran
  game.platforms = game.platforms.filter(pl=> pl.x+pl.w > -60);

  // spadnięcie
  if(p.y > H+40){ endGame('lose'); return; }

  // zwycięstwo po 60 sekundach
  if(game.elapsed >= game.duration){
    endGame('win');
  }
}
function drawSky(W,H){
  drawCloudsBackground(W,H);
  // platformy
  ctx.fillStyle = '#ffffff';
  for(const pl of game.platforms){
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(pl.x, pl.y-12, pl.w, 24, 12);
    else ctx.fillRect(pl.x, pl.y-12, pl.w, 24);
    ctx.fill();
  }
  // gracz – mini sylwetka
  drawMiniAxo(140, game.player.y, 0.42);
}

// ====== MINI-GRY: 2) JASKINIOWA UCIECZKA (Jaskinia, 60s) ======
function spawnCaveObst(){
  const dpr = Math.max(1, window.devicePixelRatio||1);
  const W = canvas.width/dpr;
  const H = canvas.height/dpr;
  while(game.nextObsX < W + 1600){
    const gapY = 260 + (Math.random()*160-80);
    const gapH = 120 + Math.random()*50;
    const topH = clamp(gapY - gapH/2, 40, 300);
    const botY = gapY + gapH/2;
    const botH = clamp(H - botY - 30, 40, 260);
    game.obstacles.push({x: game.nextObsX, topH, botH});
    game.nextObsX += 180 + Math.random()*140;
  }
}
function updateCave(dt,W,H){
  const p = game.player;
  // grawitacja + ruch pionowy
  p.vy += game.g*dt;
  p.y  += p.vy*dt;

  // przegrana: spadł na „ziemię”
  if(p.y >= H-18 && p.vy >= 0){ endGame('lose'); return; }

  // kontakt z sufitem (bez przegranej – odbicie)
  if(p.y<10){ p.y=10; p.vy=0; }

  // przesuw świata
  const dx = game.speed*dt;
  game.obstacles.forEach(o=> o.x -= dx);
  game.nextObsX -= dx;

  spawnCaveObst();
  game.obstacles = game.obstacles.filter(o=> o.x > -80);

  // kolizja (prosta kapsuła)
  const px = 120, py = p.y;
  const r  = 16;
  for(const o of game.obstacles){
    if(px>o.x-16 && px<o.x+32){
      if(py - r < o.topH || py + r > (H - o.botH)){ endGame('lose'); return; }
    }
  }

  // punkty z dystansu
  game.score += dx*0.1;

  // koniec po minucie -> wygrana
  if(game.timeLeft<=0){ endGame('win'); return; }
}
function drawCave(W,H){
  drawCaveBackground(W,H);
  // przeszkody
  ctx.fillStyle = '#0f1320';
  for(const o of game.obstacles){
    ctx.fillRect(o.x, 0, 32, o.topH);
    ctx.fillRect(o.x, H - o.botH, 32, o.botH);
  }
  drawMiniAxo(120, game.player.y, 0.44);
}

// ====== MINI-GRY: 3) MOTYLKOWI PRZYJACIELE (Polana) ======
function spawnButterfly(){
  const dpr = Math.max(1, window.devicePixelRatio||1);
  const W = canvas.width/dpr;
  const H = canvas.height/dpr;
  const x = Math.random()*W, y = H*0.25 + Math.random()*H*0.5;
  const vx = (Math.random()*2-1)*60;
  const vy = (Math.random()*2-1)*40;
  const color = game.colors[Math.floor(Math.random()*game.colors.length)];
  game.butterflies.push({x,y,vx,vy,t:Math.random()*Math.PI*2,color});
}
function updateMeadow(dt,W,H){
  const p = game.player;
  // BEZ OPÓŹNIENIA — teleport na pozycję kursora/palca (natychmiast)
  if(p.target){
    p.x = clamp(p.target.x, 20, W-20);
    p.y = clamp(p.target.y, 60, H-20);
  }

  // motylki
  for(const b of game.butterflies){
    b.t += dt*2.2;
    b.vx += Math.sin(b.t)*4;
    b.vy += Math.cos(b.t*0.8)*3;
    b.x += b.vx*dt; b.y += b.vy*dt;
    if(b.x<20||b.x>W-20) b.vx*=-1;
    if(b.y<60||b.y>H-30) b.vy*=-1;
  }
  // łapanie
  for(let i=game.butterflies.length-1;i>=0;i--){
    const b = game.butterflies[i];
    const dx = p.x - b.x, dy = p.y - b.y;
    if(dx*dx+dy*dy < 26*26){ game.score += 1; game.butterflies.splice(i,1); spawnButterfly(); }
  }
if (game.score >= 90) { endGame('win'); return; }
  // warunek zwycięstwa po czasie — od 90 pkt
  if(game.timeLeft<=0){
    if(game.score>=90) endGame('win'); else endGame('lose');
  }
}
function drawMeadow(W,H){
  drawMeadowBackground(W,H);
  // motylki
  for(const b of game.butterflies){
    ctx.save();
    ctx.translate(b.x,b.y);
    ctx.rotate(Math.sin(b.t*3)*0.3);
    ctx.beginPath();
    ctx.ellipse(0,0,6,10,0,0,Math.PI*2);
    ctx.ellipse(0,0,6,10,Math.PI/2,0,Math.PI*2);
    ctx.fillStyle = b.color; ctx.fill();
    ctx.restore();
  }
  drawMiniAxo(game.player.x, game.player.y, 0.40);
}

// ====== MINI-GRY: 4) BĄBELECZKI (Ocean) ======
function updateBubbles(dt,W,H){
  game.spawnT -= dt;
  if(game.spawnT<=0){
    game.spawnT = 0.25 + Math.random()*0.35;
    const x = 30 + Math.random()*(W-60);
    const r = 10 + Math.random()*12;
    const vy = - (60 + Math.random()*90);
    game.bubbles.push({x,y:H+20,r,vy, wob: Math.random()*Math.PI*2});
  }
  for(const b of game.bubbles){
    b.wob += dt*2;
    b.x += Math.sin(b.wob)*18*dt;
    b.y += b.vy*dt;
  }
  if (game.score >= 80) { endGame('win'); return; }
  // usuwaj
  game.bubbles = game.bubbles.filter(b=> b.y + b.r > -10);

  if(game.timeLeft<=0){
    if(game.score>=80) endGame('win'); else endGame('lose');
  }
}
function drawBubbles(W,H){
  drawOceanBackground(W,H);
  for(const b of game.bubbles){
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#c6f3ff';
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath(); ctx.arc(b.x-b.r*0.35,b.y-b.r*0.35, b.r*0.35, 0, Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#ffffff';
  ctx.font='12px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
  ctx.fillText('Tapnij bąbelki!', 16, 48);
  drawMiniAxo(W*0.1, H*0.8, 0.35);
}

// ====== Mini axo – uproszczona wersja modelu do gier ======
function drawMiniAxo(x,y,scale=0.4){
  const palette = PALETTES[player.color] || PALETTES.pink;
  ctx.save();
  ctx.translate(x,y);
  const S = 60*scale*2.2;
  // ogon
  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.moveTo(-S*0.06,  S*0.10);
  ctx.quadraticCurveTo( S*0.10,  S*0.22,  S*0.22,  S*0.12);
  ctx.quadraticCurveTo( S*0.04,  S*0.30, -S*0.06,  S*0.20);
  ctx.closePath(); ctx.fill();

  // tułów
  ellipseFill(0, 8, S*0.38, S*0.48);
  ctx.fillStyle = palette.belly;
  ellipseFill(0, 14, S*0.28, S*0.38);

  // głowa
  ctx.fillStyle = palette.body;
  ellipseFill(0, -18, S*0.44, S*0.34);
  // skrzela
  ctx.fillStyle = palette.frill;
  ellipseFill(-S*0.34, -18, S*0.12, S*0.06);
  ellipseFill(-S*0.38, -6, S*0.10, S*0.05);
  ellipseFill( S*0.34, -18, S*0.12, S*0.06);
  ellipseFill( S*0.38, -6, S*0.10, S*0.05);
  // oczy
  ctx.fillStyle='#111';
  ellipseFill(-S*0.16, -22, S*0.06, S*0.06);
  ellipseFill( S*0.16, -22, S*0.06, S*0.06);
  // rumieniec
  ctx.fillStyle = palette.blush;
  ellipseFill(-S*0.26, -10, S*0.05, S*0.04);
  ellipseFill( S*0.26, -10, S*0.05, S*0.04);
  ctx.restore();
}

// ====== Wejście z klawiatury dla mini-gier ======
const keys = new Set();
addEventListener('keydown', (e)=>{
  if(mode!=='game') return;
  keys.add(e.key);
  // skok (sky/cave):
  if(e.key===' ' || e.key==='ArrowUp'){
    if(game.type==='sky'){
      const p = game.player;
      // JEDEN skok — tylko z podłoża
      if(p.onGround){ p.vy = -540; p.onGround=false; }
    }else if(game.type==='cave'){
      const p = game.player;
      // skok PRZY KAŻDYM tapnięciu/kliknięciu
      p.vy = -520;
    }
  }
  // ślizg (cave)
  if(game.type==='cave' && (e.key==='ArrowDown' || e.key==='s')){
    game.player.sliding = true; game.player.slideT = 0.4;
  }
});
addEventListener('keyup', (e)=>{
  if(mode!=='game') return;
  keys.delete(e.key);
});

// ====== Input w grach: pointer ======
function gamePointerDown(e){
  const p = getCanvasPos(e);
  // przycisk wyjścia? Wyjście w trakcie = przegrana
  if(pointInRect(p.x,p.y, game.buttons.back)){
    endGame('lose');
    return;
  }

  if(game.type==='sky'){
    const pl = game.player;
    // JEDEN skok — tylko z podłoża
    if(pl.onGround){ pl.vy=-540; pl.onGround=false; }
  }else if(game.type==='cave'){
    const pl = game.player;
    // skok na każde tapnięcie
    pl.vy=-520;
  }else if(game.type==='meadow'){
    game.player.target = {x:p.x, y:p.y};
  }else if(game.type==='bubbles'){
    // pop bąbelka
    for(let i=game.bubbles.length-1;i>=0;i--){
      const b = game.bubbles[i];
      const dx=b.x-p.x, dy=b.y-p.y;
      if(dx*dx+dy*dy < (b.r+10)*(b.r+10)){ game.bubbles.splice(i,1); game.score += 2; break; }
    }
  }
}
function gamePointerMove(e){
  if(game.type!=='meadow') return;
  const p = getCanvasPos(e);
  game.player.target = {x:p.x, y:p.y};
}
function gamePointerUp(e){
  if(game.type==='meadow'){ /* zostaw ostatni target */ }
}

// ====== Pętla główna ======
function update(dt){
  // egzekwuj dzień/noc
  enforceDayNight();

  if(mode==='home'){
    // mruganie
    if(!sleeping && eyeVel===0 && eyeOpen>=0.99 && t>=nextBlinkAt) eyeVel=-8;
    if(eyeVel!==0){
      eyeOpen += eyeVel*dt;
      if(eyeOpen<=0){ eyeOpen=0; eyeVel=8; }
      else if(eyeOpen>=1){ eyeOpen=1; eyeVel=0; nextBlinkAt=t+2.0+Math.random()*2.5; }
    }
    if(eatTimer>0){
      eatTimer -= dt;
      snackProg = Math.min(1, snackProg + dt/1.0);
      chewPhase += dt*6;
      if(eatTimer<=0){ eatTimer=0; snackProg=0; }
    }
    if(petTimer>0) petTimer = Math.max(0, petTimer - dt);
    for(let i=hearts.length-1;i>=0;i--){
      const h=hearts[i]; h.x+=h.vx*60*dt; h.y+=h.vy*60*dt; h.life-=dt*0.9; if(h.life<=0) hearts.splice(i,1);
    }

    const ready = Boolean(player.name);
    applyProgress(dt, { sleeping, petting: (ready && !bathMode && petTimer>0) });

    maybeResetLove();

    updateStatsUI();
    updateNameBadge();
    return;
  }

  // ====== tryb mini-gry ======
  if(!game || game.over){ return; }

  // czas gry
  if(game.type==='sky'){
    // liczony w updateSky
  }else{
    game.timeLeft -= dt; if(game.timeLeft<0) game.timeLeft=0;
  }

  // update konkretnej gry
  const dpr = Math.max(1, window.devicePixelRatio||1);
  const W = canvas.width/dpr, H = canvas.height/dpr;

  if(game.type==='sky')         updateSky(dt,W,H);
  else if(game.type==='cave')   updateCave(dt,W,H);
  else if(game.type==='meadow') updateMeadow(dt,W,H);
  else if(game.type==='bubbles')updateBubbles(dt,W,H);
}

// ====== Komunikat po grze – zawijanie tekstu ======
function wrapTextLines(text, maxWidth, font){
  ctx.save();
  if(font) ctx.font = font;
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for(const w of words){
    const test = cur ? cur + ' ' + w : w;
    if(ctx.measureText(test).width <= maxWidth){
      cur = test;
    }else{
      if(cur) lines.push(cur);
      if(ctx.measureText(w).width > maxWidth){
        let cut = '';
        for(const ch of w){
          const t2 = cut + ch;
          if(ctx.measureText(t2).width <= maxWidth){ cut = t2; }
          else{ lines.push(cut); cut = ch; }
        }
        cur = cut;
      }else{
        cur = w;
      }
    }
  }
  if(cur) lines.push(cur);
  ctx.restore();
  return lines;
}

function loop(now){
  const dt = Math.min(0.05, (now-last)/1000);
  frameDt = dt;
  last = now; t += dt;
  update(dt);

  ctx.setTransform(1,0,0,1,0,0); fitCanvas();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const dpr = Math.max(1, window.devicePixelRatio||1);
  const W = canvas.width/dpr, H = canvas.height/dpr;

  if(mode==='home'){
    const params = {
      breath: Math.sin(t*2*(sleeping?0.5:1)),
      frill:  Math.sin(t*(sleeping?0.6:(petTimer>0?2.6:1.8))),
      tail:   Math.sin(t*(sleeping?0.5:(petTimer>0?3.0:2.0)))*0.20,
      eyeOpen: sleeping?0:eyeOpen,
      eating:  (eatTimer>0),
      chew:    chewPhase,
      snack:   snackProg,
      wiggle:  petTimer
    };

    drawAxolotl(ctx, W, H, params);

    // Komunikat po grze — zawijanie i przycisk
    if(postMsg){
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.55)';
      ctx.fillRect(0,0,W,H);

      const maxBoxW = Math.min(500, W-40);
      const margin = 20;
      const font = 'bold 18px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
      ctx.font = font;
      ctx.fillStyle='#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = wrapTextLines(postMsg.text, maxBoxW - margin*2, font);
      const lineH = 24;
      const textH = lines.length * lineH + 10;
      const btnH = 42;
      const boxH = Math.min(H-60, textH + btnH + margin*2 + 10);
      const boxW = maxBoxW;
      const x = (W-boxW)/2, y=(H-boxH)/2;

      ctx.fillStyle='#0f172a';
      if(ctx.roundRect) ctx.roundRect(x,y,boxW,boxH,14); else ctx.fillRect(x,y,boxW,boxH);
      ctx.fill();

      ctx.fillStyle='#ffffff';
      const centerX = x + boxW/2;
      let ty = y + margin + lineH/2;
      const maxLines = Math.floor((boxH - btnH - margin*2)/lineH);
      const toDraw = lines.slice(0, maxLines);
      for(const ln of toDraw){
        ctx.fillText(ln, centerX, ty);
        ty += lineH;
      }

      const bw = 120, bh = 36, bx=x+boxW/2-bw/2, by=y+boxH- margin - bh;
      ctx.fillStyle='#22c55e'; ctx.fillRect(bx,by,bw,bh);
      ctx.fillStyle='#fff'; ctx.font='bold 16px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
      ctx.fillText('Wyjdź', bx+bw/2, by+bh/2+1);
      postMsg.rect = {x:bx,y:by,w:bw,h:bh};
      ctx.restore();
    }

  }else if(mode==='game' && game){
    // w trybie gry: oczy nie są rysowane — wyczyść overlay, by nic nie „zostawało”
    eyeCtx.clearRect(0,0, eyeLayer.width, eyeLayer.height);

    if(game.type==='sky')        drawSky(W,H);
    else if(game.type==='cave')  drawCave(W,H);
    else if(game.type==='meadow')drawMeadow(W,H);
    else if(game.type==='bubbles')drawBubbles(W,H);

    drawHUDGame(W,H);
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Auto-save + postęp w tle/po powrocie
const AUTO_SAVE_MS = 5000;
setInterval(saveState, AUTO_SAVE_MS);

document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){
    saveState();
  }else{
    const now = Date.now();
    const deltaSec = Math.max(0, (now - lastSavedAt)/1000);
    applyProgress(deltaSec, { sleeping });
    lastSavedAt = now;
    saveState();
    updateStatsUI();
    syncUIFromState();
  }
});
addEventListener('pagehide', saveState);
addEventListener('beforeunload', saveState);
