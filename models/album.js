const mongoose = require('mongoose');



var albumSchema = mongoose.Schema({
    title : {type:String, required:true},
    description : {type:String, required:true},
    created_by : {type:String, required:true},
    created_date : Date,
    images:[{
        imagename: {type:String, require:true},
        contentType: {type:String, require:true},
        imagePath: {type:String, require:true},
        uploaded_date: Date
    }]
});

module.exports = mongoose.model('Album', albumSchema);