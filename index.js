const express=require("express");
const fs = require('fs')
var path = require('path'); 


const ejs=require("ejs");
const mongoose = require("mongoose");
const User=require('./models/User');
const Groups=require('./models/groups');

const session = require('express-session') 


const bodyParser = require("body-parser");
const queryString=require('query-string')
const axios=require('axios')
const window=require('window');
const { count } = require("./models/User");
mongoose.connect("mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false");
var multer = require('multer'); 
  
var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
  
var upload = multer({ storage: storage }); 
const port=4000;
const app=express();
app.use(express.static("public"));

app.use(session({ 
  
  // It holds the secret key for session 
  secret: '170399', 

  // Forces the session to be saved 
  // back to the session store 
  resave: true, 

  // Forces a session that is "uninitialized" 
  // to be saved to the store 
  saveUninitialized: true
})) 

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
  var  id= req.query.code;
  name=getAccessTokenFromCode(id,res,req);


    });
app.post('/home', (req, res) =>{
  var img= req.body.id;
      console.log(img);
      res.send(img);
      });   
    
    async function getAccessTokenFromCode(code,res,req) {

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
          withCredentials: true,
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
          headers: { 
            'Authorization': Authorizationas
          }
        };
        axios(config,)
        .then(function (response) {
        Groups.find({}, (err, items) => { 
          if (err) { 
              console.log(err); 
          } 
          else { 
            req.session.name=response.data.name;
            req.session.email=response.data.email;

              res.render('home', { items: items,name: req.session.name }); 
          } 
      }); 
      console.log(JSON.stringify(response.data.email));

          
        
        })
        .catch(function (error) {
          console.log(error);
        });

      };  
      
        
app.post('/register', (req, res) =>{

    const name= req.body.name;
    const email=req.body.email;
    const pw=req.body.password;
   
    User.findOne({email:email},
      (err,foundResults)=>{
          if(err){
            
              console.log(err);
          }
          else{
            res.send("email alrdy used ");

          }
        
        });
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
    req.session.email=email;
    User.findOne({email:email},
        (err,foundResults)=>{
            if(err){
                console.log(err);
            }
            else
            {
                if( foundResults.password==pw){

          
                Groups.find({}, (err, items) => { 
                  if (err) { 
                      console.log(err); 
                  } 
                  else { 
                    req.session.name=foundResults.name;

                      res.render('home', { items: items,name:foundResults.name }); 
                  } 
              });                      

                }
            else{
                res.send("Incorrect email and pw ");
            }
        }
        })    


});  
  
app.get('/create_group', (req, res) =>{
  Groups.find({}, (err, items) => { 
    if (err) { 
        console.log(err); 
    } 
    else { 
        res.render('create_group', { items: items,name:req.session.name }); 
    } 
}); 

  });

app.post('/create_group', upload.single('image'), (req, res, next) => { 
    console.log(req.session.email);
    var obj = { 
        name: req.body.name, 
        desc:req.body.dis,
        createdby:req.session.email,
        count:0,
        img: { 
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
            contentType: 'image/png'
        } 
    } 
    Groups.create(obj, (err, item) => { 
        if (err) { 
            console.log(err); 
        } 

        else { 
            // item.save(); 
            Groups.find({}, (err, items) => { 
              if (err) { 
                  console.log(err); 
              } 
              else { 
                  res.render('home', { items: items,name:req.session.name }); 
              } 
          }); 

        } 
    }); 
}); 




app.get('/view_p_create', (req, res) =>{
  Groups.find({}, (err, items) => { 
    if (err) { 
        console.log(err); 
    } 
    else { 

      res.render('view_p_create',{items:items,email:req.session.email});
    } 
}); 
  });



app.listen(port,()=>{
console.log("server is running");
});  