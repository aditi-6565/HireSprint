import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" } });
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);
const DEMO_MODE = process.env.DEMO_MODE !== "false";
const JWT_SECRET = process.env.JWT_SECRET || "hiresprint-development-secret";

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

const questions = [
  { id:1, text:"If a train travels 360 km in 4 hours, what is its average speed?", options:["72 km/h","80 km/h","90 km/h","96 km/h"], answer:2 },
  { id:2, text:"A product marked at ₹1,000 is sold at a 10% discount. What is the selling price?", options:["₹850","₹900","₹910","₹950"], answer:1 },
  { id:3, text:"What is the next number in the series 2, 6, 12, 20, 30, ?", options:["36","40","42","44"], answer:2 }
];
const agents = [
  {id:"alex",name:"Alex",role:"Analytical"},{id:"riya",name:"Riya",role:"Creative Thinker"},{id:"arjun",name:"Arjun",role:"Critical Analyst"},{id:"neha",name:"Neha",role:"Team Leader"}
];
const demoUser = { id:"demo-user", name:"Aditi", email:"demo@hiresprint.local", role:"STUDENT" };

app.get("/api/health", (_req,res)=>res.json({ok:true,service:"HireSprint API",mode:DEMO_MODE?"demo":"postgres"}));
app.post("/api/auth/login", async (req,res)=>{
  const {email,password}=req.body || {};
  if(!email || !password) return res.status(400).json({message:"Email and password are required"});
  if(DEMO_MODE){
    const token=jwt.sign({sub:demoUser.id,email:demoUser.email,role:demoUser.role},JWT_SECRET,{expiresIn:"2h"});
    return res.json({token,user:demoUser});
  }
  const user=await prisma.user.findUnique({where:{email}});
  if(!user || !(await bcrypt.compare(password,user.passwordHash))) return res.status(401).json({message:"Invalid credentials"});
  const token=jwt.sign({sub:user.id,email:user.email,role:user.role},JWT_SECRET,{expiresIn:"2h"});
  res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
});

app.get("/api/dashboard", async (_req,res)=>res.json({
  readiness:78, streak:12, assessments:18, gdParticipation:84,
  skills:{aptitude:82,communication:76,leadership:71,problemSolving:88},
  recent:[{type:"AI GD",topic:"AI in Education",score:78,date:"Today"},{type:"Aptitude",topic:"Mixed",score:84,date:"2 days ago"}]
}));
app.get("/api/aptitude/questions", (_req,res)=>res.json({questions}));
app.post("/api/aptitude/submit", async (req,res)=>{
  const answers = req.body?.answers || [];
  const correct = answers.reduce((n:number,a:any)=> n + (questions.find(q=>q.id===a.questionId)?.answer===a.answer ? 1:0),0);
  const score=Math.round((correct/Math.max(questions.length,1))*100);
  if(!DEMO_MODE && req.body?.userId){ await prisma.assessment.create({data:{userId:req.body.userId,type:"APTITUDE",score,metadata:{answers}}}); }
  res.json({score,correct,total:questions.length});
});
app.get("/api/gd/agents", (_req,res)=>res.json({agents}));
app.post("/api/gd/evaluate", async (req,res)=>{
  const text=String(req.body?.text || "");
  const score=Math.min(98, Math.max(45, 60 + Math.min(30, Math.floor(text.length/12))));
  const result={score,relevance:Math.min(95,score+6),communication:Math.min(94,score),participation:Math.min(96,score+4),leadership:Math.max(55,score-9),feedback:["Build on another speaker's point before introducing a new idea.","Use one concrete example to support your main claim.","Summarize competing viewpoints to show leadership."]};
  if(!DEMO_MODE && req.body?.userId) await prisma.assessment.create({data:{userId:req.body.userId,type:"AI_GD",topic:req.body?.topic||"AI in Education",score,metadata:result}});
  res.json(result);
});
app.get("/api/analytics", (_req,res)=>res.json({trend:[54,59,61,65,63,71,75,78],skills:{problemSolving:88,aptitude:82,communication:76,leadership:71}}));

io.on("connection", socket=>{
  socket.on("room:join", ({roomId,name})=>{ socket.join(roomId); socket.to(roomId).emit("room:user-joined",{id:socket.id,name}); });
  socket.on("room:message", ({roomId,name,text})=>io.to(roomId).emit("room:message",{name,text,time:new Date().toISOString()}));
  socket.on("webrtc:offer", ({roomId,target,offer})=>io.to(target).emit("webrtc:offer",{from:socket.id,offer,roomId}));
  socket.on("webrtc:answer", ({target,answer})=>io.to(target).emit("webrtc:answer",{from:socket.id,answer}));
  socket.on("webrtc:ice", ({target,candidate})=>io.to(target).emit("webrtc:ice",{from:socket.id,candidate}));
  socket.on("room:leave", ({roomId})=>socket.leave(roomId));
});

app.use((_req,res)=>res.status(404).json({message:"API route not found"}));
server.listen(PORT,()=>console.log(`HireSprint API running on http://localhost:${PORT} (${DEMO_MODE?"demo mode":"PostgreSQL mode"})`));
