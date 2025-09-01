const mongoose = require('mongoose');

const itemSchema =new mongoose.Schema({
    itemName:{
        type:String,
        require:true
    },
    category:{
        type:String
    },
    price:{
        type:Number,
        require:true,
    },
    sku:{
        type:String
    },
    stock:{
    type:Number,
    default:1
    }
});
module.exports=mongoose.model("Item",itemSchema);