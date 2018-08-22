const mongoose = require('mongoose');



var userSchema = mongoose.Schema({
    firstname : {type:String, required:true},
    lastname : {type:String, required:true},
    email : {type:String, required:true, unique: true, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},
    password : {type:String, required:true},
    hashPassword : {type:String, require:true}
},
{
    collection: "users"
});

module.exports = mongoose.model('User', userSchema);