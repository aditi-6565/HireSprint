import React, {useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Activity, BarChart3, Brain, CheckCircle2, ChevronRight, CircleUserRound,
  Clock3, Code2, Flame, Gauge, LayoutDashboard, Mic, MessageSquare,
  Play, Radio, Settings, ShieldCheck, Sparkles, Trophy, Users, Video,
  Volume2, Zap
} from "lucide-react";
import "./styles.css";

type Agent = {id:string; name:string; role:string; initials:string; accent:string; avatar:string};
type Msg = {speaker:string; text:string; time:string; type:"ai"|"student"};

const agents: Agent[] = [
  {id:"alex",name:"Alex",role:"Analytical",initials:"AX",accent:"cyan",avatar:"A"},
  {id:"riya",name:"Riya",role:"Creative Thinker",initials:"RY",accent:"violet",avatar:"R"},
  {id:"arjun",name:"Arjun",role:"Critical Analyst",initials:"AR",accent:"orange",avatar:"A"},
  {id:"neha",name:"Neha",role:"Team Leader",initials:"NH",accent:"green",avatar:"N"}
];

const scripts = [
  {speaker:"alex", text:"I think AI can significantly improve education by personalizing learning paths for different students."},
  {speaker:"riya", text:"I agree, and I would add that AI can make learning more interactive instead of simply automating existing content."},
  {speaker:"arjun", text:"That's useful, but we should consider the digital divide. Access and privacy can become major concerns."},
  {speaker:"neha", text:"Good points from both sides. A balanced approach should combine personalization with strong safeguards and human guidance."}
];

function App(){
  const [page,setPage]=useState("dashboard");
  const [discussion,setDiscussion]=useState<Msg[]>([]);
  const [active,setActive]=useState<string>("alex");
  const [running,setRunning]=useState(false);
  const [studentText,setStudentText]=useState("");
  const [score,setScore]=useState(78);
  const [mic,setMic]=useState(false);
  const timerRef=useRef<number|undefined>();

  const addMessage=(m:Msg)=>setDiscussion(d=>[...d,m]);

  const runDemo=()=>{
    if(running) return;
    setRunning(true);
    setDiscussion([]);
    let i=0;
    const step=()=>{
      if(i>=scripts.length){setRunning(false);setActive("");return}
      const s=scripts[i]; setActive(s.speaker);
      addMessage({speaker:s.speaker,text:s.text,time:`0${i+1}:2${i}`,type:"ai"});
      i++;
      timerRef.current=window.setTimeout(step,2200);
    };
    step();
  };

  useEffect(()=>()=>{if(timerRef.current)clearTimeout(timerRef.current)},[]);

  const submitStudent=()=>{
    if(!studentText.trim()) return;
    addMessage({speaker:"student",text:studentText.trim(),time:"04:48",type:"student"});
    setStudentText("");
    setScore(s=>Math.min(98,s+2));
    setActive("student");
    window.setTimeout(()=>setActive("neha"),1000);
  };

  const speak=()=>{
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR){alert("Speech recognition is not supported in this browser. You can use Chrome/Edge or type your response.");return}
    if(mic){setMic(false);return}
    const r=new SR(); r.lang="en-IN"; r.interimResults=false;
    r.onstart=()=>setMic(true); r.onend=()=>setMic(false);
    r.onresult=(e:any)=>setStudentText(e.results[0][0].transcript);
    r.start();
  };

  return <div className="app">
    <Sidebar page={page} setPage={setPage}/>
    <main>
      <Topbar page={page}/>
      {page==="dashboard" && <Dashboard go={setPage}/>}
      {page==="aptitude" && <Aptitude go={setPage}/>}
      {page==="ai-gd" && <AIGD discussion={discussion} active={active} running={running} runDemo={runDemo} studentText={studentText} setStudentText={setStudentText} submitStudent={submitStudent} speak={speak} mic={mic}/>}
      {page==="evaluation" && <Evaluation score={score}/>}
      {page==="live-gd" && <LiveGD/>}
      {page==="analytics" && <Analytics/>}
      {page==="admin" && <Admin/>}
    </main>
  </div>
}

