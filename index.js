const express = require("express");
const cors = require("cors");
const { initializeApp } = require("firebase/app");
const app = express();
const { getFirestore, collection, getDocs,addDoc,setDoc,doc } = require("firebase/firestore/lite");
require("dotenv").config();
require("firebase/firestore");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  allowedHeaders:["*"],
  origin:"*",
}));

const firebaseConfig = {
	apiKey:process.env.API_KEY,
	authDomain:process.env.AUTH_DOMAIN,
	projectId:process.env.PROJECT_ID,
	storageBucket:process.env.STORAGE_BUCKET,
	messagingSenderId:process.env.MESSAGING_SENDER_ID,
	appId:process.env.APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db=getFirestore(firebaseApp);
// app.listen(3000, () => console.log("Server partito"));
app.get("/todos",async (req,res)=>{
  const querySnapshot=await getDocs(collection(db,"todos"));
  const ris=querySnapshot.docs.sort((a,b)=>Number(a.id)-Number(b.id)).map(doc => {
    const ris={};
    ris.userId=doc.data().userId;
    ris.id=doc.id;
    ris.title=doc.data().title;
    ris.completed=doc.data().completed;
    return ris;
  });
  return res.send(ris);
});

app.get("/todo/:id",async(req,res)=>{
  const querySnapshot=await getDocs(collection(db,"todos"));
  const ris=querySnapshot.docs.find(doc=>doc.id==req.params.id);
  if(ris!==undefined) return res.send(ris.data());
  res.status(404).send("Todo non trovato");
});

app.post("/todo/:id",async(req,res)=>{
  console.log(req.query);
  res.send({ok:true});
});

app.post("/todos/add",async(req,res)=>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader("Access-Control-Allow-Headers", "*");
  let {userId,title,completed}=req.body;
  if(userId=="") return res.status(400).send("userId non valido");
  userId=Number(userId);
  if(isNaN(userId)) return res.status(400).send("userId non valido");
  if(title.trim()=="") return res.status(400).send("title non valido");
  if(completed!=true&&completed!=false) return res.status(400).send("completed non valido");
  const querySnapshot=await getDocs(collection(db,"todos"));
  await setDoc(doc(db,"todos/"+(querySnapshot.docs.length+1)),{userId,title,completed});
  res.send({ok:true,id:querySnapshot.docs.length});
});

module.exports=app;