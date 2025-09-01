const Sales = require('../models/Sales');

//Add Sales

const addSales = async (req ,res)=>{
   try{
     const sales = await Sales.create(req.body);
    res.status(200).json(sales);
   }
     catch(err){
    res.status(400).json({error:err.message});
  }
}

//getAllSales
const getSales = async (req,res)=>{
    try{
        const sales = await Sales.find();
       res.status(200).json(sales);
    }
      catch(err){
    res.status(400).json({error:err.message});
  }
}

//getSalesbyID
const getSalesbyID = async (req,res)=>{
    try{
        const id = req.params.id
        const sales = await Sales.findById(id);
        if(!sales) return res.status(404).json({error:"NOT_FOUND"});
        res.status(200).json(sales);
    }
      catch(err){
    res.status(400).json({error:err.message});
  }
}

//updateSales
const updateSales = async (req,res)=>{
    try{
       const id = req.params.id;
       const sales = await Sales.findByIDAndUpdate(id,req.body,{new:true});
       if(!sales) return res.status(404).json({error:"NOT_FOUND"});
       res.status(200).json(sales);
    }
      catch(err){
    res.status(400).json({error:err.message});
  }
}

//deleteSales
const deleteSales = async (req,res) => {
    try{
        const id = req.params.id;
        const sales = await Sales.findByIDAndDelete(id);
        if(!sales) return res.status(404).json({error:"NOT_FOUND"});
        res.status(200).json(sales);
    }
        catch(err){
    res.status(400).json({error:err.message});
  }
}

module.exports = {addSales,getSales,getSalesbyID,updateSales,deleteSales}