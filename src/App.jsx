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

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');`;

const CSS = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #f7f6f3; --bg2: #eeedea; --white: #ffffff;
  --border: #e6e4de; --border2: #d4d2cb;
  --text: #18170f; --text2: #69685f; --text3: #a09e96;
  --accent: #2563eb; --accent-light: #eff4ff;
  --green: #16a34a; --green-light: #f0fdf4;
  --orange: #ea580c; --red: #dc2626; --red-light: #fef2f2;
  --radius-sm: 8px; --radius: 12px; --radius-lg: 16px; --radius-xl: 24px;
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.07);
  --shadow: 0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
  --font: 'Plus Jakarta Sans', sans-serif;
  --tab-h: 72px;
  --header-h: 60px;
}
html { font-size: 16px; }
body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; -webkit-font-smoothing: antialiased; overscroll-behavior: none; }

/* ── App Shell ── */
.app { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; max-width: 480px; margin: 0 auto; position: relative; background: var(--bg); }
.main-scroll { flex: 1; overflow-y: auto; padding-bottom: calc(var(--tab-h) + 16px); -webkit-overflow-scrolling: touch; }

/* ── Top Header ── */
.top-header { position: sticky; top: 0; z-index: 100; background: rgba(247,246,243,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 16px; height: var(--header-h); display: flex; align-items: center; justify-content: space-between; }
.header-title { font-family: 'Instrument Serif', serif; font-size: 22px; font-weight: 400; letter-spacing: -0.3px; }
.header-title em { font-style: italic; color: var(--text2); }
.header-logo { display: flex; align-items: center; gap: 8px; }
.header-logo-icon { width: 30px; height: 30px; background: var(--text); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.header-logo-text { font-size: 17px; font-weight: 800; letter-spacing: -0.5px; }

/* ── Bottom Tab Bar ── */
.tab-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; height: var(--tab-h); background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-around; padding: 0 4px; padding-bottom: env(safe-area-inset-bottom); z-index: 200; }
.tab-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 16px; border-radius: var(--radius); cursor: pointer; transition: all 0.15s; flex: 1; border: none; background: none; font-family: var(--font); }
.tab-item:active { background: var(--bg2); transform: scale(0.95); }
.tab-icon { font-size: 22px; line-height: 1; transition: transform 0.15s; }
.tab-label { font-size: 10px; font-weight: 600; color: var(--text3); letter-spacing: 0.2px; }
.tab-item.active .tab-icon { transform: scale(1.1); }
.tab-item.active .tab-label { color: var(--accent); }
.tab-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); margin-top: 2px; }

/* ── Page ── */
.page { padding: 16px 16px 8px; }
.page-title { font-family: 'Instrument Serif', serif; font-size: 28px; font-weight: 400; letter-spacing: -0.5px; margin-bottom: 2px; }
.page-title em { font-style: italic; color: var(--text2); }
.page-desc { font-size: 13px; color: var(--text3); margin-bottom: 20px; }

/* ── Cards ── */
.card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; box-shadow: var(--shadow-sm); }
.card + .card { margin-top: 10px; }

/* ── Stat row ── */
.stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.stat-row-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.stat-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; box-shadow: var(--shadow-sm); }
.stat-label { font-size: 11px; font-weight: 600; color: var(--text3); letter-spacing: 0.3px; margin-bottom: 6px; text-transform: uppercase; }
.stat-val { font-size: 26px; font-weight: 800; letter-spacing: -1px; line-height: 1; color: var(--text); }
.stat-val.blue { color: var(--accent); }
.stat-val.green { color: var(--green); }
.stat-val.orange { color: var(--orange); }
.stat-sub { font-size: 11px; color: var(--text3); margin-top: 3px; }

