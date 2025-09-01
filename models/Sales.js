const mongoose = require('mongoose');

const salesSchema= mongoose.Schema({
    customer:{
type:mongoose.Schema.Types.ObjectId,ref:"Customer",require:false
    },
    item:[{
        type:mongoose.Schema.Types.ObjectId,ref:"Item",require:true,
        price:Number,
        quantity:Number
    }
],
totalAmount:Number,
paidAmount:Number,
dueAmount:Number,
paymentType:{type:String,enum:['cash','credit','half'],default:'cash'},
createdAt:{type:Date,default:Date.now}
});

module.exports= mongoose.model("Sales",salesSchema);