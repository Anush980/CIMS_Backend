const Item = require("../models/Item");
const cloudinary = require("../config/cloudinary");
const { memoryStorage } = require("multer");

const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1758189840/inventory/rgwniiqhjknsuuapvjpx.jpg`;

//Add item
const addItem = async (req, res) => {
  try {
    const streamifier = require("streamifier");
    let imageUrl = DEFAULT_IMAGE_URL; // default fallback

    if (req.file) {
      // Upload image to Cloudinary
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "inventory" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    // Always create the item, with uploaded image or default
    const item = await Item.create({
      ...req.body,
      image: imageUrl,
    });

    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

const getItems = async (req,res)=>{
  try{
    const {search,sort,category}= req.query;
    let query ={};

    //search filter
    if(search){
      const orConditions=[
        {itemName:{$regex:search,$options:"i"}},
        {sku:{$regex:search,$options:"i"}},
      ];
      query.$or = orConditions;
    }
      let inventoryQuery=Item.find(query);
      //sorting
      if(sort == "recent"){
        inventoryQuery = inventoryQuery.sort({_id:-1})
      }
      else if(sort == "olderst"){
         inventoryQuery = inventoryQuery.sort({_id:1})
      }
      else{
         inventoryQuery = inventoryQuery.sort({_id:-1})
      }
      const items= await inventoryQuery;
      res.status(200).json(items);
    }
  catch(err){
    console.error("Error:",err);
  }
}

// //search Item
// const searchItem =async(req,res)=>{
//   try{
//     const {q}=req.query;
//     if(!q){
//       return res.json([]);
//     }
//     const results = await Item.find({
//       $or:[
//         {
//           itemName:{$regex:q,$options:"i"}
//         },
//         {
//           category:{$regex:q,$options:"i"}
//         },
//         {
//           sku:{$regex:q,$options:"i"}
//         }
//       ]
//     });
//     res.status(200).json(results);
//   }
//   catch(err){
//     console.error("Error:",err);
//     res.status(500).json({error:"server Error"});
//   }
// }
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

//update Item
const updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body }; // copy all fields from request body

    if (req.file) {
      const streamifier = require("streamifier");

      // Upload new image to Cloudinary
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "inventory" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      updateData.image = imageUrl; // update image field
    }

    // Update the item with new data
    const item = await Item.findByIdAndUpdate(id, updateData, { new: true });

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

module.exports = {addItem,getItems,filterItemByCategory,getItemByID,updateItem,deleteItem};