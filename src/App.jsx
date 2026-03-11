import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCP5xnQQ3v4rUO1yXvL12EKQtU_H6w92_4",
  authDomain: "fitness-1d26f.firebaseapp.com",
  projectId: "fitness-1d26f",
  storageBucket: "fitness-1d26f.firebasestorage.app",
  messagingSenderId: "458920870633",
  appId: "1:458920870633:web:15cbb3f56370801a09e678",
  measurementId: "G-WTN3BEDY53"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const exercisesCol = collection(db, "exercises");
const plansCol = collection(db, "plans");
const logsCol = collection(db, "logs");

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`;

const CSS = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0a;
  --bg2: #141414;
  --bg3: #1c1c1c;
  --surface: #181818;
  --surface2: #222222;
  --border: #2a2a2a;
  --border2: #333333;
  --text: #f0f0f0;
  --text2: #888888;
  --text3: #555555;
  --white: #f0f0f0;
  --accent: #f0f0f0;
  --accent-dim: #2a2a2a;
  --green: #4ade80;
  --green-dim: #14261e;
  --red: #f87171;
  --red-dim: #2a1414;
  --orange: #fb923c;
  --orange-dim: #2a1a0a;
  --radius-sm: 8px; --radius: 12px; --radius-lg: 14px; --radius-xl: 20px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow: 0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.7);
  --font: 'Inter', system-ui, sans-serif;
  --tab-h: 68px;
  --header-h: 56px;
}
html { font-size: 16px; overflow-x: hidden; }
body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; -webkit-font-smoothing: antialiased; overscroll-behavior: none; overflow-x: hidden; width: 100%; }

/* ── App Shell ── */
.app { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; width: 100%; position: relative; background: var(--bg); }
.main-scroll { flex: 1; overflow-y: auto; padding-bottom: calc(var(--tab-h) + 16px); -webkit-overflow-scrolling: touch; width: 100%; }

/* ── Top Header ── */
.top-header { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); padding: 0 16px; height: var(--header-h); display: flex; align-items: center; justify-content: space-between; }
.header-logo { display: flex; align-items: center; gap: 9px; }
.header-logo-icon { width: 28px; height: 28px; background: var(--text); border-radius: 7px; display: flex; align-items: center; justify-content: center; }
.header-logo-text { font-size: 16px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); }

/* ── Bottom Tab Bar ── */
.tab-bar { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; height: var(--tab-h); background: rgba(10,10,10,0.96); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: stretch; padding: 0; padding-bottom: env(safe-area-inset-bottom); z-index: 200; }
.tab-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 6px 2px; border-radius: 0; cursor: pointer; transition: all 0.15s; flex: 1 1 0; min-width: 0; border: none; background: none; font-family: var(--font); -webkit-tap-highlight-color: transparent; }
.tab-item:active { opacity: 0.6; }
.tab-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tab-icon svg { width: 19px; height: 19px; stroke: var(--text3); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; transition: stroke 0.15s; }
.tab-item.active .tab-icon svg { stroke: var(--text); }
.tab-label { font-size: 9px; font-weight: 600; color: var(--text3); letter-spacing: 0; transition: color 0.15s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center; }
.tab-item.active .tab-label { color: var(--text); }
.tab-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text); margin-top: 1px; flex-shrink: 0; }

/* ── Page ── */
.page { padding: 20px 16px 8px; width: 100%; box-sizing: border-box; overflow-x: hidden; }
.page-title { font-size: 26px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 3px; color: var(--text); }
.page-title em { font-style: normal; color: var(--text2); font-weight: 500; }
.page-desc { font-size: 13px; color: var(--text3); margin-bottom: 20px; }

/* ── Cards ── */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; }
.card + .card { margin-top: 8px; }

/* ── Stat row ── */
.stat-row { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 8px; margin-bottom: 16px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; }
.stat-label { font-size: 11px; font-weight: 600; color: var(--text3); letter-spacing: 0.5px; margin-bottom: 6px; text-transform: uppercase; }
.stat-val { font-size: 26px; font-weight: 800; letter-spacing: -1px; line-height: 1; color: var(--text); }
.stat-val.blue { color: var(--text); }
.stat-val.green { color: var(--green); }
.stat-val.orange { color: var(--text2); }
.stat-sub { font-size: 11px; color: var(--text3); margin-top: 3px; }

/* ── Buttons ── */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--font); font-size: 14px; font-weight: 600; border: none; border-radius: var(--radius); cursor: pointer; transition: all 0.12s; white-space: nowrap; min-height: 44px; padding: 0 18px; -webkit-tap-highlight-color: transparent; letter-spacing: -0.1px; }
.btn:active { transform: scale(0.97); opacity: 0.8; }
.btn-primary { background: var(--text); color: var(--bg); }
.btn-blue { background: var(--text); color: var(--bg); }
.btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
.btn-ghost { background: transparent; color: var(--text2); }
.btn-danger { background: var(--red-dim); color: var(--red); border: 1px solid #3a1a1a; }
.btn-green { background: var(--green-dim); color: var(--green); border: 1px solid #1a3a22; }
.btn-full { width: 100%; }
.btn-sm { min-height: 36px; padding: 0 12px; font-size: 13px; border-radius: var(--radius-sm); }
.btn-xs { min-height: 30px; padding: 0 10px; font-size: 12px; border-radius: 6px; }
.btn-icon-round { width: 40px; height: 40px; min-height: 40px; padding: 0; border-radius: 50%; flex-shrink: 0; }

/* ── Inputs ── */
.input { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 16px; padding: 11px 13px; width: 100%; transition: border-color 0.12s, box-shadow 0.12s; outline: none; -webkit-appearance: none; }
.input:focus { border-color: var(--text3); box-shadow: 0 0 0 3px rgba(255,255,255,0.06); background: var(--bg3); }
.input::placeholder { color: var(--text3); }
.input-label { font-size: 12px; font-weight: 600; color: var(--text3); margin-bottom: 6px; letter-spacing: 0.3px; text-transform: uppercase; }
.input-group { margin-bottom: 14px; }
.select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23555' d='M5 7L0 2h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
.search-wrap { position: relative; margin-bottom: 12px; }
.search-wrap .input { padding-left: 40px; }
.search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; display: flex; }

/* ── Tags — all monochrome ── */
.tag { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 600; white-space: nowrap; letter-spacing: 0.2px; background: var(--bg3); color: var(--text2); border: 1px solid var(--border2); }
.tag-chest,.tag-back,.tag-legs,.tag-shoulders,.tag-arms,.tag-core,.tag-cardio,.tag-other { background: var(--bg3); color: var(--text2); border: 1px solid var(--border2); }

/* ── Filter chips ── */
.chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 14px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.chips::-webkit-scrollbar { display: none; }
.chip { background: transparent; border: 1px solid var(--border2); color: var(--text3); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: var(--font); transition: all 0.1s; min-height: 36px; display: flex; align-items: center; -webkit-tap-highlight-color: transparent; flex-shrink: 0; }
.chip:active { opacity: 0.7; }
.chip.active { background: var(--text); color: var(--bg); border-color: var(--text); }

/* ── Exercise card ── */
.ex-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; transition: all 0.12s; -webkit-tap-highlight-color: transparent; }
.ex-card:active { opacity: 0.7; }
.ex-card.selected { border-color: var(--text2); background: var(--surface2); }
.ex-card + .ex-card { margin-top: 8px; }
.ex-name { font-size: 15px; font-weight: 700; margin-bottom: 5px; color: var(--text); }
.ex-meta { font-size: 12px; color: var(--text3); }

/* ── Sets input row ── */
.set-row { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.set-row:last-child { border-bottom: none; }
.set-num-badge { width: 28px; height: 28px; background: var(--bg3); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--text3); flex-shrink: 0; }
.set-input { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 17px; font-weight: 700; padding: 8px 6px; text-align: center; width: 72px; outline: none; transition: border-color 0.12s; -webkit-appearance: none; flex-shrink: 0; }
.set-input:focus { border-color: var(--text3); background: var(--bg3); }
.set-input::placeholder { color: var(--text3); font-weight: 400; }
.set-x { color: var(--text3); font-size: 14px; font-weight: 500; flex-shrink: 0; }
.set-vol { font-size: 12px; color: var(--text3); font-weight: 600; margin-left: auto; flex-shrink: 0; min-width: 44px; text-align: right; }
.set-done-btn { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid var(--border2); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.12s; flex-shrink: 0; -webkit-tap-highlight-color: transparent; }
.set-done-btn.done { background: var(--green-dim); border-color: var(--green); }
.set-done-btn svg { width: 14px; height: 14px; stroke: var(--text3); fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.set-done-btn.done svg { stroke: var(--green); }

/* ── Log exercise block ── */
.log-block { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 10px; overflow: hidden; }
.log-block-header { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
.log-block-body { padding: 0 16px 14px; }
.log-block-name { font-size: 16px; font-weight: 700; color: var(--text); }

/* ── Plan card ── */
.plan-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 10px; }
.plan-name { font-size: 17px; font-weight: 800; margin-bottom: 3px; letter-spacing: -0.4px; color: var(--text); }
.plan-desc { font-size: 13px; color: var(--text3); margin-bottom: 12px; }

/* ── Section header ── */
.section-head { font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 10px; letter-spacing: 0.6px; text-transform: uppercase; }

/* ── Progress bar ── */
.prog-wrap { height: 3px; background: var(--bg3); border-radius: 2px; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; background: var(--text2); }

/* ── Chart ── */
.chart-wrap { display: flex; align-items: flex-end; gap: 4px; height: 80px; }
.chart-col { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; }
.chart-bar { width: 100%; border-radius: 2px 2px 0 0; min-height: 3px; transition: height 0.4s ease; }
.chart-lbl { font-size: 8px; color: var(--text3); margin-top: 4px; font-weight: 600; }
.chart-val-lbl { font-size: 8px; color: var(--text2); margin-bottom: 2px; font-weight: 700; }

/* ── Modal / Sheet ── */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 500; display: flex; align-items: flex-end; backdrop-filter: blur(6px); }
.sheet { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl) var(--radius-xl) 0 0; width: 100%; max-height: 92vh; overflow-y: auto; padding: 20px 16px 40px; box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease; }
.sheet-handle { width: 36px; height: 3px; background: var(--border2); border-radius: 2px; margin: 0 auto 20px; }
.sheet-title { font-size: 20px; font-weight: 800; margin-bottom: 20px; letter-spacing: -0.5px; color: var(--text); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

/* ── Timer pill ── */
.timer-fab { position: fixed; bottom: calc(var(--tab-h) + 12px); right: 16px; z-index: 300; }
.timer-bubble { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; width: 158px; }
.timer-bubble.running { border-color: var(--border2); }
.timer-bubble.warning { border-color: var(--orange); }
.timer-bubble.done { border-color: var(--green); }
.timer-strip { height: 2px; background: var(--bg3); }
.timer-strip-fill { height: 100%; transition: width 0.9s linear; background: var(--text2); }
.timer-strip-fill.warning { background: var(--orange); }
.timer-strip-fill.done { background: var(--green); }
.timer-inner { padding: 10px 12px; }
.timer-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.timer-lbl { font-size: 9px; font-weight: 700; color: var(--text3); letter-spacing: 0.8px; text-transform: uppercase; }
.timer-dig { font-size: 34px; font-weight: 800; letter-spacing: -2px; text-align: center; line-height: 1; margin-bottom: 8px; color: var(--text); font-variant-numeric: tabular-nums; }
.timer-dig.warning { color: var(--orange); }
.timer-dig.done { color: var(--green); }
.timer-btns { display: flex; gap: 4px; margin-bottom: 6px; }
.timer-presets-row { display: flex; gap: 3px; flex-wrap: wrap; }
.tpreset { background: var(--bg3); border: 1px solid var(--border); color: var(--text3); border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer; font-family: var(--font); -webkit-tap-highlight-color: transparent; }
.tpreset:active { background: var(--bg2); color: var(--text); }
.timer-collapsed-pill { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; padding: 9px 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: var(--shadow); -webkit-tap-highlight-color: transparent; }
.timer-collapsed-time { font-size: 17px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }

/* ── Toast ── */
.toast { position: fixed; top: calc(var(--header-h) + 8px); left: 50%; transform: translateX(-50%); z-index: 999; background: var(--surface2); color: var(--text); border: 1px solid var(--border2); border-radius: var(--radius); padding: 12px 20px; font-size: 13px; font-weight: 600; box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 8px; animation: toastIn 0.2s ease; white-space: nowrap; max-width: calc(100vw - 32px); }
@keyframes toastIn { from { transform: translateX(-50%) translateY(-8px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

/* ── Loading ── */
.loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: var(--bg); gap: 14px; }
.spinner { width: 28px; height: 28px; border: 2px solid var(--border); border-top-color: var(--text2); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty state ── */
.empty { display: flex; flex-direction: column; align-items: center; padding: 52px 24px; text-align: center; }
.empty-icon { margin-bottom: 14px; opacity: 0.3; }
.empty-title { font-size: 16px; font-weight: 700; color: var(--text2); margin-bottom: 4px; }
.empty-desc { font-size: 13px; color: var(--text3); }

/* ── History ── */
.hist-date { font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.6px; text-transform: uppercase; padding: 8px 0 6px; border-bottom: 1px solid var(--border); margin-bottom: 8px; }

/* ── Flex utils ── */
.row { display: flex; align-items: center; }
.row-between { display: flex; align-items: center; justify-content: space-between; }
.col { display: flex; flex-direction: column; }
.gap-4{gap:4px}.gap-6{gap:6px}.gap-8{gap:8px}.gap-10{gap:10px}.gap-12{gap:12px}
.mb-8{margin-bottom:8px}.mb-12{margin-bottom:12px}.mb-16{margin-bottom:16px}.mb-20{margin-bottom:20px}
.mt-8{margin-top:8px}.mt-12{margin-top:12px}.mt-16{margin-top:16px}
.w-full{width:100%} .text-sm{font-size:13px} .text-xs{font-size:12px} .text-muted{color:var(--text3)}
.fw-700{font-weight:700} .fw-600{font-weight:600}

/* ── Desktop ── */
@media(min-width:640px){
  body { background: #050505; }
}
`;

