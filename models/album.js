const mongoose = require('mongoose');



var albumSchema = mongoose.Schema({
    title : {type:String, required:true},
    description : {type:String, required:true},
    created_by : {type:String, required:true},
    created_date : Date,
});

module.exports = mongoose.model('Album', albumSchema);