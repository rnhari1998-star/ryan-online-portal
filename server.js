const express=require("express"),path=require("path"),Database=require("better-sqlite3"),bcrypt=require("bcryptjs"),jwt=require("jsonwebtoken");
const app=express(),db=new Database("ryan.db"),SECRET=process.env.JWT_SECRET||"CHANGE_ME";
db.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT,username TEXT UNIQUE,password TEXT,role TEXT);
CREATE TABLE IF NOT EXISTS tests(id INTEGER PRIMARY KEY,title TEXT,subject TEXT,duration INTEGER,one_attempt INTEGER,published INTEGER);
CREATE TABLE IF NOT EXISTS questions(id INTEGER PRIMARY KEY,test_id INTEGER,question TEXT,a TEXT,b TEXT,c TEXT,d TEXT,correct TEXT,marks INTEGER);
CREATE TABLE IF NOT EXISTS results(id INTEGER PRIMARY KEY,user_id INTEGER,test_id INTEGER,score INTEGER,total INTEGER,submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(user_id,test_id));
CREATE TABLE IF NOT EXISTS fees(id INTEGER PRIMARY KEY,student_id INTEGER,installment TEXT,amount REAL,status TEXT);`);
if(!db.prepare("SELECT 1 FROM users LIMIT 1").get()){
 const u=db.prepare("INSERT INTO users(name,username,password,role) VALUES(?,?,?,?)");
 u.run("Administrator","admin",bcrypt.hashSync("admin123",10),"admin");
 u.run("Teacher","teacher",bcrypt.hashSync("teacher123",10),"teacher");
 u.run("Student","student",bcrypt.hashSync("student123",10),"student");
 const t=db.prepare("INSERT INTO tests(title,subject,duration,one_attempt,published) VALUES(?,?,?,?,?)").run("Mathematics Demo Test","Mathematics",10,1,1);
 const q=db.prepare("INSERT INTO questions(test_id,question,a,b,c,d,correct,marks) VALUES(?,?,?,?,?,?,?,?)");
 q.run(t.lastInsertRowid,"What is 12 × 8?","86","96","108","112","B",1);
 q.run(t.lastInsertRowid,"If 5x = 45, x = ?","7","8","9","10","C",1);
 const s=db.prepare("SELECT id FROM users WHERE username='student'").get().id;
 db.prepare("INSERT INTO fees(student_id,installment,amount,status) VALUES(?,?,?,?)").run(s,"1st Installment",2000,"Paid");
 db.prepare("INSERT INTO fees(student_id,installment,amount,status) VALUES(?,?,?,?)").run(s,"2nd Installment",2000,"Pending");
}
app.use(express.json());app.use(express.static(path.join(__dirname,"public")));
const auth=(req,res,next)=>{try{req.user=jwt.verify((req.headers.authorization||"").replace("Bearer ",""),SECRET);next()}catch(e){res.status(401).json({error:"Login required"})}};
const roles=(...r)=>(req,res,next)=>r.includes(req.user.role)?next():res.status(403).json({error:"Access denied"});
app.post("/api/login",(req,res)=>{let u=db.prepare("SELECT * FROM users WHERE username=?").get(req.body.username);if(!u||!bcrypt.compareSync(req.body.password,u.password))return res.status(401).json({error:"Invalid login"});res.json({token:jwt.sign({id:u.id,name:u.name,role:u.role},SECRET,{expiresIn:"8h"}),user:{id:u.id,name:u.name,role:u.role}})});
app.get("/api/tests",auth,(req,res)=>res.json(db.prepare("SELECT id,title,subject,duration,one_attempt FROM tests WHERE published=1 ORDER BY id DESC").all()));
app.get("/api/tests/:id",auth,(req,res)=>{let t=db.prepare("SELECT id,title,subject,duration,one_attempt FROM tests WHERE id=?").get(req.params.id);if(!t)return res.status(404).json({error:"Not found"});let qs=db.prepare("SELECT id,question,a,b,c,d,marks FROM questions WHERE test_id=?").all(t.id);let attempted=!!db.prepare("SELECT id FROM results WHERE user_id=? AND test_id=?").get(req.user.id,t.id);res.json({...t,questions:qs,attempted})});
app.post("/api/tests/:id/submit",auth,roles("student"),(req,res)=>{let t=db.prepare("SELECT * FROM tests WHERE id=?").get(req.params.id);if(t.one_attempt&&db.prepare("SELECT id FROM results WHERE user_id=? AND test_id=?").get(req.user.id,t.id))return res.status(409).json({error:"One attempt only"});let qs=db.prepare("SELECT * FROM questions WHERE test_id=?").all(t.id),score=0,total=0;for(let q of qs){total+=q.marks;if(req.body.answers[q.id]===q.correct)score+=q.marks}db.prepare("INSERT INTO results(user_id,test_id,score,total) VALUES(?,?,?,?)").run(req.user.id,t.id,score,total);res.json({score,total,percentage:Math.round(score*100/total)})});
app.get("/api/results",auth,(req,res)=>{let x=req.user.role==="student"?db.prepare("SELECT t.title,r.score,r.total,r.submitted_at FROM results r JOIN tests t ON t.id=r.test_id WHERE r.user_id=?").all(req.user.id):db.prepare("SELECT u.name,t.title,r.score,r.total,r.submitted_at FROM results r JOIN users u ON u.id=r.user_id JOIN tests t ON t.id=r.test_id ORDER BY r.id DESC").all();res.json(x)});
app.get("/api/fees",auth,(req,res)=>res.json(req.user.role==="student"?db.prepare("SELECT installment,amount,status FROM fees WHERE student_id=?").all(req.user.id):db.prepare("SELECT u.name,f.installment,f.amount,f.status FROM fees f JOIN users u ON u.id=f.student_id").all()));
app.get("/api/students",auth,roles("teacher","admin"),(req,res)=>res.json(db.prepare("SELECT id,name,username FROM users WHERE role='student'").all()));
app.post("/api/tests",auth,roles("teacher","admin"),(req,res)=>{let x=req.body,t=db.prepare("INSERT INTO tests(title,subject,duration,one_attempt,published) VALUES(?,?,?,?,1)").run(x.title,x.subject,x.duration||30,x.one_attempt?1:0);let q=db.prepare("INSERT INTO questions(test_id,question,a,b,c,d,correct,marks) VALUES(?,?,?,?,?,?,?,?)");for(let z of x.questions||[])q.run(t.lastInsertRowid,z.question,z.a,z.b,z.c,z.d,z.correct,z.marks||1);res.json({id:t.lastInsertRowid})});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public/index.html")));app.listen(process.env.PORT||3000);
app.post('/submit', (req, res) => {
  const name = req.body.name;
  if(!name || name.length < 3){
    return res.status(400).send("Invalid input");
   app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // साधं उदाहरण: नंतर database जोडता येईल
  if(username === "student" && password === "12345"){
    res.send("Login Successful! Welcome to Portal");
  } else {
    res.status(401).send("Invalid Credentials");
  }
});

  }
  res.send("Success");
});

