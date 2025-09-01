const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerName:{
        type:String,
        require:true
    },
    customerPhone:{
        type:Number,
        require:true
    },
    customerEmail:{
        type:String,
    },
    customerAddress:{
        type:String,
        require:true
    },
    creditBalance:{
        type:Number,
        default:0
    }

});

module.exports = mongoose.model("Customer",customerSchema);