function Sidebar({page,setPage}:{page:string,setPage:(x:string)=>void}){
 const items=[
  ["dashboard","Overview",LayoutDashboard],["aptitude","Aptitude Lab",Brain],["ai-gd","AI Agent GD",Sparkles],
  ["live-gd","Live GD",Video],["analytics","My Analytics",BarChart3],["admin","Placement Cell",ShieldCheck]
 ] as any[];
 return <aside>
   <div className="brand"><div className="logo">C</div><div><b>HireSprint</b><span>Placement Intelligence</span></div></div>
   <div className="side-title">WORKSPACE</div>
   {items.map(([id,label,Icon]:any)=><button key={id} className={`nav ${page===id?"active":""}`} onClick={()=>setPage(id)}><Icon size={18}/>{label}{id==="ai-gd"&&<i>AI</i>}</button>)}
   <div className="side-bottom"><button className="nav"><Settings size={18}/>Settings</button><div className="mini-card"><div className="status-dot"/><div><b>AI Engine</b><span>Demo simulation online</span></div></div></div>
 </aside>
}

function Topbar({page}:{page:string}){
 const titles:any={dashboard:"Good evening, Aditi",aptitude:"Aptitude Lab","ai-gd":"AI Agent Group Discussion","live-gd":"Live GD Room",analytics:"Performance Analytics",admin:"Placement Dashboard",evaluation:"AI Evaluation Report"};
 return <header><div><span className="eyebrow">HireSprint / {page.replace("-"," ").toUpperCase()}</span><h1>{titles[page]}</h1></div><div className="top-actions"><div className="pill"><span className="online"/> AI systems ready</div><div className="avatar-user">AP</div></div></header>
}

function Dashboard({go}:{go:(x:string)=>void}){
 return <section className="page">
  <div className="hero"><div><div className="tag"><Sparkles size={14}/> PERSONALIZED PLACEMENT PREP</div><h2>Train like the interview<br/><em>starts tomorrow.</em></h2><p>Practice aptitude, enter realistic group discussions, and turn every attempt into measurable progress.</p><div className="hero-actions"><button className="primary" onClick={()=>go("ai-gd")}><Play size={16}/> Start AI GD</button><button className="secondary" onClick={()=>go("aptitude")}>Practice Aptitude <ChevronRight size={16}/></button></div></div><div className="hero-orb"><div className="orb-core"><Brain size={40}/><span>78%</span><small>readiness</small></div><div className="ring r1"/><div className="ring r2"/></div></div>
  <div className="stats"><Stat icon={Flame} label="Practice streak" value="12 days" note="+3 this week"/><Stat icon={Trophy} label="Assessments" value="18" note="4 this month"/><Stat icon={Gauge} label="Readiness score" value="78%" note="+6% vs last week"/><Stat icon={Activity} label="GD participation" value="84%" note="Above target"/></div>
  <div className="grid2"><div className="panel"><div className="panel-head"><div><span className="eyebrow">RECOMMENDED</span><h3>Continue your preparation</h3></div><button className="ghost" onClick={()=>go("ai-gd")}>Open <ChevronRight size={15}/></button></div><div className="recommend"><div className="rec-icon"><Sparkles/></div><div><b>AI Group Discussion</b><p>Topic: “AI in Education” · Intermediate · 10 min</p></div><button className="round" onClick={()=>go("ai-gd")}><Play size={16}/></button></div></div>
  <div className="panel"><div className="panel-head"><div><span className="eyebrow">SKILL MIX</span><h3>Current profile</h3></div></div><div className="bars"><Bar label="Aptitude" val={82}/><Bar label="Communication" val={76}/><Bar label="Leadership" val={71}/><Bar label="Problem solving" val={88}/></div></div></div>
 </section>
}

function Stat({icon:Icon,label,value,note}:any){return <div className="stat"><Icon size={19}/><span>{label}</span><b>{value}</b><small>{note}</small></div>}
function Bar({label,val}:{label:string,val:number}){return <div className="barrow"><div><span>{label}</span><b>{val}%</b></div><div className="track"><i style={{width:`${val}%`}}/></div></div>}

function Aptitude({go}:{go:(x:string)=>void}){
 const [started,setStarted]=useState(false); const [q,setQ]=useState(1);
 return <section className="page"><div className="section-title"><div><span className="eyebrow">ASSESSMENT ENGINE</span><h2>Quantitative Aptitude</h2><p>Timed assessment with instant evaluation and progress history.</p></div><div className="timer"><Clock3 size={16}/> 18:42</div></div>
 <div className="apt-grid"><div className="question panel"><div className="qtop"><span>QUESTION {q} / 10</span><span>Difficulty · Medium</span></div><h3>If a train travels 360 km in 4 hours, what is its average speed?</h3><div className="options">{["72 km/h","80 km/h","90 km/h","96 km/h"].map((x,i)=><button className={q===2&&i===2?"chosen":""} key={x} onClick={()=>setQ(Math.min(10,q+1))}><span>{String.fromCharCode(65+i)}</span>{x}</button>)}</div><div className="qfoot"><small>Question {q} of 10</small><button className="primary small" onClick={()=>{setStarted(true);go("dashboard")}}>{started?"Submit":"Save & Continue"} <ChevronRight size={15}/></button></div></div>
 <div className="panel tips"><span className="eyebrow">LIVE STATUS</span><h3>Your assessment</h3><div className="donut"><strong>40%</strong><span>completed</span></div><div className="tipline"><CheckCircle2/> 4 answered</div><div className="tipline"><Clock3/> 18:42 remaining</div><div className="tipline"><Zap/> Difficulty adapting</div></div></div></section>
}

