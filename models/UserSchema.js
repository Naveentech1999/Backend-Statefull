

const mongoose = require("mongoose");


 const Userschema = new mongoose.Schema({

     FirstName :{
        type : String,
        required : true
    },
     LastName :{
        type : String,
        required : true
    },
    Email :{
            type:String,
            required: true,
            unique: true
        },
    Password:{
        type:String,
        required:true

    }
})

module.exports = mongoose.model("user",Userschema)