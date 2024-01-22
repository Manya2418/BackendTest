const express=require('express')
const path=require('path')
const app=express()
const port=5000
const cookieParser=require('cookie-parser')
const mongoose=require('mongoose')
const jwt=require("jsonwebtoken")

const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"Backend"
}).then(()=>{
    console.log("database connected")
}).catch((e)=>{
    console.log("Not connected"+e)
})

const Users=mongoose.model("Users",userSchema);
app.use(express.static(path.join(path.resolve(),"Public")))
app.use(express.urlencoded())
app.set("view engine","ejs")
app.use(cookieParser())

app.get("/register",(req,res)=>{
    res.render("Register")
})
app.post('/register',async (req,res)=>{
    const {name,email,password}=req.body;
    const user=await Users.findOne({email})
    if(user){
        return res.render("Login",{me:"user is already exit"})
    }
    await Users.create({name,email,password})
    res.redirect('/login')
})

app.get("/login",(req,res)=>{
    res.render("Login")
})
app.get("/logout",(req,res)=>{
    res.render("Logout")
})
const isAuthentication=async (req,res,next)=>{
    const {token}=req.body;
    if(token){
        const decode=jwt.verify(token,"asdfghij")
        req.users=await Users.findById(decode._id)
        next()
    }else{
        res.redirect("/register")
    }

}
app.post("/login",async (req,res)=>{
    const {email,password}=req.body;
    const users=await Users.findOne({email})
    if(!users){
        return res.redirect("/register")
    }
    const isMatch=password===users.password;
    if(!isMatch){
        return res.render("Login",{email,message:"password is incorrected"})
    }
    const token=jwt.sign({_id:users._id},"asdfghij")
    console.log(users)
    
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    })
    res.redirect('/logout')

})

app.post("/logout",isAuthentication,(req,res)=>{
    
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.redirect('/login')
})

app.listen(port,()=>{
    console.log("server is working on "+port)
})