function AgentCard({a,active}:{a:Agent,active:boolean}){return <div className={`agent-card ${active?"speaking":""}`}><div className={`agent-avatar ${a.accent}`}>{a.initials}</div><div><b>{a.name}</b><span>{a.role}</span></div>{active&&<div className="wave"><i/><i/><i/><i/></div>}</div>}

function AIGD({discussion,active,running,runDemo,studentText,setStudentText,submitStudent,speak,mic}:{discussion:Msg[],active:string,running:boolean,runDemo:()=>void,studentText:string,setStudentText:(x:string)=>void,submitStudent:()=>void,speak:()=>void,mic:boolean}){
 return <section className="page">
  <div className="gd-header"><div><span className="eyebrow">MULTI-AGENT SIMULATION</span><h2>AI Group Discussion</h2><p>Watch autonomous AI personas exchange viewpoints — then enter the discussion yourself.</p></div><div className="gd-meta"><span><Radio size={14}/> LIVE SIMULATION</span><b>06:42</b></div></div>
  <div className="gd-layout">
   <div className="discussion-stage panel">
    <div className="stage-top"><div><b>Topic</b><span>AI in Education: Opportunity or Risk?</span></div><div className="participants"><Users size={15}/> 5 participants</div></div>
    <div className="agent-ring">
      <div className="orbit o1"/><div className="orbit o2"/>
      <div className="agent-pos p1"><AgentCard a={agents[0]} active={active==="alex"}/></div>
      <div className="agent-pos p2"><AgentCard a={agents[1]} active={active==="riya"}/></div>
      <div className="agent-pos p3"><AgentCard a={agents[2]} active={active==="arjun"}/></div>
      <div className="agent-pos p4"><AgentCard a={agents[3]} active={active==="neha"}/></div>
      <div className={`student-node ${active==="student"?"speaking":""}`}><CircleUserRound/><b>YOU</b><small>Participant</small></div>
      <div className="center-ai"><Sparkles size={25}/><b>AI</b><span>orchestrator</span></div>
    </div>
    <div className="stage-controls"><button className="primary" onClick={runDemo} disabled={running}>{running?<><Activity size={16}/> Agents communicating…</>:<><Play size={16}/> Run AI Discussion</>}</button><span>{running?"AI agents are exchanging viewpoints":"Start the simulation to visualize agent-to-agent communication"}</span></div>
   </div>
   <div className="transcript panel"><div className="panel-head"><div><span className="eyebrow">LIVE TRANSCRIPT</span><h3>Conversation</h3></div><span className="live-dot">● LIVE</span></div><div className="messages">{discussion.length===0?<div className="empty"><MessageSquare size={28}/><b>No discussion yet</b><span>Start the simulation and the AI agents will begin responding to one another.</span></div>:discussion.map((m,i)=><div className={`message ${m.type}`} key={i}><div className="msg-avatar">{m.speaker==="student"?"YOU":agents.find(a=>a.id===m.speaker)?.initials}</div><div><div className="msg-meta"><b>{m.speaker==="student"?"You":agents.find(a=>a.id===m.speaker)?.name}</b><span>{m.time}</span></div><p>{m.text}</p></div></div>)}</div>
   <div className="composer"><input value={studentText} onChange={e=>setStudentText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitStudent()} placeholder="Add your point to the discussion…"/><button className={mic?"mic-on":""} onClick={speak}><Mic size={17}/></button><button className="send" onClick={submitStudent}><ChevronRight size={18}/></button></div></div>
  </div>
  <div className="gd-metrics"><Metric label="Relevance" value="86%"/><Metric label="Communication" value="78%"/><Metric label="Participation" value="72%"/><Metric label="Leadership" value="69%"/><Metric label="Topic coverage" value="91%"/></div>
 </section>
}

