const activityLogSchema= new mongoose.schema ({
    action:String,
    performedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    targetUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    shopName:String,
},{
    timestamps:true
})