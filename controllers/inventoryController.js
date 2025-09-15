const Item = require("../models/Item");

//Add item
const addItem = async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

//get All Items
const  getItems = async (req, res) => {
  try {
    const item = await Item.find().sort({_id:-1});
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

//search Item
const searchItem =async(req,res)=>{
  try{
    const {q}=req.query;
    if(!q){
      return res.json([]);
    }
    const results = await Item.find({
      $or:[
        {
          itemName:{$regex:q,$options:"i"}
        },
        {
          category:{$regex:q,$options:"i"}
        },
        {
          sku:{$regex:q,$options:"i"}
        }
      ]
    });
    res.status(200).json(results);
  }
  catch(err){
    console.error("Error:",err);
    res.status(500).json({error:"server Error"});
  }
}
//filter by category 
 const filterItemByCategory= async (req,res)=>{
  try{
const {category}=req.query;
if(!category){
  return res.json({message:"NO category specified!"})
}
const results = await Item.find({
   category: { $regex: `^${category}$`, $options: "i" }
});


if(results.length===0){
  return res.status(404).json({
    message:"No item found"
  })
}
res.status(200).json(results);
  }
  catch(err){
    console.error("Error:",err);
    res.status(500).json({message:"Server error "})
  }
 }
//get Specific Item
const getItemByID = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not Found" });
    }
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

//Update Item
const updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findByIdAndUpdate(id, req.body, { new: true });
    if (!item) return res.status(400).json({ error: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

//delete Item
const deleteItem = async (req,res)=>{
    try{
        const id = req.params.id;
        const item= await Item.findByIdAndDelete(id);
          if (!item) return res.status(400).json({ error: "Item not found" });
          res.status(200).json(item);
    }
    catch(err){
        res.status(400).json({error:err.message});
    }
}

module.exports = {addItem,getItems,searchItem,filterItemByCategory,getItemByID,updateItem,deleteItem};