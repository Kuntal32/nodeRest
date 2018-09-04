const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId; 
const User = require('./models/User');
const Album = require('./models/album');
const config =require('./models/config');
const cors = require('cors');
const app = express();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const DIR = './uploads';
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
    }
});

let upload = multer({storage: storage});
// mongoose.connect('mongodb://localhost:27017/meanAuth',  {useNewUrlParser: true} , (err, response) => {
mongoose.connect('mongodb+srv://kuntal32:blender@cluster0-lscvx.mongodb.net/meanAuth?retryWrites=true',  {useNewUrlParser: true} , (err, response) => {
if(err){
        console.log('mongo err'+ err);
    }else{
      
    }
});

app.set('port', process.env.port ||  3000);
app.use(bodyparser.json());
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

function verifyToken(req, res, next){
    if(!req.headers.authorization){
        return res.status(401).json({success:"Unauthorized request"});
    }else{
        let token = req.headers.authorization.split(' ')[1];
        if(token == 'null'){
            return res.status(401).json({success:"Unauthorized request"});
        }

        let payload = jwt.verify(token,config.secret);
        if(!payload){
            return res.status(401).json({success:"Unauthorized request"});
        }
        req.userId = payload.subject;
        next();
    }

}

app.post('/register', (req, res) => {
    User.findOne({email: req.body.email}).exec().then(user => {
        if(user) {
            res.status(401).json({success:"Email Id already exists!"});
        }else{
            
            bcrypt.hash(req.body.password, 10 ,(err, hash) => {
                if(err){ 
                    res.status(401).json({success:"There was a problem during hashing!"}); 
                }else{
                    var user = new User();
                    user.firstname = req.body.firstname;
                    user.lastname = req.body.lastname;
                    user.email = req.body.email;
                    user.password = req.body.password;
                    user.hashPassword = hash;
                    user.save((err, result)=>{
                        if(err){ 
                            res.status(401).json({success:"There was a problem registering the user!"});
                        }else{ 
                            //jwt auth
                            var token = jwt.sign({username:user.firstname+' '+user.lastname, email:req.body.email, id: result._id }, config.secret, {
                                expiresIn: 86400 // expires in 24 hours
                            });
                            res.status(200).json({ auth: true, token: token , success:"Registration Successfully Completed!"}); 
                        }
                    });
                }
            });
        }
    });
    
});

app.post('/login', (req, res) => {
    User.findOne({email: req.body.email}).exec().then(user => {
       // console.log(user);
        if(user){
            bcrypt.compare(req.body.password, user.hashPassword, (err,result) => {
                    if(result){
                        var token = jwt.sign({ username:user.firstname+' '+user.lastname,email:user.email, id: user._id }, config.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        res.status(200).json({success:'User successfully logged in!', status:result,token:token});
                    }else{
                        res.status(401).json({success:"Wrong Password!"}); 
                    }
                    
               
            });
        }else{
            res.status(401).json({success:"user email not exists!"});
        }
    });
});

app.get('/dashboard', verifyToken ,(req, res) => {
    User.find({}).exec().then(user => {
        if(user) {
            res.status(200).json(user);
        }else{
            res.status(401).json({success:"User not Exists"});
        }
    });
});

app.get('/profile/:id', verifyToken, (req, res) => {
    let user_id=req.params.id;
    User.findOne(new ObjectId(user_id)).exec().then(user => {
        if(user) {
            res.status(200).json(user);
        }else{
            res.status(401).json({success:"User not Exists"});
        }
    });
});

app.post('/CreateAlbum', verifyToken ,(req, res) => {
    Album.findOne({'created_by':req.body.id,'title':req.body.title}).exec().then(data => {
        if(data){
            res.status(401).json({success:"Album title already have taken!"});
        }else{
            var album = new Album();
            album.title = req.body.title;
            album.description = req.body.description;
            album.created_by = req.body.id;
            album.created_date = new Date();
            album.save((err, result)=>{
                if(err){ 
                    res.status(401).json({success:"There was a problem!"});
                }else{ 
                    res.status(200).json({success:"Album Successfully Created!",status:result}); 
                }
            });
        }
    });
});

app.get('/GetAlbums/:id/:pageIndex/:pageSize', verifyToken ,(req, res) => {
   
    var perPage = Math.max(0, req.params.pageSize);
    var page = Math.max(0, req.params.pageIndex);
    
    Album.find({'created_by':req.params.id}).limit(perPage).skip(perPage * page).exec().then(data => {
        if(data){
           
           Album.countDocuments({'created_by':req.params.id},function(err, c){
            var response_data = { 'data': data, 'pageSize': perPage, 'page':page,'length': c};
            res.status(200).json(response_data);
           });
          
        }else{
            res.status(401).json({success:"Album not Exists"});
        }
    });
});

app.post('/upload',verifyToken,upload.single('photo'), function (req, res) {
   
    if (!req.file) {
        res.status(401).json({success:"Image Upload Failure!",status:false}); 
    } else {
        if(req.file.mimetype.split('/')[0]==='image'){
            res.status(200).json({success:"Image Uploaded Successfully!",status:true}); 
        }else{
            res.status(401).json({success:"File type not supported!",status:false}); 
        }
        
      }
});
 


app.listen(app.get('port'),function(){
    console.log('app is runnitng on - '+ app.get('port'));
});