const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerName:{
        type:String,
        require:true,
        trim:true
    },
    customerPhone:{
        type:Number,
        require:true,
        trim:true
    },
    customerEmail:{
        type:String,
        trim:true
    },
    customerAddress:{
        type:String,
        require:true,
        trim:true
    },
    creditBalance:{
        type:Number,
        default:0,
        trim:true
    }
    

});

customerSchema.index({
    customerName:"text",
    customerEmail:"text",
    customerAddress:"text",
})

module.exports = mongoose.model("Customer",customerSchema);