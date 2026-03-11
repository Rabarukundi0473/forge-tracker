import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";

// ── Firebase Setup ──────────────────────────────────────────────────────────
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

// ── Styles ──────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');`;

const CSS = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #f8f7f4; --bg2: #f0efe9; --white: #ffffff;
  --border: #e8e6e0; --border2: #d8d6ce;
  --text: #1a1916; --text2: #6b6860; --text3: #a8a69e;
  --accent: #2563eb; --accent-light: #eff4ff; --accent-mid: #bfcffd;
  --green: #16a34a; --green-light: #f0fdf4;
  --orange: #ea580c; --red: #dc2626; --red-light: #fef2f2;
  --radius-sm: 6px; --radius: 10px; --radius-lg: 14px; --radius-xl: 20px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 4px 12px rgba(0,0,0,0.07),0 1px 3px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.10),0 2px 6px rgba(0,0,0,0.04);
  --font: 'Plus Jakarta Sans', sans-serif;
}
body { background:var(--bg); color:var(--text); font-family:var(--font); min-height:100vh; -webkit-font-smoothing:antialiased; }
.app { display:flex; min-height:100vh; }
.sidebar { width:240px; min-width:240px; background:var(--white); border-right:1px solid var(--border); display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow-y:auto; }
.sidebar-top { padding:24px 20px 16px; }
.logo-wrap { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
.logo-icon { width:34px; height:34px; background:var(--text); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.logo-text { font-size:16px; font-weight:700; letter-spacing:-0.3px; }
.logo-text span { color:var(--text3); font-weight:400; font-size:13px; display:block; margin-top:-2px; }
.nav-section-label { font-size:11px; font-weight:600; color:var(--text3); letter-spacing:0.6px; text-transform:uppercase; padding:0 12px; margin-bottom:4px; }
.nav-item { display:flex; align-items:center; gap:9px; padding:8px 12px; border-radius:var(--radius-sm); cursor:pointer; font-size:14px; font-weight:500; color:var(--text2); transition:all 0.12s; margin-bottom:1px; }
.nav-item:hover { background:var(--bg); color:var(--text); }
.nav-item.active { background:var(--accent-light); color:var(--accent); font-weight:600; }
.nav-icon { width:18px; text-align:center; font-size:15px; flex-shrink:0; }
.sidebar-bottom { margin-top:auto; padding:16px 20px; border-top:1px solid var(--border); }
.firebase-note { font-size:11px; color:var(--text3); display:flex; align-items:center; gap:6px; }
.firebase-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
.main { flex:1; overflow-y:auto; background:var(--bg); }
.page { padding:36px 40px; max-width:1080px; }
.page-header { margin-bottom:28px; }
.page-title { font-family:'Instrument Serif',serif; font-size:32px; font-weight:400; letter-spacing:-0.5px; margin-bottom:4px; }
.page-title em { font-style:italic; color:var(--text2); }
.page-desc { font-size:14px; color:var(--text3); }
.card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow-sm); }
.card-flat { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-lg); }
.stat-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px 22px; box-shadow:var(--shadow-sm); }
.stat-label { font-size:12px; font-weight:600; color:var(--text3); letter-spacing:0.3px; margin-bottom:8px; }
.stat-val { font-size:30px; font-weight:800; letter-spacing:-1px; line-height:1; }
.stat-val.blue{color:var(--accent)} .stat-val.green{color:var(--green)} .stat-val.orange{color:var(--orange)}
.stat-sub { font-size:12px; color:var(--text3); margin-top:4px; }
.btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; font-family:var(--font); font-size:13px; font-weight:600; border:none; border-radius:var(--radius-sm); cursor:pointer; transition:all 0.12s; white-space:nowrap; }
.btn-primary { background:var(--text); color:var(--white); }
.btn-primary:hover { background:#2d2c29; }
.btn-blue { background:var(--accent); color:white; }
.btn-blue:hover { background:#1d4fd8; }
.btn-secondary { background:var(--white); color:var(--text); border:1px solid var(--border2); box-shadow:var(--shadow-sm); }
.btn-secondary:hover { background:var(--bg); }
.btn-ghost { background:transparent; color:var(--text2); }
.btn-ghost:hover { background:var(--bg); color:var(--text); }
.btn-danger { background:var(--red-light); color:var(--red); border:1px solid #fecaca; }
.btn-danger:hover { background:#fee2e2; }
.btn-green { background:var(--green-light); color:var(--green); border:1px solid #bbf7d0; }
.btn-sm{padding:5px 10px;font-size:12px} .btn-xs{padding:3px 8px;font-size:11px;border-radius:4px} .btn-icon{padding:6px}
.input { background:var(--white); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text); font-family:var(--font); font-size:14px; padding:8px 11px; width:100%; transition:border-color 0.12s,box-shadow 0.12s; outline:none; }
.input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
.input::placeholder { color:var(--text3); }
.input-label { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:5px; }
.input-group { margin-bottom:14px; }
.select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%23888' d='M5 7L0 2h10z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:28px; }
.search-wrap { position:relative; }
.search-wrap .input { padding-left:34px; }
.search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text3); font-size:14px; pointer-events:none; }
.tag { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
.tag-chest{background:#fff7ed;color:#c2410c} .tag-back{background:#eff6ff;color:#1d4ed8} .tag-legs{background:#f0fdf4;color:#15803d}
.tag-shoulders{background:#fefce8;color:#a16207} .tag-arms{background:#fdf4ff;color:#7e22ce} .tag-core{background:#fff1f2;color:#be123c}
.tag-cardio{background:#f0fdfa;color:#0f766e} .tag-other{background:var(--bg2);color:var(--text2)}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.flex{display:flex} .flex-center{display:flex;align-items:center} .flex-between{display:flex;align-items:center;justify-content:space-between}
.gap-4{gap:4px}.gap-6{gap:6px}.gap-8{gap:8px}.gap-10{gap:10px}.gap-12{gap:12px}.gap-16{gap:16px}
.mb-4{margin-bottom:4px}.mb-8{margin-bottom:8px}.mb-10{margin-bottom:10px}.mb-12{margin-bottom:12px}.mb-14{margin-bottom:14px}
.mb-16{margin-bottom:16px}.mb-20{margin-bottom:20px}.mb-24{margin-bottom:24px}.mb-28{margin-bottom:28px}
.mt-8{margin-top:8px}.mt-12{margin-top:12px}.mt-16{margin-top:16px}.w-full{width:100%}
.section-head { font-size:13px; font-weight:700; margin-bottom:12px; }
.ex-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius); padding:14px 16px; cursor:pointer; transition:all 0.12s; }
.ex-card:hover { border-color:var(--border2); box-shadow:var(--shadow-sm); transform:translateY(-1px); }
.ex-card.selected { border-color:var(--accent); background:var(--accent-light); box-shadow:0 0 0 1px var(--accent); }
.ex-name { font-size:14px; font-weight:600; margin-bottom:6px; }
.ex-meta { font-size:12px; color:var(--text3); }
.sets-table { width:100%; border-collapse:collapse; }
.sets-table th { font-size:11px; font-weight:600; color:var(--text3); text-align:left; padding:6px 8px; border-bottom:1px solid var(--border); text-transform:uppercase; letter-spacing:0.3px; }
.sets-table td { padding:7px 8px; border-bottom:1px solid var(--border); font-size:14px; vertical-align:middle; }
.sets-table tr:last-child td { border-bottom:none; }
.sets-table tbody tr:hover td { background:var(--bg); }
.set-num { font-size:12px; font-weight:600; color:var(--text3); }
.log-ex-block { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-lg); margin-bottom:12px; overflow:hidden; box-shadow:var(--shadow-sm); }
.log-ex-header { padding:14px 18px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; }
.log-ex-header:hover { background:var(--bg); }
.log-ex-body { padding:0 18px 14px; }
.log-ex-name { font-size:15px; font-weight:700; }
.prog-bar-wrap { height:6px; background:var(--bg2); border-radius:3px; overflow:hidden; }
.prog-bar-fill { height:100%; border-radius:3px; transition:width 0.4s ease; }
.chart-wrap { display:flex; align-items:flex-end; gap:5px; height:100px; }
.chart-col { display:flex; flex-direction:column; align-items:center; flex:1; height:100%; justify-content:flex-end; }
.chart-bar { width:100%; border-radius:3px 3px 0 0; min-height:3px; transition:height 0.4s ease; cursor:pointer; }
.chart-bar:hover { filter:brightness(0.9); }
.chart-label { font-size:9px; color:var(--text3); margin-top:4px; font-weight:500; }
.chart-val { font-size:9px; color:var(--text2); margin-bottom:2px; font-weight:600; }
.plan-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px; transition:all 0.12s; box-shadow:var(--shadow-sm); }
.plan-card:hover { box-shadow:var(--shadow); }
.plan-name { font-size:17px; font-weight:700; margin-bottom:4px; letter-spacing:-0.2px; }
.plan-desc { font-size:13px; color:var(--text3); margin-bottom:14px; }
.history-date-group { margin-bottom:28px; }
.history-date-label { font-size:12px; font-weight:700; color:var(--text3); letter-spacing:0.5px; text-transform:uppercase; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid var(--border); }
.overlay { position:fixed; inset:0; background:rgba(15,14,12,0.5); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); }
.modal { background:var(--white); border:1px solid var(--border); border-radius:var(--radius-xl); width:100%; max-width:500px; max-height:88vh; overflow-y:auto; padding:28px; box-shadow:var(--shadow-lg); position:relative; }
.modal-title { font-family:'Instrument Serif',serif; font-size:24px; font-weight:400; margin-bottom:20px; }
.modal-close { position:absolute; top:18px; right:18px; background:var(--bg); border:1px solid var(--border); color:var(--text2); cursor:pointer; font-size:16px; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all 0.12s; }
.modal-close:hover { background:var(--bg2); }
.timer-pill { position:fixed; bottom:24px; right:24px; z-index:1000; background:var(--white); border:1px solid var(--border); border-radius:var(--radius-xl); box-shadow:var(--shadow-lg); overflow:hidden; min-width:210px; }
.timer-pill.running { border-color:var(--accent); box-shadow:0 8px 30px rgba(37,99,235,0.15); }
.timer-pill.warning { border-color:var(--orange); box-shadow:0 8px 30px rgba(234,88,12,0.15); }
.timer-pill.done { border-color:var(--green); box-shadow:0 8px 30px rgba(22,163,74,0.15); }
.timer-progress-bar { height:3px; background:var(--bg2); }
.timer-progress-fill { height:100%; background:var(--accent); transition:width 0.9s linear; }
.timer-progress-fill.warning{background:var(--orange)} .timer-progress-fill.done{background:var(--green)}
.timer-body { padding:14px 16px; }
.timer-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.timer-label-text { font-size:11px; font-weight:700; color:var(--text3); letter-spacing:0.5px; text-transform:uppercase; }
.timer-time { font-size:42px; font-weight:800; letter-spacing:-2px; line-height:1; text-align:center; margin-bottom:12px; color:var(--text); }
.timer-time.running{color:var(--accent)} .timer-time.warning{color:var(--orange)} .timer-time.done{color:var(--green)}
.timer-controls { display:flex; gap:6px; margin-bottom:10px; }
.timer-presets { display:flex; gap:4px; flex-wrap:wrap; }
.timer-preset-btn { background:var(--bg); border:1px solid var(--border); color:var(--text2); border-radius:20px; padding:3px 9px; font-size:11px; font-weight:600; cursor:pointer; font-family:var(--font); transition:all 0.1s; }
.timer-preset-btn:hover { background:var(--accent-light); border-color:var(--accent-mid); color:var(--accent); }
.timer-collapsed { padding:12px 16px; display:flex; align-items:center; gap:10px; cursor:pointer; }
.toast { position:fixed; top:20px; right:20px; z-index:3000; background:var(--text); color:var(--white); border-radius:var(--radius); padding:11px 16px; font-size:13px; font-weight:600; box-shadow:var(--shadow-lg); display:flex; align-items:center; gap:8px; animation:toastIn 0.2s ease; }
@keyframes toastIn{from{transform:translateY(-8px);opacity:0}to{transform:translateY(0);opacity:1}}
.loading-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:var(--bg); gap:16px; }
.loading-spinner { width:36px; height:36px; border:3px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:64px 24px; color:var(--text3); text-align:center; }
.empty-icon { font-size:40px; margin-bottom:12px; opacity:0.5; }
.empty-title { font-size:15px; font-weight:600; color:var(--text2); margin-bottom:4px; }
.empty-desc { font-size:13px; }
.filter-tabs { display:flex; gap:4px; flex-wrap:wrap; }
.filter-tab { background:transparent; border:1px solid var(--border); color:var(--text2); border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.1s; font-family:var(--font); }
.filter-tab:hover { background:var(--white); color:var(--text); }
.filter-tab.active { background:var(--text); color:var(--white); border-color:var(--text); }
::-webkit-scrollbar{width:5px;height:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
@media(max-width:860px){
  .sidebar{width:64px;min-width:64px}
  .nav-item span,.logo-text,.sidebar-bottom{display:none}
  .logo-wrap{justify-content:center} .nav-item{justify-content:center;padding:10px}
  .page{padding:20px 16px} .grid-2,.grid-4{grid-template-columns:1fr}
  .timer-pill{bottom:12px;right:12px;min-width:180px}
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
const fmtDateFull = d => new Date(d).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

function Toast({ msg, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,2800); return()=>clearTimeout(t); },[]);
  return <div className="toast"><span>✓</span>{msg}</div>;
}

