
const express = require("express");
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const bodyParser = require("body-parser");
const Ejs = require("ejs")
const session = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(session);
const user = require("./models/UserSchema")
const bcrypt = require("bcryptjs")




const app = express();

const PORT = process.env.PORT || 8080

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}))

dotEnv.config();

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("DB Connected Successfully...")
})
.catch((error)=>{
    console.log(error)
})

const store = new MongoDBStore({
    uri : process.env.MONGO_URI,
    collection : "mySession"
})
app.use(session({
    secret : "This is a Secret",
    resave : false,
    saveUninitialized : false,
    store: store
}))

const checkAuth = (req,res,next)=>{
    if(req.session.isAuthenticated === true){
        next();
    }else{
        res.redirect("/signup")
    }
}

// client-side Rendering
// app.get("/home",(req,res)=>{
//     res.json({Message:"Your are in Home Page"})
// })

//Server-side Rendering
// app.get("/home",(req,res)=>{
//     res.send("<h1>you are in homepage</h1>")
// });

//template-engine ejs for serverside rendering
app.get("/login",(req,res)=>{
    res.render("loginpage")
})

app.get("/signup",(req,res)=>{
    res.render("register")
})

app.get("/Dashboard", checkAuth , (req,res) => {
    res.render("welcome")
})

app.post("/register",async(req,res)=>{
    const{FirstName , LastName, Email ,Password} = req.body;
    let newUser = await user.findOne({Email});
    if(newUser){
        return res.redirect("/signup")
    }

    const hashedPassword = await bcrypt.hash(Password,12)
    newUser = new user({
        FirstName,
        LastName,
        Email,
        Password : hashedPassword,
    })

    req.session.person = newUser.FirstName
    await newUser.save();
    res.redirect("/login")
})

app.post("/login",async(req,res)=>{
    const{Email,Password} = req.body

    let newUser = await user.findOne({Email});
    if(!newUser){
        return res.redirect("/signup")
    }
    const checkPassword = await bcrypt.compare(Password ,newUser.Password)
    if(!checkPassword){
        return res.redirect("/signup")
    }
    req.session.isAuthenticated = true
    res.redirect("/Dashboard")
})
app.post("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect("/")
    })
})

app.get("/",(req,res)=>{
    res.render("home")
})

app.listen(PORT,()=>{
    console.log(`Server Running on ${PORT} Port...`)
})