/* ── Buttons ── */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: var(--font); font-size: 14px; font-weight: 700; border: none; border-radius: var(--radius); cursor: pointer; transition: all 0.12s; white-space: nowrap; min-height: 44px; padding: 0 18px; -webkit-tap-highlight-color: transparent; }
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--text); color: var(--white); }
.btn-blue { background: var(--accent); color: white; }
.btn-secondary { background: var(--white); color: var(--text); border: 1.5px solid var(--border2); }
.btn-ghost { background: transparent; color: var(--text2); }
.btn-danger { background: var(--red-light); color: var(--red); border: 1px solid #fecaca; }
.btn-green { background: var(--green-light); color: var(--green); border: 1px solid #bbf7d0; }
.btn-full { width: 100%; }
.btn-sm { min-height: 36px; padding: 0 12px; font-size: 13px; border-radius: var(--radius-sm); }
.btn-xs { min-height: 30px; padding: 0 10px; font-size: 12px; border-radius: 6px; }
.btn-icon-round { width: 40px; height: 40px; min-height: 40px; padding: 0; border-radius: 50%; flex-shrink: 0; }

/* ── Inputs ── */
.input { background: var(--bg); border: 1.5px solid var(--border2); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 16px; padding: 11px 13px; width: 100%; transition: border-color 0.12s, box-shadow 0.12s; outline: none; -webkit-appearance: none; }
.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: var(--white); }
.input::placeholder { color: var(--text3); }
.input-label { font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 6px; letter-spacing: 0.2px; }
.input-group { margin-bottom: 14px; }
.select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23888' d='M5 7L0 2h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; background-color: var(--bg); }
.search-wrap { position: relative; margin-bottom: 12px; }
.search-wrap .input { padding-left: 38px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text3); font-size: 16px; pointer-events: none; }