function Timer() {
  const [secs,setSecs]=useState(90);
  const [rem,setRem]=useState(90);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const [collapsed,setCollapsed]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(running&&rem>0){ ref.current=setInterval(()=>{ setRem(r=>{ if(r<=1){setRunning(false);setDone(true);clearInterval(ref.current);return 0;} return r-1; }); },1000); }
    return()=>clearInterval(ref.current);
  },[running]);
  const start=()=>{setDone(false);setRunning(true);};
  const pause=()=>{setRunning(false);clearInterval(ref.current);};
  const reset=()=>{setRunning(false);setDone(false);setRem(secs);clearInterval(ref.current);};
  const preset=s=>{setSecs(s);setRem(s);setRunning(false);setDone(false);clearInterval(ref.current);};
  const pct=rem/secs;
  const cls=done?"done":pct<=0.25?"warning":running?"running":"";
  if(collapsed) return (
    <div className={`timer-pill ${cls}`}>
      <div className="timer-progress-bar"><div className={`timer-progress-fill ${cls}`} style={{width:`${pct*100}%`}}/></div>
      <div className="timer-collapsed" onClick={()=>setCollapsed(false)}>
        <span>⏱</span>
        <span style={{fontSize:18,fontWeight:800,letterSpacing:-1,color:done?"var(--green)":pct<=0.25?"var(--orange)":running?"var(--accent)":"var(--text)"}}>{fmtTime(rem)}</span>
        <span style={{fontSize:11,color:"var(--text3)",marginLeft:"auto"}}>expand</span>
      </div>
    </div>
  );
  return (
    <div className={`timer-pill ${cls}`}>
      <div className="timer-progress-bar"><div className={`timer-progress-fill ${cls}`} style={{width:`${pct*100}%`}}/></div>
      <div className="timer-body">
        <div className="timer-header">
          <span className="timer-label-text">Rest Timer</span>
          <button className="btn btn-ghost btn-xs" onClick={()=>setCollapsed(true)}>—</button>
        </div>
        <div className={`timer-time ${cls}`}>{fmtTime(rem)}</div>
        <div className="timer-controls">
          {!running?<button className="btn btn-primary w-full btn-sm" onClick={start}>{done?"Restart":"Start"}</button>
            :<button className="btn btn-secondary w-full btn-sm" onClick={pause}>Pause</button>}
          <button className="btn btn-secondary btn-sm btn-icon" onClick={reset}>↺</button>
        </div>
        <div className="timer-presets">
          {[30,60,90,120,180].map(s=>(
            <button key={s} className="timer-preset-btn" onClick={()=>preset(s)}>{s<60?`${s}s`:`${s/60}m`}</button>
          ))}
        </div>
        <div className="flex-center gap-6 mt-8">
          <input type="number" className="input" style={{width:64,padding:"4px 8px",fontSize:12}} value={secs} min={5} max={3600}
            onChange={e=>{const v=Number(e.target.value);setSecs(v);setRem(v);setDone(false);setRunning(false);}}/>
          <span style={{fontSize:11,color:"var(--text3)"}}>custom sec</span>
        </div>
      </div>
    </div>
  );
}