const MUSCLE_GROUPS = ["chest","back","legs","shoulders","arms","core","cardio","other"];
const DEFAULT_EXERCISES = [
  {name:"Bench Press",muscle:"chest",equipment:"barbell",notes:""},
  {name:"Incline Dumbbell Press",muscle:"chest",equipment:"dumbbell",notes:""},
  {name:"Cable Fly",muscle:"chest",equipment:"cable",notes:""},
  {name:"Pull-Up",muscle:"back",equipment:"bodyweight",notes:""},
  {name:"Barbell Row",muscle:"back",equipment:"barbell",notes:""},
  {name:"Lat Pulldown",muscle:"back",equipment:"cable",notes:""},
  {name:"Squat",muscle:"legs",equipment:"barbell",notes:""},
  {name:"Romanian Deadlift",muscle:"legs",equipment:"barbell",notes:""},
  {name:"Leg Press",muscle:"legs",equipment:"machine",notes:""},
  {name:"Overhead Press",muscle:"shoulders",equipment:"barbell",notes:""},
  {name:"Lateral Raise",muscle:"shoulders",equipment:"dumbbell",notes:""},
  {name:"Barbell Curl",muscle:"arms",equipment:"barbell",notes:""},
  {name:"Tricep Pushdown",muscle:"arms",equipment:"cable",notes:""},
  {name:"Plank",muscle:"core",equipment:"bodyweight",notes:""},
  {name:"Deadlift",muscle:"back",equipment:"barbell",notes:""},
];

const uid = () => Math.random().toString(36).slice(2,10);
const fmtDate = d => new Date(d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fmtDateFull = d => new Date(d).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,2500); return()=>clearTimeout(t); },[]);
  return <div className="toast"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> {msg}</div>;
}

