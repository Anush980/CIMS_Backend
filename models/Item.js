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
    },
    restock:{
    type:Number,
    default:5
    },

    image:{
type:String,
default:"/default.jpg"
    }
});

itemSchema.index({
    itemName:"text",
    category:"text",
    sku:"text"
}
)
module.exports=mongoose.model("Item",itemSchema);