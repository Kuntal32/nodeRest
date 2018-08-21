const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const config =require('./models/config');
const cors = require('cors');
const app = express();

const db = mongoose.connect('mongodb://localhost:27017/meanAuth', (err, response) => {
    if(err){
        console.log('mongo err'+ err);
    }else{
      
    }
});

app.set('port', process.env.port ||  3000);
app.use(bodyparser.json());
app.use(cors());
// Add headers


app.post('/register', (req, res) => {
    let hashPassword = bcrypt.hashSync(req.body.password,8);
    var user = new User();
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.email = req.body.email;
    user.password = req.body.password;
    user.hashPassword = hashPassword;
    user.save((err, result)=>{
        if(err){ 
            res.send({success:"There was a problem registering the user!", status: 500});
         }else{ 
            //jwt auth
            var token = jwt.sign({ id: result._id }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.send({ auth: true, token: token , success:"Registration Successfully Completed!", status:200}); 
        }
    }); 
});



app.listen(app.get('port'),function(){
    console.log('app is runnitng on - '+ app.get('port'));
});