function Metric({label,value}:{label:string,value:string}){return <div><span>{label}</span><b>{value}</b><div className="mini-track"><i style={{width:value}}/></div></div>}

function Evaluation({score}:{score:number}){return <section className="page"><div className="section-title"><div><span className="eyebrow">AI FEEDBACK</span><h2>Evaluation Report</h2><p>Generated from the discussion transcript and participation signals.</p></div><div className="score-big">{score}<small>/100</small></div></div><div className="eval-grid"><div className="panel"><h3>Performance dimensions</h3><Bar label="Relevance" val={86}/><Bar label="Communication" val={78}/><Bar label="Participation" val={84}/><Bar label="Argument quality" val={81}/><Bar label="Leadership signals" val={69}/></div><div className="panel feedback"><span className="eyebrow">AI COACH</span><h3>What to improve next</h3><div className="feed"><CheckCircle2/><p><b>Build on others' points.</b><br/>Connect your argument to a previous speaker before introducing a new idea.</p></div><div className="feed"><CheckCircle2/><p><b>Use concise evidence.</b><br/>Support major claims with one concrete example to make your contribution stronger.</p></div><div className="feed"><CheckCircle2/><p><b>Increase leadership moments.</b><br/>Summarize competing viewpoints and invite a quieter participant into the discussion.</p></div></div></div></section>}

function LiveGD(){return <section className="page"><div className="section-title"><div><span className="eyebrow">REAL-TIME WEBRTC ROOM</span><h2>Live Student GD</h2><p>A prototype room for student-to-student discussion with real-time event signaling.</p></div><span className="room-code">ROOM · CX-2048</span></div><div className="video-grid">{["You","Rahul","Priya","Karan"].map((n,i)=><div className="video-card" key={n}><div className="video-placeholder">{i===0?<CircleUserRound size={44}/>:<div className="person-dot">{n[0]}</div>}<span className="video-name">{n}</span><span className="connection"><span/> Connected</span></div></div>)}</div><div className="livebar panel"><div><Radio/> <b>Discussion in progress</b><span>08:16 elapsed · 4 participants</span></div><button className="danger">Leave room</button></div></section>}

function Analytics(){return <section className="page"><div className="section-title"><div><span className="eyebrow">PERFORMANCE INTELLIGENCE</span><h2>Your progress</h2><p>Track improvement across aptitude and communication assessments.</p></div></div><div className="chart panel"><div className="panel-head"><div><h3>Readiness trend</h3><span>Last 8 assessments</span></div><b className="trend">+14%</b></div><div className="chart-area">{[54,59,61,65,63,71,75,78].map((v,i)=><div className="chart-col" key={i}><div className="bar" style={{height:`${v*2.2}px`}}/><span>A{i+1}</span></div>)}</div></div><div className="grid2"><div className="panel"><h3>Skill breakdown</h3><Bar label="Problem solving" val={88}/><Bar label="Aptitude" val={82}/><Bar label="Communication" val={76}/><Bar label="Leadership" val={71}/></div><div className="panel"><h3>Recent assessments</h3><div className="assessment-row"><span>AI GD · Education</span><b>78</b><small>Today</small></div><div className="assessment-row"><span>Aptitude · Mixed</span><b>84</b><small>2 days ago</small></div><div className="assessment-row"><span>AI GD · Technology</span><b>73</b><small>5 days ago</small></div></div></div></section>}

function Admin(){return <section className="page"><div className="section-title"><div><span className="eyebrow">PLACEMENT CELL</span><h2>Assessment Overview</h2><p>Monitor participation and aggregate performance for placement preparation.</p></div></div><div className="stats"><Stat icon={Users} label="Active students" value="486" note="+32 this month"/><Stat icon={CheckCircle2} label="Assessments" value="1,284" note="This semester"/><Stat icon={Activity} label="Avg readiness" value="74%" note="+5% this month"/><Stat icon={Trophy} label="GD completion" value="81%" note="Across cohorts"/></div><div className="panel table"><div className="panel-head"><h3>Recent activity</h3><span>Updated just now</span></div>{["Aptitude Assessment","AI GD · AI in Education","Live GD Room","AI GD · Future of Work","Aptitude Assessment"].map((x,i)=><div className="table-row" key={i}><span>{x}</span><span>{["Completed","Completed","In progress","Completed","Completed"][i]}</span><b>{[84,78,"—",81,91][i]}</b></div>)}</div></section>}

createRoot(document.getElementById("root")!).render(<App/>);