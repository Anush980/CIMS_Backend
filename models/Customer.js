const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
     
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,   
    },
    customerName:{
        type:String,
        required:true,
        trim:true
    },
    customerPhone:{
        type:Number,
        required:true,
        trim:true
    },
    customerEmail:{
        type:String,
        trim:true
    },
    customerAddress:{
        type:String,
        required:true,
        trim:true
    },
    creditBalance:{
        type:Number,
        default:0,
        trim:true
    }

},
 {
    timestamps: true,
  }
);

customerSchema.index({
    customerName:"text",
    customerEmail:"text",
    customerAddress:"text",
})

module.exports = mongoose.model("Customer",customerSchema);