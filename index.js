const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const config =require('./models/config');
const cors = require('cors');
const app = express();

mongoose.connect('mongodb://localhost:27017/meanAuth',  {useNewUrlParser: true} , (err, response) => {
    if(err){
        console.log('mongo err'+ err);
    }else{
      
    }
});

app.set('port', process.env.port ||  3000);
app.use(bodyparser.json());
app.use(cors());

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
                            var token = jwt.sign({ email:req.body.email, id: result._id }, config.secret, {
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
                        var token = jwt.sign({ email:user.email, id: user._id }, config.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        res.status(200).json({success:'User successfully logged in!', data:user, status:result,token:token});
                    }else{
                        res.status(401).json({success:"Wrong Password!"}); 
                    }
                    
               
            });
        }else{
            res.status(401).json({success:"user email not exists!"});
        }
    });
});


app.listen(app.get('port'),function(){
    console.log('app is runnitng on - '+ app.get('port'));
});