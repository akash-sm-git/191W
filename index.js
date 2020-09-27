const express=require("express");
const ejs=require("ejs");
const mongoose = require("mongoose");
const User=require('./models/User');
const bodyParser = require("body-parser");
const queryString=require('query-string')
const axios=require('axios')
const window=require('window')
mongoose.connect("mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false");

const port=4000;
const app=express();
app.use(express.static("public"));

const stringifiedParams = queryString.stringify({
  client_id: "82196192223-m9ceu30331dm4uetb1a1luhugmjpmop7.apps.googleusercontent.com",
  redirect_uri: 'http://127.0.0.1:4000/home',
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' '), // space seperated string
  response_type: 'code',
  access_type: 'offline',
  prompt: 'consent',
});
const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine","ejs");

app.get('/', (req, res) =>{
    res.render('login',{ name: googleLoginUrl});
    });
app.post('/', (req, res) =>{
        res.render('register');
        });   
app.get('/register', (req, res) =>{
        res.render('register');
        });    
app.get('/login', (req, res) =>{
            res.render('login',{ name: googleLoginUrl });
            }); 
  

app.get('/home', (req, res) =>{
  const urlParams = queryString.parse(req.query);
  console.log(urlParams)
  var  id= req.query.code;
  access_token=getAccessTokenFromCode(id)

 
  res.render('home')

    });
    
    async function getAccessTokenFromCode(code) {

        const { data } = await axios({
          url: `https://accounts.google.com/o/oauth2/token`,
          method: 'post',
          data: {
            client_id:"82196192223-m9ceu30331dm4uetb1a1luhugmjpmop7.apps.googleusercontent.com",
            client_secret: "u-5hXIZaDL0lWcR0_G9y9dSU",
            redirect_uri: 'http://127.0.0.1:4000/home',
            grant_type: 'authorization_code',
            code:code,
          },
        });
      
        var Authorizationas= 'Bearer '+ data.access_token;        
        var config = {
          method: 'get',
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
          headers: { 
            'Authorization': Authorizationas
          }
        };
        
        axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });
        




      };   

      async function getGoogleDriveFiles(access_token) {
        var Authorization= 'Bearer '+ access_token;
        console.log(Authorization);
        const { data } = await axios({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
          method: 'get',
          headers: {
            Authorization: 'Bearer '+ access_token,
          },

        });
       
        console.log(data); // { id, email, given_name, family_name }
        return data;
      };
      
        
app.post('/register', (req, res) =>{

    const name= req.body.name;
    const email=req.body.email;
    const pw=req.body.password;
    const newUser= new User({
        name:name,
        email:email,
        password:pw
    });
    newUser.save((err=>
        {
            err?console.log(err):res.send("succes");
            
        }));
});    


app.post('/login', (req, res) =>{

    const email=req.body.email;
    const pw=req.body.password;
    User.findOne({email:email},
        (err,foundResults)=>{
            if(err){
                console.log(err);
            }
            else
            {
                if( foundResults.password==pw){
                    res.render('home');
                }
            else{
                res.send("Incorrect email and pw ");
            }
        }
        })    


});    



app.listen(port,()=>{
console.log("server is running");
});  