// ── Timer ────────────────────────────────────────────────────────────────────
function Timer() {
  const [secs,setSecs]=useState(90);
  const [rem,setRem]=useState(90);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(running&&rem>0){ ref.current=setInterval(()=>setRem(r=>{ if(r<=1){setRunning(false);setDone(true);clearInterval(ref.current);return 0;} return r-1; }),1000); }
    return()=>clearInterval(ref.current);
  },[running]);
  const start=()=>{setDone(false);setRunning(true);};
  const pause=()=>{setRunning(false);clearInterval(ref.current);};
  const reset=()=>{setRunning(false);setDone(false);setRem(secs);clearInterval(ref.current);};
  const preset=s=>{setSecs(s);setRem(s);setRunning(false);setDone(false);clearInterval(ref.current);};
  const pct=rem/secs;
  const cls=done?"done":pct<=0.25?"warning":running?"running":"";

  if(!open) return (
    <div className="timer-fab">
      <div className="timer-collapsed-pill" onClick={()=>setOpen(true)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
        <span className="timer-collapsed-time" style={{color:done?"#4ade80":pct<=0.25?"#fb923c":running?"#60a5fa":"white"}}>{fmtTime(rem)}</span>
      </div>
    </div>
  );

  return (
    <div className="timer-fab">
      <div className={`timer-bubble ${cls}`}>
        <div className="timer-strip"><div className={`timer-strip-fill ${cls}`} style={{width:`${pct*100}%`}}/></div>
        <div className="timer-inner">
          <div className="timer-top">
            <span className="timer-lbl">Rest Timer</span>
            <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--text3)",fontSize:16,padding:0,lineHeight:1}} onClick={()=>setOpen(false)}>×</button>
          </div>
          <div className={`timer-dig ${cls}`}>{fmtTime(rem)}</div>
          <div className="timer-btns">
            {!running?<button className="btn btn-primary btn-sm w-full" style={{fontSize:13}} onClick={start}>{done?"Restart":"Start"}</button>
              :<button className="btn btn-secondary btn-sm w-full" style={{fontSize:13}} onClick={pause}>Pause</button>}
            <button className="btn btn-secondary btn-sm btn-icon-round" style={{minHeight:36,width:36,height:36}} onClick={reset}><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/><path d='M3 3v5h5'/></svg></button>
          </div>
          <div className="timer-presets-row">
            {[30,60,90,120,180].map(s=><button key={s} className="tpreset" onClick={()=>preset(s)}>{s<60?`${s}s`:`${s/60}m`}</button>)}
          </div>
          <div className="row gap-6 mt-8">
            <input type="number" className="input" style={{width:60,padding:"5px 8px",fontSize:13,textAlign:"center"}} value={secs} min={5} max={3600}
              onChange={e=>{const v=Number(e.target.value);setSecs(v);setRem(v);setDone(false);setRunning(false);}}/>
            <span className="text-xs text-muted">sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ exercises, logs, plans, setPage }) {
  const now=new Date();
  const wkAgo=new Date(now); wkAgo.setDate(now.getDate()-7);
  const weekLogs=logs.filter(l=>new Date(l.date)>=wkAgo);
  const totalVol=logs.reduce((a,l)=>a+(l.exercises||[]).reduce((b,e)=>b+(e.sets||[]).reduce((c,s)=>c+(s.weight*s.reps),0),0),0);
  const weekVol=weekLogs.reduce((a,l)=>a+(l.exercises||[]).reduce((b,e)=>b+(e.sets||[]).reduce((c,s)=>c+(s.weight*s.reps),0),0),0);
  const muscleFreq={};
  logs.forEach(l=>(l.exercises||[]).forEach(e=>{muscleFreq[e.muscle]=(muscleFreq[e.muscle]||0)+1;}));
  const topMuscles=Object.entries(muscleFreq).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxFreq=topMuscles[0]?.[1]||1;
  const recent=logs.slice(0,3);
  const days7=[...Array(7)].map((_,i)=>{const d=new Date(now);d.setDate(d.getDate()-6+i);return d.toISOString().split("T")[0];});

  return (
    <div className="page">
      <div className="page-title">Good {now.getHours()<12?"Morning":now.getHours()<17?"Afternoon":"Evening"} <em>Athlete</em></div>
      <div className="page-desc">{fmtDateFull(now)}</div>

      <div className="stat-row">
        <div className="stat-card"><div className="stat-label">This Week</div><div className="stat-val blue">{weekLogs.length}</div><div className="stat-sub">sessions</div></div>
        <div className="stat-card"><div className="stat-label">Week Volume</div><div className="stat-val green">{(weekVol/1000).toFixed(1)}k</div><div className="stat-sub">kg lifted</div></div>
        <div className="stat-card"><div className="stat-label">All Time</div><div className="stat-val">{logs.length}</div><div className="stat-sub">workouts</div></div>
        <div className="stat-card"><div className="stat-label">Total Volume</div><div className="stat-val orange">{(totalVol/1000).toFixed(1)}k</div><div className="stat-sub">kg total</div></div>
      </div>

      {/* Weekly activity */}
      <div className="card mb-12">
        <div className="section-head">Weekly Activity</div>
        <div style={{display:"flex",gap:6,alignItems:"flex-end",height:52}}>
          {days7.map(d=>{
            const count=logs.filter(l=>l.date===d).length;
            return <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:"100%",background:count>0?"var(--text2)":"var(--bg3)",borderRadius:3,height:count>0?Math.max(count*16,10):6,transition:"height 0.3s"}}/>
              <div style={{fontSize:9,color:"var(--text3)",fontWeight:700}}>{"SMTWTFS"[new Date(d).getDay()]}</div>
            </div>;
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="section-head">Quick Actions</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {[
          {label:"Log Workout",page:"log",svg:<><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>},
          {label:"New Plan",page:"plans",svg:<><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></>},
          {label:"Add Exercise",page:"library",svg:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>},
          {label:"View Progress",page:"progress",svg:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>},
        ].map(a=>(
          <button key={a.label} className="btn btn-secondary" style={{justifyContent:"flex-start",gap:10,padding:"14px 14px"}} onClick={()=>setPage(a.page)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{a.svg}</svg>
            <span style={{fontSize:13,fontWeight:700}}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="section-head">Recent Sessions</div>
      {recent.length===0?(<div style={{textAlign:"center",padding:"20px 0",color:"var(--text3)",fontSize:13}}>No workouts yet — start logging!</div>):recent.map(l=>{
        const vol=(l.exercises||[]).reduce((a,e)=>a+(e.sets||[]).reduce((b,s)=>b+(s.weight*s.reps),0),0);
        return (
          <div key={l.id} className="card mb-8 row-between">
            <div><div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{(l.exercises||[]).map(e=>e.name).join(", ").slice(0,32)}{(l.exercises||[]).map(e=>e.name).join(", ").length>32?"…":""}</div><div className="text-xs text-muted">{fmtDate(l.date)} · {(l.exercises||[]).length} exercises</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800}}>{vol.toFixed(0)}</div><div className="text-xs text-muted">kg vol</div></div>
          </div>
        );
      })}

      {/* Muscle focus */}
      {topMuscles.length>0&&<>
        <div className="section-head mt-16">Muscle Focus</div>
        <div className="card">
          {topMuscles.map(([m,c])=>(
            <div key={m} style={{marginBottom:10}}>
              <div className="row-between mb-4"><span className={`tag tag-${m}`}>{m}</span><span className="text-xs text-muted fw-700">{c}×</span></div>
              <div className="prog-wrap"><div className="prog-fill" style={{width:`${(c/maxFreq)*100}%`}}/></div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ── Exercise Library ──────────────────────────────────────────────────────────
function Library({ exercises, notify }) {
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [sheet,setSheet]=useState(false);
  const [editEx,setEditEx]=useState(null);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({name:"",muscle:"chest",equipment:"barbell",notes:""});

  const filtered=exercises.filter(e=>(filter==="all"||e.muscle===filter)&&e.name.toLowerCase().includes(search.toLowerCase()));
  const openAdd=()=>{setEditEx(null);setForm({name:"",muscle:"chest",equipment:"barbell",notes:""});setSheet(true);};
  const openEdit=e=>{setEditEx(e);setForm({name:e.name,muscle:e.muscle,equipment:e.equipment,notes:e.notes});setSheet(true);};
  const save=async()=>{
    if(!form.name.trim())return; setSaving(true);
    try{
      if(editEx){await updateDoc(doc(db,"exercises",editEx.id),{...form,updatedAt:serverTimestamp()});notify("Exercise updated");}
      else{await addDoc(exercisesCol,{...form,createdAt:serverTimestamp()});notify("Exercise added");}
      setSheet(false);
    }catch{notify("Error saving");}
    setSaving(false);
  };
  const del=async(id,e)=>{e.stopPropagation();try{await deleteDoc(doc(db,"exercises",id));notify("Removed");}catch{notify("Error");}};

  return (
    <div className="page">
      <div className="row-between mb-4">
        <div><div className="page-title">Exercise <em>Library</em></div><div className="page-desc">{exercises.length} exercises</div></div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add</button>
      </div>

      <div className="search-wrap">
        <span className="search-icon"><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='7'/><line x1='16.5' y1='16.5' x2='21' y2='21'/></svg></span>
        <input className="input" placeholder="Search exercises…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="chips">
        {["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`chip ${filter===g?"active":""}`} onClick={()=>setFilter(g)}>{g==="all"?"All":g.charAt(0).toUpperCase()+g.slice(1)}</button>)}
      </div>

      {filtered.length===0?(<div className="empty"><div className="empty-icon"><svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><line x1='6' y1='12' x2='18' y2='12'/><line x1='6' y1='9' x2='6' y2='15'/><line x1='18' y1='9' x2='18' y2='15'/><line x1='3' y1='10' x2='3' y2='14'/><line x1='21' y1='10' x2='21' y2='14'/></svg></div><div className="empty-title">No exercises found</div></div>):(
        filtered.map(e=>(
          <div key={e.id} className="ex-card" onClick={()=>openEdit(e)}>
            <div className="row-between mb-6">
              <span className={`tag tag-${e.muscle}`}>{e.muscle}</span>
              <button className="btn btn-ghost btn-xs" style={{color:"var(--red)",minHeight:28}} onClick={ev=>del(e.id,ev)}><svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='3 6 5 6 21 6'/><path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/><path d='M10 11v6'/><path d='M14 11v6'/><path d='M9 6V4h6v2'/></svg></button>
            </div>
            <div className="ex-name">{e.name}</div>
            <div className="ex-meta">{e.equipment}{e.notes?` · ${e.notes}`:""}</div>
          </div>
        ))
      )}

      {sheet&&(
        <div className="overlay" onClick={e=>e.target.classList.contains("overlay")&&setSheet(false)}>
          <div className="sheet">
            <div className="sheet-handle"/>
            <div className="sheet-title">{editEx?"Edit Exercise":"New Exercise"}</div>
            <div className="input-group"><div className="input-label">Name</div><input className="input" placeholder="e.g. Incline Bench Press" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} autoFocus/></div>
            <div className="input-group"><div className="input-label">Muscle Group</div><select className="input select" value={form.muscle} onChange={e=>setForm(f=>({...f,muscle:e.target.value}))}>{MUSCLE_GROUPS.map(g=><option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}</select></div>
            <div className="input-group"><div className="input-label">Equipment</div><select className="input select" value={form.equipment} onChange={e=>setForm(f=>({...f,equipment:e.target.value}))}>{["barbell","dumbbell","cable","machine","bodyweight","kettlebell","band","other"].map(eq=><option key={eq} value={eq}>{eq}</option>)}</select></div>
            <div className="input-group"><div className="input-label">Notes (optional)</div><input className="input" placeholder="Tips, cues…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-secondary btn-full" onClick={()=>setSheet(false)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>{saving?"Saving…":editEx?"Save":"Add Exercise"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Plans ─────────────────────────────────────────────────────────────────────
function Plans({ exercises, plans, notify }) {
  const [view,setView]=useState("list");
  const [editPlan,setEditPlan]=useState(null);
  const [name,setName]=useState(""); const [desc,setDesc]=useState(""); const [planEx,setPlanEx]=useState([]);
  const [exSheet,setExSheet]=useState(false);
  const [search,setSearch]=useState(""); const [exFilter,setExFilter]=useState("all");
  const [saving,setSaving]=useState(false);

  const filteredEx=exercises.filter(e=>(exFilter==="all"||e.muscle===exFilter)&&e.name.toLowerCase().includes(search.toLowerCase()));
  const newPlan=()=>{setEditPlan(null);setName("");setDesc("");setPlanEx([]);setView("edit");};
  const openPlan=p=>{setEditPlan(p);setName(p.name);setDesc(p.desc||"");setPlanEx(p.exercises||[]);setView("edit");};
  const savePlan=async()=>{
    if(!name.trim())return; setSaving(true);
    try{
      const data={name,desc,exercises:planEx,updatedAt:serverTimestamp()};
      if(editPlan){await updateDoc(doc(db,"plans",editPlan.id),data);notify("Plan updated");}
      else{await addDoc(plansCol,{...data,createdAt:serverTimestamp()});notify("Plan created");}
      setView("list");
    }catch{notify("Error saving plan");}
    setSaving(false);
  };
  const delPlan=async id=>{try{await deleteDoc(doc(db,"plans",id));notify("Plan deleted");}catch{notify("Error");}};
  const addEx=ex=>{if(planEx.find(pe=>pe.exId===ex.id))return;setPlanEx(pe=>[...pe,{id:uid(),exId:ex.id,sets:3,reps:"8–12",rest:90}]);};
  const removeEx=id=>setPlanEx(pe=>pe.filter(e=>e.id!==id));
  const updateEx=(id,f,v)=>setPlanEx(pe=>pe.map(e=>e.id===id?{...e,[f]:v}:e));

  if(view==="edit") return (
    <div className="page">
      <div className="row gap-10 mb-16">
        <button className="btn btn-ghost btn-sm" style={{padding:'0 8px'}} onClick={()=>setView('list')}><svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='15 18 9 12 15 6'/></svg></button>
        <div style={{fontSize:20,fontWeight:800}}>{editPlan?"Edit Plan":"New Plan"}</div>
      </div>

      <div className="input-group"><div className="input-label">Plan Name</div><input className="input" placeholder="e.g. Push Day A" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
      <div className="input-group"><div className="input-label">Description</div><input className="input" placeholder="Notes, focus…" value={desc} onChange={e=>setDesc(e.target.value)}/></div>

      <div className="row-between mb-10 mt-8">
        <div className="section-head" style={{marginBottom:0}}>Exercises ({planEx.length})</div>
        <button className="btn btn-blue btn-sm" onClick={()=>setExSheet(true)}>+ Add</button>
      </div>

      {planEx.length===0&&<div className="card" style={{textAlign:"center",padding:"24px",color:"var(--text3)",fontSize:14}}>Tap "Add" to pick exercises</div>}
      {planEx.map((pe,idx)=>{
        const ex=exercises.find(e=>e.id===pe.exId);
        return (
          <div key={pe.id} className="card mb-8">
            <div className="row-between mb-10">
              <div><div style={{fontWeight:700,fontSize:15}}>{ex?.name}</div><span className={`tag tag-${ex?.muscle}`} style={{marginTop:4,display:"inline-block"}}>{ex?.muscle}</span></div>
              <button className="btn btn-danger btn-xs" onClick={()=>removeEx(pe.id)}>Remove</button>
            </div>
            <div style={{display:"flex",gap:8}}>
              {[["sets","Sets"],["reps","Reps"],["rest","Rest(s)"]].map(([f,l])=>(
                <div key={f} style={{flex:1}}>
                  <div className="input-label">{l}</div>
                  <input type={f==="reps"?"text":"number"} className="input" style={{textAlign:"center",padding:"8px 6px"}} value={pe[f]} onChange={e=>updateEx(pe.id,f,f==="reps"?e.target.value:Number(e.target.value))}/>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button className="btn btn-secondary btn-full" onClick={()=>setView("list")}>Cancel</button>
        <button className="btn btn-primary btn-full" onClick={savePlan} disabled={saving}>{saving?"Saving…":"Save Plan"}</button>
      </div>

      {exSheet&&(
        <div className="overlay" onClick={e=>e.target.classList.contains("overlay")&&setExSheet(false)}>
          <div className="sheet">
            <div className="sheet-handle"/>
            <div style={{fontSize:18,fontWeight:800,marginBottom:12}}>Add Exercises</div>
            <div className="search-wrap"><span className="search-icon"><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='7'/><line x1='16.5' y1='16.5' x2='21' y2='21'/></svg></span><input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <div className="chips">{["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`chip ${exFilter===g?"active":""}`} onClick={()=>setExFilter(g)}>{g==="all"?"All":g}</button>)}</div>
            {filteredEx.map(e=>{
              const added=!!planEx.find(pe=>pe.exId===e.id);
              return (
                <div key={e.id} className={`ex-card ${added?"selected":""}`} onClick={()=>addEx(e)} style={{marginBottom:6}}>
                  <div className="row-between">
                    <div><div style={{fontSize:14,fontWeight:700}}>{e.name}</div><div className="row gap-6 mt-4"><span className={`tag tag-${e.muscle}`}>{e.muscle}</span><span className="text-xs text-muted">{e.equipment}</span></div></div>
                    {added?<span style={{color:'var(--green)',display:'flex'}}><svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'/></svg></span>:<span style={{color:'var(--text3)',display:'flex'}}><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg></span>}
                  </div>
                </div>
              );
            })}
            <button className="btn btn-primary btn-full mt-16" onClick={()=>setExSheet(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="row-between mb-4">
        <div><div className="page-title">Workout <em>Plans</em></div><div className="page-desc">{plans.length} routines</div></div>
        <button className="btn btn-primary btn-sm" onClick={newPlan}>+ New</button>
      </div>

      {plans.length===0?(<div className="empty"><div className="empty-icon"><svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><rect x='4' y='2' width='16' height='20' rx='2'/><line x1='8' y1='7' x2='16' y2='7'/><line x1='8' y1='11' x2='16' y2='11'/><line x1='8' y1='15' x2='12' y2='15'/></svg></div><div className="empty-title">No plans yet</div><div className="empty-desc">Create your first workout routine</div></div>):(
        plans.map(p=>(
          <div key={p.id} className="plan-card">
            <div className="row-between mb-4">
              <div className="plan-name">{p.name}</div>
              <button className="btn btn-ghost btn-xs" style={{color:"var(--red)",minHeight:28}} onClick={()=>delPlan(p.id)}><svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='3 6 5 6 21 6'/><path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/><path d='M10 11v6'/><path d='M14 11v6'/><path d='M9 6V4h6v2'/></svg></button>
            </div>
            {p.desc&&<div className="plan-desc">{p.desc}</div>}
            <div style={{marginBottom:12}}>
              {(p.exercises||[]).slice(0,3).map(pe=>{const ex=exercises.find(e=>e.id===pe.exId);return ex?(<div key={pe.id} className="row-between" style={{fontSize:13,paddingBottom:4}}><span className="text-muted">{ex.name}</span><span className="text-xs text-muted fw-700">{pe.sets}×{pe.reps}</span></div>):null;})}
              {(p.exercises||[]).length>3&&<div className="text-xs text-muted">+{p.exercises.length-3} more</div>}
            </div>
            <div className="row gap-8">
              <button className="btn btn-secondary btn-sm btn-full" onClick={()=>openPlan(p)}>Edit</button>
              <span className="text-xs text-muted" style={{whiteSpace:"nowrap"}}>{(p.exercises||[]).length} exercises</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Log Workout ───────────────────────────────────────────────────────────────
function LogWorkout({ exercises, plans, notify }) {
  const [step,setStep]=useState("pick");
  const [source,setSource]=useState("plan");
  const [selPlan,setSelPlan]=useState(null);
  const [session,setSession]=useState([]);
  const [date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [saving,setSaving]=useState(false);
  const [addSheet,setAddSheet]=useState(false);

  const filteredEx=exercises.filter(e=>(filter==="all"||e.muscle===filter)&&e.name.toLowerCase().includes(search.toLowerCase()));
  const startPlan=p=>{setSelPlan(p);setSession((p.exercises||[]).map(pe=>{const ex=exercises.find(e=>e.id===pe.exId);return{id:uid(),exId:pe.exId,name:ex?.name??"Unknown",muscle:ex?.muscle??"other",sets:Array.from({length:pe.sets},()=>({id:uid(),weight:"",reps:"",done:false})),note:""};
  }));setStep("log");};
  const addFreeEx=ex=>{if(session.find(s=>s.exId===ex.id))return;setSession(s=>[...s,{id:uid(),exId:ex.id,name:ex.name,muscle:ex.muscle,sets:[{id:uid(),weight:"",reps:"",done:false}],note:""}]);};
  const addSet=sid=>setSession(s=>s.map(se=>se.id===sid?{...se,sets:[...se.sets,{id:uid(),weight:se.sets.at(-1)?.weight??"",reps:se.sets.at(-1)?.reps??"",done:false}]}:se));
  const removeSet=(sid,setId)=>setSession(s=>s.map(se=>se.id===sid?{...se,sets:se.sets.filter(x=>x.id!==setId)}:se));
  const updSet=(sid,setId,f,v)=>setSession(s=>s.map(se=>se.id===sid?{...se,sets:se.sets.map(x=>x.id===setId?{...x,[f]:v}:x)}:se));
  const toggleDone=(sid,setId)=>setSession(s=>s.map(se=>se.id===sid?{...se,sets:se.sets.map(x=>x.id===setId?{...x,done:!x.done}:x)}:se));
  const removeEx=sid=>setSession(s=>s.filter(se=>se.id!==sid));

  const finish=async()=>{
    if(session.length===0)return; setSaving(true);
    try{
      await addDoc(logsCol,{date,planId:selPlan?.id??null,planName:selPlan?.name??null,
        exercises:session.map(se=>({exId:se.exId,name:se.name,muscle:se.muscle,note:se.note,
          sets:se.sets.filter(s=>s.weight!==""||s.reps!=="").map(s=>({weight:Number(s.weight)||0,reps:Number(s.reps)||0,done:s.done}))}))
          .filter(e=>e.sets.length>0),createdAt:serverTimestamp()});
      notify("Workout saved!");
      setSession([]);setStep("pick");setSelPlan(null);
    }catch{notify("Error saving");}
    setSaving(false);
  };

  const totalVol=session.reduce((a,se)=>a+se.sets.reduce((b,s)=>b+((Number(s.weight)||0)*(Number(s.reps)||0)),0),0);
  const doneSets=session.reduce((a,se)=>a+se.sets.filter(s=>s.done).length,0);
  const totalSets=session.reduce((a,se)=>a+se.sets.length,0);

  if(step==="pick") return (
    <div className="page">
      <div className="page-title">Log <em>Workout</em></div>
      <div className="page-desc">Record your training session</div>

      <div className="input-group mb-16">
        <div className="input-label">Date</div>
        <input type="date" className="input" value={date} onChange={e=>setDate(e.target.value)}/>
      </div>

      <div className="row gap-8 mb-20">
        <button className={`btn btn-full ${source==="plan"?"btn-primary":"btn-secondary"}`} onClick={()=>setSource("plan")}>From Plan</button>
        <button className={`btn btn-full ${source==="free"?"btn-primary":"btn-secondary"}`} onClick={()=>setSource("free")}>Freestyle</button>
      </div>

      {source==="plan"?(
        plans.length===0?(<div className="empty"><div className="empty-icon"><svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><rect x='4' y='2' width='16' height='20' rx='2'/><line x1='8' y1='7' x2='16' y2='7'/><line x1='8' y1='11' x2='16' y2='11'/><line x1='8' y1='15' x2='12' y2='15'/></svg></div><div className="empty-title">No plans yet</div><div className="empty-desc">Create a plan first</div></div>):(
          plans.map(p=>(
            <div key={p.id} className="plan-card" onClick={()=>startPlan(p)}>
              <div className="plan-name mb-4">{p.name}</div>
              {p.desc&&<div className="plan-desc">{p.desc}</div>}
              <div className="text-xs text-muted mb-12">{(p.exercises||[]).length} exercises</div>
              <button className="btn btn-blue btn-full btn-sm">Start This Plan →</button>
            </div>
          ))
        )
      ):(
        <>
          {session.length>0&&(
            <div className="card mb-12" style={{borderColor:"var(--border2)",background:"var(--surface2)"}}>
              <div className="row-between">
                <span style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{session.length} selected</span>
                <button className="btn btn-blue btn-sm" onClick={()=>setStep("log")}>Start →</button>
              </div>
            </div>
          )}
          <div className="search-wrap"><span className="search-icon"><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='7'/><line x1='16.5' y1='16.5' x2='21' y2='21'/></svg></span><input className="input" placeholder="Search exercises…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="chips">{["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`chip ${filter===g?"active":""}`} onClick={()=>setFilter(g)}>{g==="all"?"All":g}</button>)}</div>
          {filteredEx.map(e=>{const sel=!!session.find(se=>se.exId===e.id);return(
            <div key={e.id} className={`ex-card ${sel?"selected":""}`} onClick={()=>addFreeEx(e)} style={{marginBottom:6}}>
              <div className="row-between">
                <div><div className="ex-name" style={{fontSize:14}}>{e.name}</div><span className={`tag tag-${e.muscle}`} style={{marginTop:4,display:"inline-block"}}>{e.muscle}</span></div>
                {sel?<span style={{color:'var(--green)',display:'flex'}}><svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'/></svg></span>:<span style={{color:'var(--text3)',display:'flex'}}><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg></span>}
              </div>
            </div>
          );})}
          {session.length>0&&<button className="btn btn-primary btn-full mt-16" onClick={()=>setStep("log")}>Start Logging ({session.length}) →</button>}
        </>
      )}
    </div>
  );

  return (
    <div className="page">
      {/* Session header */}
      <div className="row-between mb-16">
        <div>
          <div style={{fontSize:20,fontWeight:800,letterSpacing:-0.5}}>Active Session</div>
          <div className="text-xs text-muted">{fmtDate(date)}{selPlan?` · ${selPlan.name}`:""}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={finish} disabled={saving}>{saving?"…":"Finish 🏁"}</button>
      </div>

      {/* Session stats */}
      <div className="stat-row mb-16">
        <div className="stat-card"><div className="stat-label">Volume</div><div className="stat-val" style={{fontSize:20}}>{totalVol.toLocaleString()}<span className="text-xs text-muted"> kg</span></div></div>
        <div className="stat-card"><div className="stat-label">Sets Done</div><div className="stat-val blue" style={{fontSize:20}}>{doneSets}<span style={{fontSize:14,fontWeight:400,color:"var(--text3)"}}>/{totalSets}</span></div></div>
      </div>

      {/* Exercises */}
      {session.map(se=>(
        <div key={se.id} className="log-block">
          <div className="log-block-header">
            <div>
              <div className="log-block-name">{se.name}</div>
              <span className={`tag tag-${se.muscle}`} style={{marginTop:4,display:"inline-block"}}>{se.muscle}</span>
            </div>
            <button className="btn btn-danger btn-xs" onClick={()=>removeEx(se.id)}>Remove</button>
          </div>
          <div className="log-block-body">
            {/* Column headers */}
            <div style={{display:"grid",gridTemplateColumns:"24px 1fr 10px 1fr 40px 34px 20px",gap:4,alignItems:"center",paddingBottom:6,borderBottom:"1px solid var(--border)",marginBottom:2}}>
              <div/>
              <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text3)"}}>KG</div>
              <div/>
              <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text3)"}}>REPS</div>
              <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text3)"}}>VOL</div>
              <div/>
              <div/>
            </div>
            {se.sets.map((s,i)=>(
              <div key={s.id} style={{display:"grid",gridTemplateColumns:"24px 1fr 10px 1fr 40px 34px 20px",gap:4,alignItems:"center",padding:"6px 0",borderBottom:"1px solid var(--border)",opacity:s.done?0.45:1}}>
                <div style={{width:24,height:24,background:"var(--bg3)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--text3)"}}>#{i+1}</div>
                <input type="number" className="set-input" style={{width:"100%"}} placeholder="0" value={s.weight} min={0} step={0.5} inputMode="decimal" onChange={e=>updSet(se.id,s.id,"weight",e.target.value)}/>
                <div style={{textAlign:"center",fontSize:13,color:"var(--text3)"}}>×</div>
                <input type="number" className="set-input" style={{width:"100%"}} placeholder="0" value={s.reps} min={0} inputMode="numeric" onChange={e=>updSet(se.id,s.id,"reps",e.target.value)}/>
                <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,textAlign:"center"}}>{((Number(s.weight)||0)*(Number(s.reps)||0)).toFixed(0)}</div>
                <button className={`set-done-btn ${s.done?"done":""}`} onClick={()=>toggleDone(se.id,s.id)}>{s.done?<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'/></svg>:<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='9'/></svg>}</button>
                <button style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",padding:0,fontSize:16,lineHeight:1,textAlign:"center"}} onClick={()=>removeSet(se.id,s.id)}>×</button>
              </div>
            ))}
            <button className="btn btn-secondary btn-xs mt-8" onClick={()=>addSet(se.id)} style={{fontSize:12}}>+ Add Set</button>
          </div>
        </div>
      ))}

      {/* Add exercise button during session */}
      <button className="btn btn-secondary btn-full mt-8" onClick={()=>setAddSheet(true)}>+ Add Exercise</button>

      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button className="btn btn-secondary btn-full" onClick={()=>{setStep("pick");setSession([]);setSelPlan(null);}}>Discard</button>
        <button className="btn btn-primary btn-full" onClick={finish} disabled={saving}>{saving?"Saving…":"Finish & Save"}</button>
      </div>

      {addSheet&&(
        <div className="overlay" onClick={e=>e.target.classList.contains("overlay")&&setAddSheet(false)}>
          <div className="sheet">
            <div className="sheet-handle"/>
            <div style={{fontSize:18,fontWeight:800,marginBottom:12}}>Add Exercise</div>
            <div className="search-wrap"><span className="search-icon"><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='7'/><line x1='16.5' y1='16.5' x2='21' y2='21'/></svg></span><input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <div className="chips">{["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`chip ${filter===g?"active":""}`} onClick={()=>setFilter(g)}>{g==="all"?"All":g}</button>)}</div>
            {filteredEx.map(e=>{const sel=!!session.find(se=>se.exId===e.id);return(
              <div key={e.id} className={`ex-card ${sel?"selected":""}`} onClick={()=>addFreeEx(e)} style={{marginBottom:6}}>
                <div className="row-between"><div><div style={{fontSize:14,fontWeight:700}}>{e.name}</div><span className={`tag tag-${e.muscle}`} style={{marginTop:4,display:"inline-block"}}>{e.muscle}</span></div>
                {sel?<span style={{color:'var(--green)',display:'flex'}}><svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12'/></svg></span>:<span style={{color:'var(--text3)',display:'flex'}}><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg></span>}</div>
              </div>
            );})}
            <button className="btn btn-primary btn-full mt-12" onClick={()=>setAddSheet(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Progress ──────────────────────────────────────────────────────────────────
function Progress({ exercises, logs }) {
  const [selEx,setSelEx]=useState(null);
  const [search,setSearch]=useState("");

  const exWithData=exercises.filter(ex=>logs.some(l=>l.exercises?.some(e=>e.exId===ex.id))&&ex.name.toLowerCase().includes(search.toLowerCase()));
  const getHist=exId=>logs.map(log=>{
    const ex=log.exercises?.find(e=>e.exId===exId);
    if(!ex||!ex.sets?.length)return null;
    return{date:log.date,max:Math.max(...ex.sets.map(s=>s.weight||0)),vol:ex.sets.reduce((a,s)=>a+(s.weight*s.reps),0)};
  }).filter(Boolean).sort((a,b)=>new Date(a.date)-new Date(b.date));

  const totalVol=logs.reduce((a,l)=>a+(l.exercises||[]).reduce((b,e)=>b+(e.sets||[]).reduce((c,s)=>c+(s.weight*s.reps),0),0),0);
  const wkAgo=new Date();wkAgo.setDate(wkAgo.getDate()-7);
  const thisWeek=logs.filter(l=>new Date(l.date)>=wkAgo).length;

  return (
    <div className="page">
      <div className="page-title">Progress <em>Tracker</em></div>
      <div className="page-desc">Track your strength gains</div>

      <div className="stat-row">
        <div className="stat-card"><div className="stat-label">Workouts</div><div className="stat-val">{logs.length}</div></div>
        <div className="stat-card"><div className="stat-label">This Week</div><div className="stat-val blue">{thisWeek}</div><div className="stat-sub">sessions</div></div>
        <div className="stat-card"><div className="stat-label">Total Vol</div><div className="stat-val green">{(totalVol/1000).toFixed(1)}k</div><div className="stat-sub">kg</div></div>
        <div className="stat-card"><div className="stat-label">Tracked</div><div className="stat-val orange">{exWithData.length}</div><div className="stat-sub">exercises</div></div>
      </div>

      {selEx&&(()=>{
        const hist=getHist(selEx.id);
        const maxW=Math.max(...hist.map(h=>h.max),1);
        const maxV=Math.max(...hist.map(h=>h.vol),1);
        const pr=Math.max(...hist.map(h=>h.max));
        return (
          <>
            <div className="card mb-10">
              <div className="row-between mb-12">
                <div>
                  <div style={{fontSize:16,fontWeight:800}}>{selEx.name}</div>
                  <span className={`tag tag-${selEx.muscle}`} style={{marginTop:4,display:"inline-block"}}>{selEx.muscle}</span>
                </div>
                <div style={{textAlign:"right"}}>
                  <div className="text-xs text-muted fw-700 mb-4">PERSONAL RECORD</div>
                  <div style={{fontSize:26,fontWeight:800,color:"var(--accent)",letterSpacing:-1}}>{pr}<span className="text-xs text-muted">kg</span></div>
                </div>
              </div>
              <div className="text-xs text-muted fw-700 mb-8">MAX WEIGHT</div>
              <div className="chart-wrap">
                {hist.slice(-10).map((h,i)=>(<div key={i} className="chart-col"><div className="chart-val-lbl">{h.max}</div><div className="chart-bar" style={{height:`${(h.max/maxW)*100}%`,background:"var(--accent)"}}/><div className="chart-lbl">{h.date?.slice(5)}</div></div>))}
              </div>
            </div>
            <div className="card mb-16">
              <div className="text-xs text-muted fw-700 mb-8">TOTAL VOLUME</div>
              <div className="chart-wrap">
                {hist.slice(-10).map((h,i)=>(<div key={i} className="chart-col"><div className="chart-val-lbl">{h.vol.toFixed(0)}</div><div className="chart-bar" style={{height:`${(h.vol/maxV)*100}%`,background:"var(--green)"}}/><div className="chart-lbl">{h.date?.slice(5)}</div></div>))}
              </div>
            </div>
            <button className="btn btn-secondary btn-full mb-16" onClick={()=>setSelEx(null)}><svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='15 18 9 12 15 6'/></svg> Back</button>
          </>
        );
      })()}

      <div className="section-head">{selEx?"All Sessions":"Select Exercise"}</div>
      {!selEx&&<>
        <div className="search-wrap"><span className="search-icon"><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='7'/><line x1='16.5' y1='16.5' x2='21' y2='21'/></svg></span><input className="input" placeholder="Search tracked exercises…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        {exWithData.length===0?(<div className="empty"><div className="empty-icon"><svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><polyline points='22 12 18 12 15 21 9 3 6 12 2 12'/></svg></div><div className="empty-title">No data yet</div><div className="empty-desc">Log workouts to track progress</div></div>):(
          exWithData.map(ex=>{
            const hist=getHist(ex.id);const latest=hist.at(-1);const prev=hist.at(-2);const up=latest&&prev?latest.max>prev.max:null;
            return (
              <div key={ex.id} className="card mb-8" style={{cursor:"pointer"}} onClick={()=>setSelEx(ex)}>
                <div className="row-between">
                  <div><div style={{fontWeight:700,fontSize:15}}>{ex.name}</div><span className={`tag tag-${ex.muscle}`} style={{marginTop:6,display:"inline-block"}}>{ex.muscle}</span></div>
                  <div style={{textAlign:"right"}}>
                    {latest&&<div style={{fontSize:22,fontWeight:800,letterSpacing:-0.5}}>{latest.max}<span className="text-xs text-muted">kg</span></div>}
                    {up!==null&&<div style={{fontSize:12,fontWeight:700,color:up?"var(--green)":"var(--red)"}}>{up?"↑ PR":"↓"}</div>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </>}

      {selEx&&(()=>{
        const hist=getHist(selEx.id);
        return hist.slice().reverse().map((h,i)=>(
          <div key={i} className="card mb-6 row-between">
            <span className="text-sm text-muted">{fmtDate(h.date)}</span>
            <div className="row gap-16"><span className="text-sm fw-700">Max: {h.max}kg</span><span className="text-xs text-muted">Vol: {h.vol.toFixed(0)}kg</span></div>
          </div>
        ));
      })()}
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────
function History({ logs, archivedLogs, notify }) {
  const [expanded,setExpanded]=useState(null);
  const [tab,setTab]=useState("active"); // active | trash
  const [confirmId,setConfirmId]=useState(null);

  // Soft delete — moves to archived state in Firestore
  const softDelete=async id=>{
    try{
      await updateDoc(doc(db,"logs",id),{archived:true,archivedAt:serverTimestamp()});
      notify("Moved to trash");
      setConfirmId(null);
    }catch{notify("Error");}
  };

  // Restore from trash
  const restore=async id=>{
    try{
      await updateDoc(doc(db,"logs",id),{archived:false,archivedAt:null});
      notify("Workout restored");
    }catch{notify("Error restoring");}
  };

  // Permanent delete only from trash
  const permDelete=async id=>{
    try{
      await deleteDoc(doc(db,"logs",id));
      notify("Permanently deleted");
    }catch{notify("Error");}
  };

  const activeLogs=logs.filter(l=>!l.archived);
  const grouped=activeLogs.reduce((acc,log)=>{const k=log.date;if(!acc[k])acc[k]=[];acc[k].push(log);return acc;},{});
  const dates=Object.keys(grouped).sort((a,b)=>new Date(b)-new Date(a));

  const renderLogCard=(log,inTrash=false)=>{
    const vol=(log.exercises||[]).reduce((a,e)=>a+(e.sets||[]).reduce((b,s)=>b+(s.weight*s.reps),0),0);
    const sets=(log.exercises||[]).reduce((a,e)=>a+(e.sets||[]).length,0);
    const muscles=[...new Set((log.exercises||[]).map(e=>e.muscle))];
    const isOpen=expanded===log.id;
    return (
      <div key={log.id} className="log-block mb-8" style={inTrash?{opacity:0.75}:{}}>
        <div className="log-block-header" onClick={()=>setExpanded(isOpen?null:log.id)}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(log.exercises||[]).map(e=>e.name).join(", ")}</div>
            <div className="row gap-4" style={{flexWrap:"wrap"}}>
              {muscles.map(m=><span key={m} className={`tag tag-${m}`}>{m}</span>)}
              <span className="text-xs text-muted">{sets} sets · {vol.toFixed(0)}kg</span>
            </div>
          </div>
          <div className="row gap-6" style={{marginLeft:8,flexShrink:0}}>
            {inTrash?(
              <>
                <button className="btn btn-green btn-xs" onClick={e=>{e.stopPropagation();restore(log.id);}}>Restore</button>
                <button className="btn btn-danger btn-xs" onClick={e=>{e.stopPropagation();permDelete(log.id);}}>Delete</button>
              </>
            ):(
              confirmId===log.id?(
                <>
                  <button className="btn btn-danger btn-xs" onClick={e=>{e.stopPropagation();softDelete(log.id);}}>Confirm</button>
                  <button className="btn btn-secondary btn-xs" onClick={e=>{e.stopPropagation();setConfirmId(null);}}>Cancel</button>
                </>
              ):(
                <button className="btn btn-danger btn-xs" onClick={e=>{e.stopPropagation();setConfirmId(log.id);}}><svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='3 6 5 6 21 6'/><path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/><path d='M10 11v6'/><path d='M14 11v6'/><path d='M9 6V4h6v2'/></svg></button>
              )
            )}
            <span style={{color:"var(--text3)",fontSize:14}}>{isOpen?"▲":"▼"}</span>
          </div>
        </div>
        {isOpen&&(
          <div className="log-block-body">
            {(log.exercises||[]).map((ex,i)=>(
              <div key={i} style={{marginBottom:14}}>
                <div className="row-between mb-8"><span style={{fontWeight:700,fontSize:14}}>{ex.name}</span><span className={`tag tag-${ex.muscle}`}>{ex.muscle}</span></div>
                <div style={{background:"var(--bg2)",borderRadius:"8px",overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 1fr",padding:"5px 10px",borderBottom:"1px solid var(--border)"}}>
                    {["#","KG","REPS","VOL"].map(h=><div key={h} style={{fontSize:10,fontWeight:700,color:"var(--text3)",textAlign:"center"}}>{h}</div>)}
                  </div>
                  {(ex.sets||[]).map((s,j)=>(
                    <div key={j} style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 1fr",padding:"6px 10px",borderBottom:j<ex.sets.length-1?"1px solid var(--border)":"none",alignItems:"center"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textAlign:"center"}}>#{j+1}</div>
                      <div style={{fontSize:13,fontWeight:700,textAlign:"center"}}>{s.weight}kg</div>
                      <div style={{fontSize:13,textAlign:"center"}}>{s.reps}</div>
                      <div style={{fontSize:11,color:"var(--text3)",textAlign:"center"}}>{(s.weight*s.reps).toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-title">Workout <em>History</em></div>
      <div className="page-desc">{activeLogs.length} sessions logged</div>

      {/* Tabs */}
      <div className="row gap-8 mb-16">
        <button className={`btn btn-full ${tab==="active"?"btn-primary":"btn-secondary"}`} onClick={()=>setTab("active")}>
          Active ({activeLogs.length})
        </button>
        <button className={`btn btn-full ${tab==="trash"?"btn-danger":"btn-secondary"}`} onClick={()=>setTab("trash")}>
          Trash ({archivedLogs.length})
        </button>
      </div>

      {tab==="active"&&(
        <>
          {dates.length===0?(
            <div className="empty"><div className="empty-icon"><svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg></div><div className="empty-title">No workouts yet</div><div className="empty-desc">Your logged sessions will appear here</div></div>
          ):dates.map(date=>(
            <div key={date}>
              <div className="hist-date">{fmtDate(date)}</div>
              {grouped[date].map(log=>renderLogCard(log,false))}
            </div>
          ))}
        </>
      )}

      {tab==="trash"&&(
        <>
          {archivedLogs.length===0?(
            <div className="empty"><div className="empty-icon"><svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='3 6 5 6 21 6'/><path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/><path d='M10 11v6'/><path d='M14 11v6'/><path d='M9 6V4h6v2'/></svg></div><div className="empty-title">Trash is empty</div><div className="empty-desc">Deleted workouts appear here and can be restored</div></div>
          ):(
            <>
              <div className="card mb-12" style={{background:"#fff7ed",borderColor:"#fed7aa"}}>
                <div style={{fontSize:13,color:"var(--orange)",fontWeight:600}}>⚠️ Tap Restore to recover a workout, or Delete to permanently remove it.</div>
              </div>
              {archivedLogs.map(log=>renderLogCard(log,true))}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("home");
  const [exercises,setExercises]=useState([]);
  const [plans,setPlans]=useState([]);
  const [allLogs,setAllLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const seededRef=useRef(false);
  const notify=msg=>setToast(msg);

  // Split into active and archived
  const logs=allLogs.filter(l=>!l.archived);
  const archivedLogs=allLogs.filter(l=>l.archived);

  const seedDefaults=async()=>{ for(const ex of DEFAULT_EXERCISES) await addDoc(exercisesCol,{...ex,createdAt:serverTimestamp()}); };

  useEffect(()=>{
    const unsubEx=onSnapshot(query(exercisesCol,orderBy("createdAt","asc")),snap=>{
      const data=snap.docs.map(d=>({id:d.id,...d.data()}));
      setExercises(data);
      if(data.length===0&&!seededRef.current){seededRef.current=true;seedDefaults();}
      setLoading(false);
    });
    const unsubPlans=onSnapshot(query(plansCol,orderBy("createdAt","desc")),snap=>setPlans(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubLogs=onSnapshot(query(logsCol,orderBy("createdAt","desc")),snap=>setAllLogs(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{unsubEx();unsubPlans();unsubLogs();};
  },[]);

  const TABS=[
    {id:"home", label:"Home", svg:<><rect x="3" y="10" width="18" height="11" rx="1"/><polyline points="3 10 12 3 21 10"/></>},
    {id:"log",  label:"Log",  svg:<><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>},
    {id:"plans",label:"Plans",svg:<><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></>},
    {id:"library",label:"Library",svg:<><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"/><path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></>},
    {id:"progress",label:"Stats",svg:<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>},
    {id:"history",label:"History",svg:<><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></>},
  ];

  if(loading) return (
    <>
      <style>{CSS}</style>
      <div className="loading-screen">
        <div className="spinner"/>
        <div style={{fontSize:14,color:"var(--text3)",fontFamily:"var(--font)"}}>Loading…</div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Top header */}
        <div className="top-header">
          <div className="header-logo">
            <div className="header-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z"/><path d="M12 12c0 3-2 4-2 6a2 2 0 0 0 4 0c0-2-2-3-2-6z"/></svg>
            </div>
            <div className="header-logo-text">Forge</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>
            <span style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>synced</span>
          </div>
        </div>

        {/* Page content */}
        <div className="main-scroll">
          {page==="home"&&<Dashboard exercises={exercises} logs={logs} plans={plans} setPage={setPage}/>}
          {page==="log"&&<LogWorkout exercises={exercises} plans={plans} notify={notify}/>}
          {page==="plans"&&<Plans exercises={exercises} plans={plans} notify={notify}/>}
          {page==="library"&&<Library exercises={exercises} notify={notify}/>}
          {page==="progress"&&<Progress exercises={exercises} logs={logs}/>}
          {page==="history"&&<History logs={allLogs} archivedLogs={archivedLogs} notify={notify}/>}
        </div>

        {/* Bottom tab bar */}
        <div className="tab-bar">
          {TABS.map(t=>(
            <button key={t.id} className={`tab-item ${page===t.id?"active":""}`} onClick={()=>setPage(t.id)}>
              <div className="tab-icon"><svg viewBox="0 0 24 24">{t.svg}</svg></div>
              <span className="tab-label">{t.label}</span>
              {page===t.id&&<div className="tab-dot"/>}
            </button>
          ))}
        </div>

        <Timer/>
        {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
      </div>
    </>
  );
}
