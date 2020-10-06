const mongoose= require('mongoose');
mongoose.connect("mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false");
const groupschema = new mongoose.Schema({
  name: String, 
  desc: String, 
  count: String,
  createdby:String,
  
    img: 
    { 
        data: Buffer, 
        contentType: String 
    } 
  });
  
  const groups=mongoose.model('groups',groupschema);
  module.exports=groups;