// ── Library ─────────────────────────────────────────────────────────────────
function Library({ exercises, notify }) {
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("all");
  const [modal,setModal]=useState(false); const [editEx,setEditEx]=useState(null); const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({name:"",muscle:"chest",equipment:"barbell",notes:""});
  const filtered=exercises.filter(e=>(filter==="all"||e.muscle===filter)&&e.name.toLowerCase().includes(search.toLowerCase()));
  const openAdd=()=>{setEditEx(null);setForm({name:"",muscle:"chest",equipment:"barbell",notes:""});setModal(true);};
  const openEdit=e=>{setEditEx(e);setForm({name:e.name,muscle:e.muscle,equipment:e.equipment,notes:e.notes});setModal(true);};
  const save=async()=>{
    if(!form.name.trim())return; setSaving(true);
    try {
      if(editEx){await updateDoc(doc(db,"exercises",editEx.id),{...form,updatedAt:serverTimestamp()});notify("Exercise updated");}
      else{await addDoc(exercisesCol,{...form,createdAt:serverTimestamp()});notify("Exercise added");}
      setModal(false);
    }catch{notify("Error saving");}
    setSaving(false);
  };
  const del=async id=>{try{await deleteDoc(doc(db,"exercises",id));notify("Exercise removed");}catch{notify("Error");}};
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Exercise <em>Library</em></div>
        <div className="page-desc">Manage your personal exercise database</div>
      </div>
      <div className="flex-between mb-16 gap-12" style={{flexWrap:"wrap"}}>
        <div className="search-wrap" style={{flex:1,minWidth:180}}>
          <span className="search-icon">🔍</span>
          <input className="input" placeholder="Search exercises…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Exercise</button>
      </div>
      <div className="filter-tabs mb-16">
        {["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`filter-tab ${filter===g?"active":""}`} onClick={()=>setFilter(g)}>{g.charAt(0).toUpperCase()+g.slice(1)}</button>)}
      </div>
      {filtered.length===0?(<div className="empty-state"><div className="empty-icon">🏋️</div><div className="empty-title">No exercises found</div></div>):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {filtered.map(e=>(
            <div key={e.id} className="ex-card">
              <div className="flex-between mb-8">
                <span className={`tag tag-${e.muscle}`}>{e.muscle}</span>
                <div className="flex-center gap-4">
                  <button className="btn btn-ghost btn-xs" onClick={()=>openEdit(e)}>✏️</button>
                  <button className="btn btn-ghost btn-xs" style={{color:"var(--red)"}} onClick={()=>del(e.id)}>🗑</button>
                </div>
              </div>
              <div className="ex-name">{e.name}</div>
              <div className="ex-meta">{e.equipment}</div>
              {e.notes&&<div style={{fontSize:12,color:"var(--text3)",marginTop:6}}>{e.notes}</div>}
            </div>
          ))}
        </div>
      )}
      {modal&&(
        <div className="overlay" onClick={e=>e.target.classList.contains("overlay")&&setModal(false)}>
          <div className="modal">
            <button className="modal-close" onClick={()=>setModal(false)}>✕</button>
            <div className="modal-title">{editEx?"Edit Exercise":"New Exercise"}</div>
            <div className="input-group"><div className="input-label">Name</div><input className="input" placeholder="e.g. Incline Bench Press" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} autoFocus/></div>
            <div className="grid-2">
              <div className="input-group"><div className="input-label">Muscle Group</div><select className="input select" value={form.muscle} onChange={e=>setForm(f=>({...f,muscle:e.target.value}))}>{MUSCLE_GROUPS.map(g=><option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}</select></div>
              <div className="input-group"><div className="input-label">Equipment</div><select className="input select" value={form.equipment} onChange={e=>setForm(f=>({...f,equipment:e.target.value}))}>{["barbell","dumbbell","cable","machine","bodyweight","kettlebell","band","other"].map(eq=><option key={eq} value={eq}>{eq}</option>)}</select></div>
            </div>
            <div className="input-group"><div className="input-label">Notes <span style={{fontWeight:400,color:"var(--text3)"}}>— optional</span></div><input className="input" placeholder="Tips, cues…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            <div className="flex-center gap-8" style={{justifyContent:"flex-end"}}>
              <button className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?"Saving…":editEx?"Save Changes":"Add Exercise"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Plans ────────────────────────────────────────────────────────────────────
function Plans({ exercises, plans, notify }) {
  const [view,setView]=useState("list"); const [editPlan,setEditPlan]=useState(null);
  const [name,setName]=useState(""); const [desc,setDesc]=useState(""); const [planEx,setPlanEx]=useState([]);
  const [search,setSearch]=useState(""); const [exFilter,setExFilter]=useState("all"); const [saving,setSaving]=useState(false);
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
  const moveEx=(idx,dir)=>{const a=[...planEx];const s=idx+dir;if(s<0||s>=a.length)return;[a[idx],a[s]]=[a[s],a[idx]];setPlanEx(a);};

  if(view==="edit") return (
    <div className="page">
      <div className="flex-center gap-10 mb-16"><button className="btn btn-ghost btn-sm" onClick={()=>setView("list")}>← Back</button><div className="page-title" style={{fontSize:26,marginBottom:0}}>{editPlan?"Edit Plan":"New Plan"}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20,alignItems:"start"}}>
        <div>
          <div className="card mb-16">
            <div className="grid-2">
              <div className="input-group" style={{marginBottom:0}}><div className="input-label">Plan Name</div><input className="input" placeholder="e.g. Push Day A" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
              <div className="input-group" style={{marginBottom:0}}><div className="input-label">Description</div><input className="input" placeholder="Notes…" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
            </div>
          </div>
          <div className="section-head">Exercises ({planEx.length})</div>
          {planEx.length===0&&<div className="card" style={{textAlign:"center",padding:32,color:"var(--text3)",fontSize:14}}>Add exercises from the panel →</div>}
          {planEx.map((pe,idx)=>{
            const ex=exercises.find(e=>e.id===pe.exId);
            return (
              <div key={pe.id} className="card mb-8">
                <div className="flex-between mb-10">
                  <div className="flex-center gap-8"><span style={{fontSize:14,fontWeight:700}}>{ex?.name}</span><span className={`tag tag-${ex?.muscle}`}>{ex?.muscle}</span></div>
                  <div className="flex-center gap-4">
                    <button className="btn btn-ghost btn-xs" onClick={()=>moveEx(idx,-1)}>↑</button>
                    <button className="btn btn-ghost btn-xs" onClick={()=>moveEx(idx,1)}>↓</button>
                    <button className="btn btn-danger btn-xs" onClick={()=>removeEx(pe.id)}>Remove</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  {[["sets","Sets"],["reps","Reps"],["rest","Rest (s)"]].map(([f,l])=>(
                    <div key={f} style={{flex:1}}><div className="input-label">{l}</div><input type={f==="reps"?"text":"number"} className="input" value={pe[f]} onChange={e=>updateEx(pe.id,f,f==="reps"?e.target.value:Number(e.target.value))}/></div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex-center gap-8 mt-16" style={{justifyContent:"flex-end"}}>
            <button className="btn btn-secondary" onClick={()=>setView("list")}>Cancel</button>
            <button className="btn btn-primary" onClick={savePlan} disabled={saving}>{saving?"Saving…":"Save Plan"}</button>
          </div>
        </div>
        <div className="card" style={{position:"sticky",top:20}}>
          <div className="section-head mb-10">Add from Library</div>
          <div className="search-wrap mb-8"><span className="search-icon">🔍</span><input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="filter-tabs mb-10">{["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`filter-tab ${exFilter===g?"active":""}`} style={{padding:"2px 8px",fontSize:11}} onClick={()=>setExFilter(g)}>{g==="all"?"All":g}</button>)}</div>
          <div style={{maxHeight:380,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {filteredEx.map(e=>{
              const added=!!planEx.find(pe=>pe.exId===e.id);
              return (
                <div key={e.id} className={`ex-card ${added?"selected":""}`} onClick={()=>addEx(e)} style={{padding:"10px 12px"}}>
                  <div className="flex-between">
                    <div><div style={{fontSize:13,fontWeight:600}}>{e.name}</div><div className="flex-center gap-6 mt-4"><span className={`tag tag-${e.muscle}`}>{e.muscle}</span><span style={{fontSize:11,color:"var(--text3)"}}>{e.equipment}</span></div></div>
                    {added?<span style={{color:"var(--green)",fontSize:16}}>✓</span>:<span style={{color:"var(--text3)",fontSize:18}}>+</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div><div className="page-title">Workout <em>Plans</em></div><div className="page-desc">Build and manage your training routines</div></div>
        <button className="btn btn-primary" onClick={newPlan}>+ New Plan</button>
      </div>
      {plans.length===0?(<div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No plans yet</div><div className="empty-desc">Create your first workout routine</div></div>):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
          {plans.map(p=>(
            <div key={p.id} className="plan-card">
              <div className="flex-between mb-4"><div className="plan-name">{p.name}</div><button className="btn btn-ghost btn-xs" style={{color:"var(--red)"}} onClick={()=>delPlan(p.id)}>🗑</button></div>
              {p.desc&&<div className="plan-desc">{p.desc}</div>}
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:14}}>
                {(p.exercises||[]).slice(0,4).map(pe=>{const ex=exercises.find(e=>e.id===pe.exId);return ex?(<div key={pe.id} className="flex-between" style={{fontSize:13}}><span style={{color:"var(--text2)"}}>{ex.name}</span><span style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>{pe.sets}×{pe.reps}</span></div>):null;})}
                {(p.exercises||[]).length>4&&<span style={{fontSize:12,color:"var(--text3)"}}>+{p.exercises.length-4} more</span>}
              </div>
              <div className="flex-center gap-8"><button className="btn btn-secondary btn-sm w-full" onClick={()=>openPlan(p)}>Edit Plan</button><span style={{fontSize:12,color:"var(--text3)",whiteSpace:"nowrap"}}>{(p.exercises||[]).length} exercises</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Log Workout ──────────────────────────────────────────────────────────────
function LogWorkout({ exercises, plans, notify }) {
  const [step,setStep]=useState("pick"); const [source,setSource]=useState("plan");
  const [selPlan,setSelPlan]=useState(null); const [session,setSession]=useState([]);
  const [date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("all"); const [saving,setSaving]=useState(false);
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
      notify("Workout saved! Great work 💪");
      setSession([]);setStep("pick");setSelPlan(null);
    }catch{notify("Error saving workout");}
    setSaving(false);
  };
  const totalVol=session.reduce((a,se)=>a+se.sets.reduce((b,s)=>b+((Number(s.weight)||0)*(Number(s.reps)||0)),0),0);
  const doneSets=session.reduce((a,se)=>a+se.sets.filter(s=>s.done).length,0);
  const totalSets=session.reduce((a,se)=>a+se.sets.length,0);

  if(step==="pick") return (
    <div className="page">
      <div className="page-header"><div className="page-title">Log <em>Workout</em></div><div className="page-desc">Record your training session</div></div>
      <div className="input-group" style={{maxWidth:200,marginBottom:24}}><div className="input-label">Session Date</div><input type="date" className="input" value={date} onChange={e=>setDate(e.target.value)}/></div>
      <div className="flex-center gap-8 mb-24">
        <button className={`btn ${source==="plan"?"btn-primary":"btn-secondary"}`} onClick={()=>setSource("plan")}>From Plan</button>
        <button className={`btn ${source==="free"?"btn-primary":"btn-secondary"}`} onClick={()=>setSource("free")}>Freestyle</button>
      </div>
      {source==="plan"?(plans.length===0?(<div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No plans yet</div></div>):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
          {plans.map(p=>(<div key={p.id} className="plan-card" style={{cursor:"pointer"}} onClick={()=>startPlan(p)}><div className="plan-name mb-4">{p.name}</div>{p.desc&&<div className="plan-desc">{p.desc}</div>}<div style={{fontSize:13,color:"var(--text3)",marginBottom:12}}>{(p.exercises||[]).length} exercises</div><button className="btn btn-blue w-full btn-sm">Start This Plan →</button></div>))}
        </div>
      )):(
        <>
          {session.length>0&&(<div className="card mb-16" style={{borderColor:"var(--accent)",background:"var(--accent-light)"}}><div className="flex-between"><span style={{fontSize:14,fontWeight:600,color:"var(--accent)"}}>{session.length} exercises selected</span><button className="btn btn-blue btn-sm" onClick={()=>setStep("log")}>Start Logging →</button></div></div>)}
          <div className="search-wrap mb-10"><span className="search-icon">🔍</span><input className="input" placeholder="Search exercises…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="filter-tabs mb-12">{["all",...MUSCLE_GROUPS].map(g=><button key={g} className={`filter-tab ${filter===g?"active":""}`} onClick={()=>setFilter(g)}>{g==="all"?"All":g}</button>)}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {filteredEx.map(e=>{const sel=!!session.find(se=>se.exId===e.id);return(<div key={e.id} className={`ex-card ${sel?"selected":""}`} onClick={()=>addFreeEx(e)}><div className="flex-between"><div><div className="ex-name" style={{fontSize:13}}>{e.name}</div><span className={`tag tag-${e.muscle}`} style={{marginTop:4,display:"inline-block"}}>{e.muscle}</span></div>{sel?<span style={{color:"var(--green)",fontSize:16}}>✓</span>:<span style={{color:"var(--text3)",fontSize:18}}>+</span>}</div></div>);})}
          </div>
          {session.length>0&&<button className="btn btn-primary mt-16" onClick={()=>setStep("log")}>Start Logging ({session.length}) →</button>}
        </>
      )}
    </div>
  );

  return (
    <div className="page">
      <div className="flex-between mb-20">
        <div><div className="page-title" style={{fontSize:26}}>Active Session</div><div className="page-desc">{fmtDate(date)}{selPlan?` · ${selPlan.name}`:""}</div></div>
        <div className="flex-center gap-8">
          <button className="btn btn-secondary btn-sm" onClick={()=>{setStep("pick");setSession([]);setSelPlan(null);}}>Discard</button>
          <button className="btn btn-primary" onClick={finish} disabled={saving}>{saving?"Saving…":"Finish Workout"}</button>
        </div>
      </div>
      <div className="grid-4 mb-24">
        {[{label:"Volume",val:`${totalVol.toLocaleString()} kg`,cls:""},{label:"Sets Done",val:`${doneSets} / ${totalSets}`,cls:"blue"},{label:"Exercises",val:session.length,cls:""},{label:"Completion",val:`${totalSets?Math.round((doneSets/totalSets)*100):0}%`,cls:"green"}].map(s=>(
          <div key={s.label} className="stat-card"><div className="stat-label">{s.label}</div><div className={`stat-val ${s.cls}`}>{s.val}</div></div>
        ))}
      </div>
      {session.map(se=>(
        <div key={se.id} className="log-ex-block">
          <div className="log-ex-header">
            <div className="flex-center gap-8"><span className="log-ex-name">{se.name}</span><span className={`tag tag-${se.muscle}`}>{se.muscle}</span></div>
            <button className="btn btn-danger btn-xs" onClick={()=>removeEx(se.id)}>Remove</button>
          </div>
          <div className="log-ex-body">
            <table className="sets-table" style={{width:"100%"}}>
              <thead><tr><th>Set</th><th>Weight (kg)</th><th>Reps</th><th>Volume</th><th>Done</th><th></th></tr></thead>
              <tbody>
                {se.sets.map((s,i)=>(
                  <tr key={s.id} style={{opacity:s.done?0.5:1}}>
                    <td><span className="set-num">#{i+1}</span></td>
                    <td><input type="number" className="input" style={{width:90,padding:"5px 8px",fontSize:13}} placeholder="0" value={s.weight} min={0} step={0.5} onChange={e=>updSet(se.id,s.id,"weight",e.target.value)}/></td>
                    <td><input type="number" className="input" style={{width:70,padding:"5px 8px",fontSize:13}} placeholder="0" value={s.reps} min={0} onChange={e=>updSet(se.id,s.id,"reps",e.target.value)}/></td>
                    <td><span style={{fontSize:13,color:"var(--text3)",fontWeight:600}}>{((Number(s.weight)||0)*(Number(s.reps)||0)).toFixed(0)}</span></td>
                    <td><button className={`btn btn-xs ${s.done?"btn-green":"btn-secondary"}`} onClick={()=>toggleDone(se.id,s.id)}>{s.done?"✓ Done":"Mark Done"}</button></td>
                    <td><button className="btn btn-ghost btn-xs" style={{color:"var(--red)"}} onClick={()=>removeSet(se.id,s.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary btn-xs mt-8" onClick={()=>addSet(se.id)}>+ Add Set</button>
          </div>
        </div>
      ))}
      <div style={{marginTop:20,display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button className="btn btn-secondary" onClick={()=>{setStep("pick");setSession([]);setSelPlan(null);}}>Discard</button>
        <button className="btn btn-primary" onClick={finish} disabled={saving}>{saving?"Saving…":"Finish & Save"}</button>
      </div>
    </div>
  );
}

// ── Progress ─────────────────────────────────────────────────────────────────
function Progress({ exercises, logs }) {
  const [selEx,setSelEx]=useState(null); const [search,setSearch]=useState("");
  const exWithData=exercises.filter(ex=>logs.some(l=>l.exercises?.some(e=>e.exId===ex.id))&&ex.name.toLowerCase().includes(search.toLowerCase()));
  const getHist=exId=>logs.map(log=>{const ex=log.exercises?.find(e=>e.exId===exId);if(!ex||!ex.sets?.length)return null;return{date:log.date,max:Math.max(...ex.sets.map(s=>s.weight||0)),vol:ex.sets.reduce((a,s)=>a+(s.weight*s.reps),0)};}).filter(Boolean).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const totalVol=logs.reduce((a,l)=>a+(l.exercises||[]).reduce((b,e)=>b+(e.sets||[]).reduce((c,s)=>c+(s.weight*s.reps),0),0),0);
  const wkAgo=new Date();wkAgo.setDate(wkAgo.getDate()-7);
  const thisWeek=logs.filter(l=>new Date(l.date)>=wkAgo).length;
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Progress <em>Tracker</em></div><div className="page-desc">Visualize your strength gains over time</div></div>
      <div className="grid-4 mb-28">
        {[{label:"Total Workouts",val:logs.length,cls:""},{label:"This Week",val:thisWeek,cls:"blue",sub:"sessions"},{label:"Total Volume",val:`${(totalVol/1000).toFixed(1)}k`,cls:"green",sub:"kg lifted"},{label:"Exercises Tracked",val:exWithData.length,cls:"orange"}].map(s=>(
          <div key={s.label} className="stat-card"><div className="stat-label">{s.label}</div><div className={`stat-val ${s.cls}`}>{s.val}</div>{s.sub&&<div className="stat-sub">{s.sub}</div>}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:20,alignItems:"start"}}>
        <div>
          <div className="section-head">Exercises</div>
          <div className="search-wrap mb-10"><span className="search-icon">🔍</span><input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
          {exWithData.length===0?(<div className="card" style={{textAlign:"center",padding:32,color:"var(--text3)",fontSize:13}}>Log workouts to see progress</div>):(
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {exWithData.map(ex=>{
                const hist=getHist(ex.id);const latest=hist.at(-1);const prev=hist.at(-2);const up=latest&&prev?latest.max>prev.max:null;
                return (<div key={ex.id} className="card-flat" style={{padding:"12px 14px",cursor:"pointer",borderColor:selEx?.id===ex.id?"var(--accent)":"var(--border)",background:selEx?.id===ex.id?"var(--accent-light)":"var(--white)"}} onClick={()=>setSelEx(ex)}>
                  <div className="flex-between"><div><div style={{fontSize:14,fontWeight:600}}>{ex.name}</div><span className={`tag tag-${ex.muscle}`} style={{marginTop:4,display:"inline-block"}}>{ex.muscle}</span></div>
                  <div style={{textAlign:"right"}}>{latest&&<div style={{fontSize:18,fontWeight:800,letterSpacing:-0.5}}>{latest.max}<span style={{fontSize:11,fontWeight:400,color:"var(--text3)"}}>kg</span></div>}{up!==null&&<div style={{fontSize:12,color:up?"var(--green)":"var(--red)",fontWeight:600}}>{up?"↑ PR":"↓"}</div>}</div></div>
                </div>);
              })}
            </div>
          )}
        </div>
        {selEx&&(()=>{
          const hist=getHist(selEx.id);const maxW=Math.max(...hist.map(h=>h.max),1);const maxV=Math.max(...hist.map(h=>h.vol),1);
          return (<div>
            <div className="card mb-14">
              <div className="flex-between mb-16"><div><div style={{fontSize:17,fontWeight:700}}>{selEx.name}</div><div style={{fontSize:13,color:"var(--text3)"}}>Max weight over time</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:2}}>PERSONAL RECORD</div><div style={{fontSize:28,fontWeight:800,color:"var(--accent)",letterSpacing:-1}}>{Math.max(...hist.map(h=>h.max))}<span style={{fontSize:13,fontWeight:400,color:"var(--text3)"}}>kg</span></div></div></div>
              <div className="chart-wrap">{hist.slice(-14).map((h,i)=>(<div key={i} className="chart-col"><div className="chart-val">{h.max}</div><div className="chart-bar" style={{height:`${(h.max/maxW)*100}%`,background:"var(--accent)"}}/><div className="chart-label">{h.date?.slice(5)}</div></div>))}</div>
            </div>
            <div className="card mb-14">
              <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Total Volume per Session</div>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:12}}>Weight × Reps across all sets</div>
              <div className="chart-wrap">{hist.slice(-14).map((h,i)=>(<div key={i} className="chart-col"><div className="chart-val">{h.vol.toFixed(0)}</div><div className="chart-bar" style={{height:`${(h.vol/maxV)*100}%`,background:"var(--green)"}}/><div className="chart-label">{h.date?.slice(5)}</div></div>))}</div>
            </div>
            <div className="card"><div className="section-head">Session History</div>{hist.slice().reverse().map((h,i)=>(<div key={i} className="flex-between" style={{padding:"9px 0",borderBottom:"1px solid var(--border)",fontSize:13}}><span style={{color:"var(--text2)"}}>{fmtDate(h.date)}</span><div className="flex-center gap-16"><span>Max: <strong>{h.max}kg</strong></span><span style={{color:"var(--text3)"}}>Vol: {h.vol.toFixed(0)}kg</span></div></div>))}</div>
          </div>);
        })()}
        {!selEx&&exWithData.length>0&&<div className="card" style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,color:"var(--text3)",fontSize:14}}>Select an exercise to see its chart</div>}
      </div>
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────
function History({ logs, notify }) {
  const [expanded,setExpanded]=useState(null);
  const del=async id=>{try{await deleteDoc(doc(db,"logs",id));notify("Entry deleted");}catch{notify("Error deleting");}};
  const grouped=logs.reduce((acc,log)=>{const k=log.date;if(!acc[k])acc[k]=[];acc[k].push(log);return acc;},{});
  const dates=Object.keys(grouped).sort((a,b)=>new Date(b)-new Date(a));
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Workout <em>History</em></div><div className="page-desc">{logs.length} sessions logged</div></div>
      {dates.length===0?(<div className="empty-state"><div className="empty-icon">📅</div><div className="empty-title">No workouts yet</div><div className="empty-desc">Your logged sessions will appear here</div></div>):dates.map(date=>(
        <div key={date} className="history-date-group">
          <div className="history-date-label">{fmtDate(date)}</div>
          {grouped[date].map(log=>{
            const vol=(log.exercises||[]).reduce((a,e)=>a+(e.sets||[]).reduce((b,s)=>b+(s.weight*s.reps),0),0);
            const sets=(log.exercises||[]).reduce((a,e)=>a+(e.sets||[]).length,0);
            const muscles=[...new Set((log.exercises||[]).map(e=>e.muscle))];
            return (
              <div key={log.id} className="log-ex-block mb-8">
                <div className="log-ex-header" onClick={()=>setExpanded(expanded===log.id?null:log.id)}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{(log.exercises||[]).map(e=>e.name).join(", ").slice(0,52)}{(log.exercises||[]).map(e=>e.name).join(", ").length>52?"…":""}</div>
                    <div className="flex-center gap-6" style={{flexWrap:"wrap"}}>{muscles.map(m=><span key={m} className={`tag tag-${m}`}>{m}</span>)}<span style={{fontSize:12,color:"var(--text3)"}}>{sets} sets · {vol.toFixed(0)}kg vol</span></div>
                  </div>
                  <div className="flex-center gap-8">
                    <button className="btn btn-danger btn-xs" onClick={e=>{e.stopPropagation();del(log.id);}}>Delete</button>
                    <span style={{color:"var(--text3)",fontSize:13}}>{expanded===log.id?"▲":"▼"}</span>
                  </div>
                </div>
                {expanded===log.id&&(
                  <div className="log-ex-body">
                    {(log.exercises||[]).map((ex,i)=>(
                      <div key={i} style={{marginBottom:16}}>
                        <div className="flex-between mb-8"><span style={{fontWeight:700,fontSize:14}}>{ex.name}</span><span className={`tag tag-${ex.muscle}`}>{ex.muscle}</span></div>
                        <table className="sets-table"><thead><tr><th>Set</th><th>Weight</th><th>Reps</th><th>Volume</th></tr></thead><tbody>{(ex.sets||[]).map((s,j)=>(<tr key={j}><td><span className="set-num">#{j+1}</span></td><td><strong>{s.weight}kg</strong></td><td>{s.reps}</td><td><span style={{color:"var(--text3)",fontSize:13}}>{(s.weight*s.reps).toFixed(0)}kg</span></td></tr>))}</tbody></table>
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

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ exercises, logs, plans, setPage }) {
  const now=new Date();
  const wkAgo=new Date(now);wkAgo.setDate(now.getDate()-7);
  const weekLogs=logs.filter(l=>new Date(l.date)>=wkAgo);
  const totalVol=logs.reduce((a,l)=>a+(l.exercises||[]).reduce((b,e)=>b+(e.sets||[]).reduce((c,s)=>c+(s.weight*s.reps),0),0),0);
  const weekVol=weekLogs.reduce((a,l)=>a+(l.exercises||[]).reduce((b,e)=>b+(e.sets||[]).reduce((c,s)=>c+(s.weight*s.reps),0),0),0);
  const muscleFreq={};logs.forEach(l=>(l.exercises||[]).forEach(e=>{muscleFreq[e.muscle]=(muscleFreq[e.muscle]||0)+1;}));
  const topMuscles=Object.entries(muscleFreq).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxFreq=topMuscles[0]?.[1]||1;
  const recent=logs.slice(0,4);
  const days7=[...Array(7)].map((_,i)=>{const d=new Date(now);d.setDate(d.getDate()-6+i);return d.toISOString().split("T")[0];});
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Good {now.getHours()<12?"Morning":now.getHours()<17?"Afternoon":"Evening"} <em>Athlete</em></div><div className="page-desc">{fmtDateFull(now)}</div></div>
      <div className="grid-4 mb-24">
        {[{label:"All-Time Workouts",val:logs.length,cls:""},{label:"This Week",val:weekLogs.length,cls:"blue",sub:"sessions"},{label:"Week Volume",val:`${(weekVol/1000).toFixed(1)}k kg`,cls:"green"},{label:"Total Volume",val:`${(totalVol/1000).toFixed(1)}k kg`,cls:"orange"}].map(s=>(
          <div key={s.label} className="stat-card"><div className="stat-label">{s.label}</div><div className={`stat-val ${s.cls}`}>{s.val}</div>{s.sub&&<div className="stat-sub">{s.sub}</div>}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div className="card">
          <div className="section-head mb-16">Weekly Activity</div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:60}}>
            {days7.map((d)=>{const count=logs.filter(l=>l.date===d).length;return(<div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:"100%",background:count>0?"var(--accent)":"var(--bg2)",borderRadius:3,height:count>0?Math.max(count*20,12):8,transition:"height 0.3s"}}/><div style={{fontSize:10,color:"var(--text3)",fontWeight:500}}>{"SMTWTFS"[new Date(d).getDay()]}</div></div>);})}
          </div>
        </div>
        <div className="card">
          <div className="section-head mb-12">Quick Actions</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[{label:"Start a Workout",icon:"💪",page:"log"},{label:"Create a Plan",icon:"📋",page:"plans"},{label:"Add Exercise",icon:"➕",page:"library"}].map(a=>(
              <button key={a.label} className="btn btn-secondary w-full" style={{justifyContent:"flex-start",gap:10}} onClick={()=>setPage(a.page)}><span>{a.icon}</span>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="card">
          <div className="section-head mb-12">Recent Sessions</div>
          {recent.length===0?(<div style={{textAlign:"center",padding:"24px 0",color:"var(--text3)",fontSize:13}}>No workouts logged yet</div>):recent.map(l=>{
            const vol=(l.exercises||[]).reduce((a,e)=>a+(e.sets||[]).reduce((b,s)=>b+(s.weight*s.reps),0),0);
            return (<div key={l.id} style={{padding:"10px 0",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{(l.exercises||[]).map(e=>e.name).join(", ").slice(0,36)}{(l.exercises||[]).map(e=>e.name).join(", ").length>36?"…":""}</div><div style={{fontSize:11,color:"var(--text3)"}}>{fmtDate(l.date)} · {(l.exercises||[]).length} exercises</div></div><div style={{fontSize:13,fontWeight:700}}>{vol.toFixed(0)}<span style={{fontSize:10,fontWeight:400,color:"var(--text3)",marginLeft:2}}>kg</span></div></div>);
          })}
        </div>
        <div className="card">
          <div className="section-head mb-12">Muscle Focus</div>
          {topMuscles.length===0?(<div style={{textAlign:"center",padding:"24px 0",color:"var(--text3)",fontSize:13}}>Train to see muscle stats</div>):topMuscles.map(([muscle,count])=>(
            <div key={muscle} style={{marginBottom:10}}><div className="flex-between mb-4"><span className={`tag tag-${muscle}`}>{muscle}</span><span style={{fontSize:12,color:"var(--text3)",fontWeight:600}}>{count}×</span></div><div className="prog-bar-wrap"><div className="prog-bar-fill" style={{width:`${(count/maxFreq)*100}%`,background:"var(--accent)"}}/></div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("dashboard");
  const [exercises,setExercises]=useState([]);
  const [plans,setPlans]=useState([]);
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const seededRef=useRef(false);
  const notify=msg=>setToast(msg);

  const seedDefaults=async()=>{
    for(const ex of DEFAULT_EXERCISES){
      await addDoc(exercisesCol,{...ex,createdAt:serverTimestamp()});
    }
  };

  useEffect(()=>{
    const unsubEx=onSnapshot(query(exercisesCol,orderBy("createdAt","asc")),snap=>{
      const data=snap.docs.map(d=>({id:d.id,...d.data()}));
      setExercises(data);
      if(data.length===0&&!seededRef.current){seededRef.current=true;seedDefaults();}
      setLoading(false);
    });
    const unsubPlans=onSnapshot(query(plansCol,orderBy("createdAt","desc")),snap=>{setPlans(snap.docs.map(d=>({id:d.id,...d.data()})));});
    const unsubLogs=onSnapshot(query(logsCol,orderBy("createdAt","desc")),snap=>{setLogs(snap.docs.map(d=>({id:d.id,...d.data()})));});
    return()=>{unsubEx();unsubPlans();unsubLogs();};
  },[]);

  const NAV=[
    {id:"dashboard",icon:"◈",label:"Dashboard"},
    {id:"log",icon:"＋",label:"Log Workout"},
    {id:"plans",icon:"▤",label:"Plans"},
    {id:"library",icon:"◻",label:"Library"},
    {id:"progress",icon:"↗",label:"Progress"},
    {id:"history",icon:"◷",label:"History"},
  ];

  if(loading) return (
    <>
      <style>{CSS}</style>
      <div className="loading-screen">
        <div className="loading-spinner"/>
        <div style={{fontSize:14,color:"var(--text3)",fontFamily:"var(--font)"}}>Connecting to Firebase…</div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-top">
            <div className="logo-wrap">
              <div className="logo-icon">🔥</div>
              <div className="logo-text">Forge<span>Workout Tracker</span></div>
            </div>
            <div className="nav-section-label" style={{marginBottom:8}}>Menu</div>
            {NAV.map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </div>
          <div className="sidebar-bottom">
            <div className="firebase-note">
              <div className="firebase-dot" style={{background:"var(--green)"}}/>
              <span>Firebase connected</span>
            </div>
          </div>
        </nav>
        <main className="main">
          {page==="dashboard"&&<Dashboard exercises={exercises} logs={logs} plans={plans} setPage={setPage}/>}
          {page==="log"&&<LogWorkout exercises={exercises} plans={plans} notify={notify}/>}
          {page==="plans"&&<Plans exercises={exercises} plans={plans} notify={notify}/>}
          {page==="library"&&<Library exercises={exercises} notify={notify}/>}
          {page==="progress"&&<Progress exercises={exercises} logs={logs}/>}
          {page==="history"&&<History logs={logs} notify={notify}/>}
        </main>
        <Timer/>
        {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
      </div>
    </>
  );
}