/* ── Tags ── */
.tag { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; letter-spacing: 0.2px; }
.tag-chest{background:#fff7ed;color:#c2410c} .tag-back{background:#eff6ff;color:#1d4ed8}
.tag-legs{background:#f0fdf4;color:#15803d} .tag-shoulders{background:#fefce8;color:#a16207}
.tag-arms{background:#fdf4ff;color:#7e22ce} .tag-core{background:#fff1f2;color:#be123c}
.tag-cardio{background:#f0fdfa;color:#0f766e} .tag-other{background:var(--bg2);color:var(--text2)}

/* ── Filter chips ── */
.chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 14px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.chips::-webkit-scrollbar { display: none; }
.chip { background: var(--white); border: 1.5px solid var(--border2); color: var(--text2); border-radius: 20px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: var(--font); transition: all 0.1s; min-height: 36px; display: flex; align-items: center; -webkit-tap-highlight-color: transparent; flex-shrink: 0; }
.chip.active { background: var(--text); color: var(--white); border-color: var(--text); }

/* ── Exercise card ── */
.ex-card { background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; transition: all 0.12s; -webkit-tap-highlight-color: transparent; }
.ex-card.selected { border-color: var(--accent); background: var(--accent-light); }
.ex-card + .ex-card { margin-top: 8px; }
.ex-name { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
.ex-meta { font-size: 12px; color: var(--text3); }

/* ── Sets input row ── */
.set-row { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.set-row:last-child { border-bottom: none; }
.set-num-badge { width: 28px; height: 28px; background: var(--bg2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--text3); flex-shrink: 0; }
.set-input { background: var(--bg); border: 1.5px solid var(--border2); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 16px; font-weight: 700; padding: 8px 10px; text-align: center; width: 72px; outline: none; transition: border-color 0.12s; -webkit-appearance: none; flex-shrink: 0; }
.set-input:focus { border-color: var(--accent); background: var(--white); }
.set-input::placeholder { color: var(--text3); font-weight: 400; }
.set-x { color: var(--text3); font-size: 14px; font-weight: 600; flex-shrink: 0; }
.set-vol { font-size: 12px; color: var(--text3); font-weight: 600; margin-left: auto; flex-shrink: 0; min-width: 44px; text-align: right; }
.set-done-btn { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--border2); background: var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; transition: all 0.12s; flex-shrink: 0; -webkit-tap-highlight-color: transparent; }
.set-done-btn.done { background: var(--green); border-color: var(--green); color: white; }

/* ── Log exercise block ── */
.log-block { background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 12px; overflow: hidden; box-shadow: var(--shadow-sm); }
.log-block-header { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
.log-block-body { padding: 0 16px 14px; }
.log-block-name { font-size: 16px; font-weight: 700; }

/* ── Plan card ── */
.plan-card { background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 16px; box-shadow: var(--shadow-sm); margin-bottom: 10px; }
.plan-name { font-size: 17px; font-weight: 800; margin-bottom: 3px; letter-spacing: -0.3px; }
.plan-desc { font-size: 13px; color: var(--text3); margin-bottom: 12px; }

/* ── Section header ── */
.section-head { font-size: 13px; font-weight: 700; color: var(--text2); margin-bottom: 10px; letter-spacing: 0.2px; text-transform: uppercase; }

/* ── Progress bar ── */
.prog-wrap { height: 6px; background: var(--bg2); border-radius: 3px; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; background: var(--accent); }

/* ── Chart ── */
.chart-wrap { display: flex; align-items: flex-end; gap: 4px; height: 80px; }
.chart-col { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; }
.chart-bar { width: 100%; border-radius: 3px 3px 0 0; min-height: 3px; transition: height 0.4s ease; }
.chart-lbl { font-size: 8px; color: var(--text3); margin-top: 3px; font-weight: 600; }
.chart-val-lbl { font-size: 8px; color: var(--text2); margin-bottom: 2px; font-weight: 700; }

/* ── Modal / Sheet ── */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 500; display: flex; align-items: flex-end; backdrop-filter: blur(4px); }
.sheet { background: var(--white); border-radius: var(--radius-xl) var(--radius-xl) 0 0; width: 100%; max-height: 92vh; overflow-y: auto; padding: 20px 16px 40px; box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease; }
.sheet-handle { width: 40px; height: 4px; background: var(--border2); border-radius: 2px; margin: 0 auto 20px; }
.sheet-title { font-family: 'Instrument Serif', serif; font-size: 24px; font-weight: 400; margin-bottom: 20px; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

/* ── Timer pill ── */
.timer-fab { position: fixed; bottom: calc(var(--tab-h) + 12px); right: 16px; z-index: 300; }
.timer-bubble { background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); overflow: hidden; width: 160px; transition: all 0.2s; }
.timer-bubble.running { border-color: var(--accent); box-shadow: 0 4px 24px rgba(37,99,235,0.2); }
.timer-bubble.warning { border-color: var(--orange); box-shadow: 0 4px 24px rgba(234,88,12,0.2); }
.timer-bubble.done { border-color: var(--green); box-shadow: 0 4px 24px rgba(22,163,74,0.2); }
.timer-strip { height: 3px; background: var(--bg2); }
.timer-strip-fill { height: 100%; transition: width 0.9s linear; background: var(--accent); }
.timer-strip-fill.warning { background: var(--orange); }
.timer-strip-fill.done { background: var(--green); }
.timer-inner { padding: 10px 12px; }
.timer-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.timer-lbl { font-size: 9px; font-weight: 700; color: var(--text3); letter-spacing: 0.8px; text-transform: uppercase; }
.timer-dig { font-size: 36px; font-weight: 800; letter-spacing: -2px; text-align: center; line-height: 1; margin-bottom: 8px; color: var(--text); }
.timer-dig.running { color: var(--accent); }
.timer-dig.warning { color: var(--orange); }
.timer-dig.done { color: var(--green); }
.timer-btns { display: flex; gap: 4px; margin-bottom: 6px; }
.timer-presets-row { display: flex; gap: 3px; flex-wrap: wrap; }
.tpreset { background: var(--bg2); border: none; color: var(--text2); border-radius: 10px; padding: 3px 7px; font-size: 10px; font-weight: 700; cursor: pointer; font-family: var(--font); -webkit-tap-highlight-color: transparent; }
.tpreset:active { background: var(--accent-light); color: var(--accent); }
.timer-collapsed-pill { background: var(--text); border-radius: 20px; padding: 10px 16px; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: var(--shadow); -webkit-tap-highlight-color: transparent; }
.timer-collapsed-time { font-size: 18px; font-weight: 800; color: white; letter-spacing: -0.5px; }

/* ── Toast ── */
.toast { position: fixed; top: calc(var(--header-h) + 8px); left: 50%; transform: translateX(-50%); z-index: 999; background: var(--text); color: white; border-radius: var(--radius); padding: 12px 20px; font-size: 14px; font-weight: 600; box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 8px; animation: toastIn 0.2s ease; white-space: nowrap; max-width: calc(100vw - 32px); }
@keyframes toastIn { from { transform: translateX(-50%) translateY(-8px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }

/* ── Loading ── */
.loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: var(--bg); gap: 14px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty state ── */
.empty { display: flex; flex-direction: column; align-items: center; padding: 48px 24px; text-align: center; }
.empty-icon { font-size: 44px; margin-bottom: 12px; opacity: 0.4; }
.empty-title { font-size: 16px; font-weight: 700; color: var(--text2); margin-bottom: 4px; }
.empty-desc { font-size: 13px; color: var(--text3); }

/* ── History ── */
.hist-date { font-size: 12px; font-weight: 700; color: var(--text3); letter-spacing: 0.5px; text-transform: uppercase; padding: 8px 0 6px; border-bottom: 1px solid var(--border); margin-bottom: 8px; }

/* ── Flex utils ── */
.row { display: flex; align-items: center; }
.row-between { display: flex; align-items: center; justify-content: space-between; }
.col { display: flex; flex-direction: column; }
.gap-4{gap:4px}.gap-6{gap:6px}.gap-8{gap:8px}.gap-10{gap:10px}.gap-12{gap:12px}
.mb-8{margin-bottom:8px}.mb-12{margin-bottom:12px}.mb-16{margin-bottom:16px}.mb-20{margin-bottom:20px}
.mt-8{margin-top:8px}.mt-12{margin-top:12px}.mt-16{margin-top:16px}
.w-full{width:100%} .text-sm{font-size:13px} .text-xs{font-size:12px} .text-muted{color:var(--text3)}
.fw-700{font-weight:700} .fw-600{font-weight:600}

/* ── Desktop sidebar (when wide enough) ── */
@media(min-width:640px){
  body { background: #e8e7e2; }
  .app { box-shadow: 0 0 60px rgba(0,0,0,0.15); min-height: 100vh; }
  .tab-bar { border-radius: 0; }
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
  return <div className="toast">✓ {msg}</div>;
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
        <span style={{fontSize:16}}>⏱</span>
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
            <button className="btn btn-secondary btn-sm btn-icon-round" style={{minHeight:36,width:36,height:36}} onClick={reset}>↺</button>
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
              <div style={{width:"100%",background:count>0?"var(--accent)":"var(--bg2)",borderRadius:3,height:count>0?Math.max(count*16,10):6,transition:"height 0.3s"}}/>
              <div style={{fontSize:9,color:"var(--text3)",fontWeight:700}}>{"SMTWTFS"[new Date(d).getDay()]}</div>
            </div>;
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="section-head">Quick Actions</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {[{label:"Log Workout",icon:"💪",page:"log",color:"var(--accent)"},{label:"New Plan",icon:"📋",page:"plans",color:"var(--green)"},{label:"Add Exercise",icon:"➕",page:"library",color:"var(--orange)"},{label:"View Progress",icon:"📈",page:"progress",color:"var(--text)"}].map(a=>(
          <button key={a.label} className="btn btn-secondary" style={{justifyContent:"flex-start",gap:10,padding:"14px 14px"}} onClick={()=>setPage(a.page)}>
            <span style={{fontSize:20}}>{a.icon}</span>
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
        <span className="search-icon">🔍</span>
        <input className="input" placeholder="Search exercises…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="chips">
        {["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`chip ${filter===g?"active":""}`} onClick={()=>setFilter(g)}>{g==="all"?"All":g.charAt(0).toUpperCase()+g.slice(1)}</button>)}
      </div>

      {filtered.length===0?(<div className="empty"><div className="empty-icon">🏋️</div><div className="empty-title">No exercises found</div></div>):(
        filtered.map(e=>(
          <div key={e.id} className="ex-card" onClick={()=>openEdit(e)}>
            <div className="row-between mb-6">
              <span className={`tag tag-${e.muscle}`}>{e.muscle}</span>
              <button className="btn btn-ghost btn-xs" style={{color:"var(--red)",minHeight:28}} onClick={ev=>del(e.id,ev)}>🗑</button>
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
        <button className="btn btn-ghost btn-sm" style={{padding:"0 8px"}} onClick={()=>setView("list")}>←</button>
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
            <div className="search-wrap"><span className="search-icon">🔍</span><input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <div className="chips">{["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`chip ${exFilter===g?"active":""}`} onClick={()=>setExFilter(g)}>{g==="all"?"All":g}</button>)}</div>
            {filteredEx.map(e=>{
              const added=!!planEx.find(pe=>pe.exId===e.id);
              return (
                <div key={e.id} className={`ex-card ${added?"selected":""}`} onClick={()=>addEx(e)} style={{marginBottom:6}}>
                  <div className="row-between">
                    <div><div style={{fontSize:14,fontWeight:700}}>{e.name}</div><div className="row gap-6 mt-4"><span className={`tag tag-${e.muscle}`}>{e.muscle}</span><span className="text-xs text-muted">{e.equipment}</span></div></div>
                    {added?<span style={{color:"var(--green)",fontSize:20}}>✓</span>:<span style={{color:"var(--text3)",fontSize:22,fontWeight:300}}>+</span>}
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

      {plans.length===0?(<div className="empty"><div className="empty-icon">📋</div><div className="empty-title">No plans yet</div><div className="empty-desc">Create your first workout routine</div></div>):(
        plans.map(p=>(
          <div key={p.id} className="plan-card">
            <div className="row-between mb-4">
              <div className="plan-name">{p.name}</div>
              <button className="btn btn-ghost btn-xs" style={{color:"var(--red)",minHeight:28}} onClick={()=>delPlan(p.id)}>🗑</button>
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
      notify("Workout saved! 💪");
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
        plans.length===0?(<div className="empty"><div className="empty-icon">📋</div><div className="empty-title">No plans yet</div><div className="empty-desc">Create a plan first</div></div>):(
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
            <div className="card mb-12" style={{borderColor:"var(--accent)",background:"var(--accent-light)"}}>
              <div className="row-between">
                <span style={{fontSize:14,fontWeight:700,color:"var(--accent)"}}>{session.length} selected</span>
                <button className="btn btn-blue btn-sm" onClick={()=>setStep("log")}>Start →</button>
              </div>
            </div>
          )}
          <div className="search-wrap"><span className="search-icon">🔍</span><input className="input" placeholder="Search exercises…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="chips">{["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`chip ${filter===g?"active":""}`} onClick={()=>setFilter(g)}>{g==="all"?"All":g}</button>)}</div>
          {filteredEx.map(e=>{const sel=!!session.find(se=>se.exId===e.id);return(
            <div key={e.id} className={`ex-card ${sel?"selected":""}`} onClick={()=>addFreeEx(e)} style={{marginBottom:6}}>
              <div className="row-between">
                <div><div className="ex-name" style={{fontSize:14}}>{e.name}</div><span className={`tag tag-${e.muscle}`} style={{marginTop:4,display:"inline-block"}}>{e.muscle}</span></div>
                {sel?<span style={{color:"var(--green)",fontSize:22}}>✓</span>:<span style={{color:"var(--text3)",fontSize:24,fontWeight:300}}>+</span>}
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
            <div className="row" style={{paddingBottom:6,borderBottom:"1px solid var(--border)"}}>
              <div style={{width:28,flexShrink:0}}/>
              <div style={{width:72,flexShrink:0,textAlign:"center",fontSize:11,fontWeight:700,color:"var(--text3)",letterSpacing:0.3}}>KG</div>
              <div style={{width:12,flexShrink:0}}/>
              <div style={{width:72,flexShrink:0,textAlign:"center",fontSize:11,fontWeight:700,color:"var(--text3)",letterSpacing:0.3}}>REPS</div>
              <div style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:"var(--text3)",letterSpacing:0.3}}>VOL</div>
              <div style={{width:36,flexShrink:0}}/>
              <div style={{width:24,flexShrink:0}}/>
            </div>
            {se.sets.map((s,i)=>(
              <div key={s.id} className="set-row" style={{opacity:s.done?0.5:1}}>
                <div className="set-num-badge">#{i+1}</div>
                <input type="number" className="set-input" placeholder="0" value={s.weight} min={0} step={0.5} inputMode="decimal" onChange={e=>updSet(se.id,s.id,"weight",e.target.value)}/>
                <span className="set-x">×</span>
                <input type="number" className="set-input" placeholder="0" value={s.reps} min={0} inputMode="numeric" onChange={e=>updSet(se.id,s.id,"reps",e.target.value)}/>
                <span className="set-vol">{((Number(s.weight)||0)*(Number(s.reps)||0)).toFixed(0)}</span>
                <button className={`set-done-btn ${s.done?"done":""}`} onClick={()=>toggleDone(se.id,s.id)}>{s.done?"✓":"○"}</button>
                <button style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",padding:"0 4px",fontSize:16,lineHeight:1}} onClick={()=>removeSet(se.id,s.id)}>×</button>
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
            <div className="search-wrap"><span className="search-icon">🔍</span><input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <div className="chips">{["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`chip ${filter===g?"active":""}`} onClick={()=>setFilter(g)}>{g==="all"?"All":g}</button>)}</div>
            {filteredEx.map(e=>{const sel=!!session.find(se=>se.exId===e.id);return(
              <div key={e.id} className={`ex-card ${sel?"selected":""}`} onClick={()=>addFreeEx(e)} style={{marginBottom:6}}>
                <div className="row-between"><div><div style={{fontSize:14,fontWeight:700}}>{e.name}</div><span className={`tag tag-${e.muscle}`} style={{marginTop:4,display:"inline-block"}}>{e.muscle}</span></div>
                {sel?<span style={{color:"var(--green)",fontSize:20}}>✓</span>:<span style={{color:"var(--text3)",fontSize:22}}>+</span>}</div>
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
            <button className="btn btn-secondary btn-full mb-16" onClick={()=>setSelEx(null)}>← Back to exercises</button>
          </>
        );
      })()}

      <div className="section-head">{selEx?"All Sessions":"Select Exercise"}</div>
      {!selEx&&<>
        <div className="search-wrap"><span className="search-icon">🔍</span><input className="input" placeholder="Search tracked exercises…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        {exWithData.length===0?(<div className="empty"><div className="empty-icon">📊</div><div className="empty-title">No data yet</div><div className="empty-desc">Log workouts to track progress</div></div>):(
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
function History({ logs, notify }) {
  const [expanded,setExpanded]=useState(null);
  const del=async id=>{try{await deleteDoc(doc(db,"logs",id));notify("Entry deleted");}catch{notify("Error");}};
  const grouped=logs.reduce((acc,log)=>{const k=log.date;if(!acc[k])acc[k]=[];acc[k].push(log);return acc;},{});
  const dates=Object.keys(grouped).sort((a,b)=>new Date(b)-new Date(a));

  return (
    <div className="page">
      <div className="page-title">Workout <em>History</em></div>
      <div className="page-desc">{logs.length} sessions logged</div>

      {dates.length===0?(<div className="empty"><div className="empty-icon">📅</div><div className="empty-title">No workouts yet</div><div className="empty-desc">Your logged sessions will appear here</div></div>):dates.map(date=>(
        <div key={date}>
          <div className="hist-date">{fmtDate(date)}</div>
          {grouped[date].map(log=>{
            const vol=(log.exercises||[]).reduce((a,e)=>a+(e.sets||[]).reduce((b,s)=>b+(s.weight*s.reps),0),0);
            const sets=(log.exercises||[]).reduce((a,e)=>a+(e.sets||[]).length,0);
            const muscles=[...new Set((log.exercises||[]).map(e=>e.muscle))];
            const isOpen=expanded===log.id;
            return (
              <div key={log.id} className="log-block mb-8">
                <div className="log-block-header" onClick={()=>setExpanded(isOpen?null:log.id)}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(log.exercises||[]).map(e=>e.name).join(", ")}</div>
                    <div className="row gap-4" style={{flexWrap:"wrap"}}>
                      {muscles.map(m=><span key={m} className={`tag tag-${m}`}>{m}</span>)}
                      <span className="text-xs text-muted">{sets} sets · {vol.toFixed(0)}kg</span>
                    </div>
                  </div>
                  <div className="row gap-8 ml-8" style={{marginLeft:8,flexShrink:0}}>
                    <button className="btn btn-danger btn-xs" onClick={e=>{e.stopPropagation();del(log.id);}}>Del</button>
                    <span style={{color:"var(--text3)",fontSize:14}}>{isOpen?"▲":"▼"}</span>
                  </div>
                </div>
                {isOpen&&(
                  <div className="log-block-body">
                    {(log.exercises||[]).map((ex,i)=>(
                      <div key={i} style={{marginBottom:14}}>
                        <div className="row-between mb-8"><span style={{fontWeight:700,fontSize:14}}>{ex.name}</span><span className={`tag tag-${ex.muscle}`}>{ex.muscle}</span></div>
                        <div style={{background:"var(--bg)",borderRadius:"8px",padding:"4px 0"}}>
                          <div className="row" style={{padding:"4px 10px",borderBottom:"1px solid var(--border)"}}>
                            {["SET","WEIGHT","REPS","VOL"].map(h=><div key={h} style={{flex:h==="SET"?0:1,minWidth:h==="SET"?28:0,fontSize:10,fontWeight:700,color:"var(--text3)",textAlign:h==="SET"?"center":"left"}}>{h}</div>)}
                          </div>
                          {(ex.sets||[]).map((s,j)=>(
                            <div key={j} className="row" style={{padding:"6px 10px",borderBottom:j<ex.sets.length-1?"1px solid var(--border)":"none"}}>
                              <div style={{width:28,fontSize:12,fontWeight:700,color:"var(--text3)",textAlign:"center"}}>#{j+1}</div>
                              <div style={{flex:1,fontSize:14,fontWeight:700}}>{s.weight}kg</div>
                              <div style={{flex:1,fontSize:14}}>{s.reps}</div>
                              <div style={{flex:1,fontSize:12,color:"var(--text3)"}}>{(s.weight*s.reps).toFixed(0)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("home");
  const [exercises,setExercises]=useState([]);
  const [plans,setPlans]=useState([]);
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const seededRef=useRef(false);
  const notify=msg=>setToast(msg);

  const seedDefaults=async()=>{ for(const ex of DEFAULT_EXERCISES) await addDoc(exercisesCol,{...ex,createdAt:serverTimestamp()}); };

  useEffect(()=>{
    const unsubEx=onSnapshot(query(exercisesCol,orderBy("createdAt","asc")),snap=>{
      const data=snap.docs.map(d=>({id:d.id,...d.data()}));
      setExercises(data);
      if(data.length===0&&!seededRef.current){seededRef.current=true;seedDefaults();}
      setLoading(false);
    });
    const unsubPlans=onSnapshot(query(plansCol,orderBy("createdAt","desc")),snap=>setPlans(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubLogs=onSnapshot(query(logsCol,orderBy("createdAt","desc")),snap=>setLogs(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{unsubEx();unsubPlans();unsubLogs();};
  },[]);

  const TABS=[
    {id:"home",icon:"🏠",label:"Home"},
    {id:"log",icon:"➕",label:"Log"},
    {id:"plans",icon:"📋",label:"Plans"},
    {id:"library",icon:"📚",label:"Library"},
    {id:"progress",icon:"📈",label:"Progress"},
  ];

  const PAGE_TITLES={home:"Dashboard",log:"Log",plans:"Plans",library:"Library",progress:"Progress"};

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
            <div className="header-logo-icon">🔥</div>
            <div className="header-logo-text">Forge</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"var(--green)"}}/>
            <span style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>Synced</span>
          </div>
        </div>

        {/* Page content */}
        <div className="main-scroll">
          {page==="home"&&<Dashboard exercises={exercises} logs={logs} plans={plans} setPage={setPage}/>}
          {page==="log"&&<LogWorkout exercises={exercises} plans={plans} notify={notify}/>}
          {page==="plans"&&<Plans exercises={exercises} plans={plans} notify={notify}/>}
          {page==="library"&&<Library exercises={exercises} notify={notify}/>}
          {page==="progress"&&<Progress exercises={exercises} logs={logs}/>}
          {page==="history"&&<History logs={logs} notify={notify}/>}
        </div>

        {/* Bottom tab bar */}
        <div className="tab-bar">
          {TABS.map(t=>(
            <button key={t.id} className={`tab-item ${page===t.id?"active":""}`} onClick={()=>setPage(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
              {page===t.id&&<div className="tab-dot"/>}
            </button>
          ))}
          <button className={`tab-item ${page==="history"?"active":""}`} onClick={()=>setPage("history")}>
            <span className="tab-icon">📅</span>
            <span className="tab-label">History</span>
            {page==="history"&&<div className="tab-dot"/>}
          </button>
        </div>

        <Timer/>
        {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
      </div>
    </>
  );
}
