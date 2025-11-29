const Sales = require('../models/Sales');
const Item = require('../models/Item');
const Customer = require('../models/Customer');

const addSales = async (req, res) => {
  try {
    const { customerId, walkInCustomer, items, discount = 0, paymentType = 'cash' } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: "Items are required for a sale" });
    }

    // Validate customer if provided
    let customer = null;
    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, userId: req.user.id });
      if (!customer) return res.status(400).json({ error: "Customer not found" });
    }

    let total = 0;

    // Validate items and calculate total
    for (let i = 0; i < items.length; i++) {
      const { product: itemId, quantity } = items[i];
      const item = await Item.findOne({ _id: itemId, userId: req.user.id });
      if (!item) return res.status(400).json({ error: `Item not found: ${itemId}` });
      if (item.stock < quantity) return res.status(400).json({ error: `Not enough stock for ${item.itemName}` });

      items[i].price = item.price; // set sale price
      total += item.price * quantity;
    }

    total = total - discount;

    // Create sale
    const sale = await Sales.create({
      userId: req.user.id,
      customerId: customer ? customer._id : null,
      walkInCustomer: customer ? null : walkInCustomer || "Walk-in",
      items,
      discount,
      total,
      paymentType,
    });

    // Deduct stock
    for (let i = 0; i < items.length; i++) {
      await Item.findByIdAndUpdate(items[i].product, { $inc: { stock: -items[i].quantity } });
    }

    // Update customer credit if needed
    if (paymentType === "credit" && customer) {
      customer.creditBalance += total;
      await customer.save();
    }

    res.status(200).json(sale);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


//getAllSales
const getSales = async (req,res)=>{
    try{
        const sales = await Sales.find({ userId: req.user.id });
       res.status(200).json(sales);
    }
      catch(err){
    res.status(400).json({Error:err.message});
  }
}

//search Item
const searchSales =async(req,res)=>{
  try{
    const {q}=req.query;
    if(!q){
      return res.json([]);
    }
   const results = await Sales.find({ 
  userId: req.user.id,
  $or: [
    { customer: { $regex: q, $options: "i" } }
  ]
});
    res.status(200).json(results);
  }
  catch(err){
    console.error("Error:",err);
    res.status(500).json({Error:"server Error"});
  }
}

//getSalesbyID
const getSalesbyID = async (req,res)=>{
    try{
        const id = req.params.id
        const sale = await Sales.findOne({ _id: id, userId: req.user.id });
        if(!sales) return res.status(404).json({error:"NOT_FOUND"});
        res.status(200).json(sales);
    }
      catch(err){
    res.status(400).json({Error:err.message});
  }
}

//updateSales
const updateSales = async (req,res)=>{
    try{
       const id = req.params.id;
      const sale = await Sales.findOneAndUpdate(
  { _id: id, userId: req.user.id },
  req.body,
  { new: true }
);

       if(!sales) return res.status(404).json({Error:"NOT_FOUND"});
       res.status(200).json(sales);
    }
      catch(err){
    res.status(400).json({Error:err.message});
  }
}

//deleteSales
const deleteSales = async (req,res) => {
    try{
        const id = req.params.id;
        const sale = await Sales.findOneAndDelete({ _id: id, userId: req.user.id });
        if(!sales) return res.status(404).json({Error:"NOT_FOUND"});
        res.status(200).json(sales);
    }
        catch(err){
    res.status(400).json({Error:err.message});
  }
}

module.exports = {addSales,getSales,searchSales,getSalesbyID,updateSales,deleteSales}