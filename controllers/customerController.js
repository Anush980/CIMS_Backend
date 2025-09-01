const Customer = require('../models/Customer');

//add Customer 

const addCustomer = async (req,res)=>{
    try{
  const customer = await Customer.create(req.body);
    res.status(200).json(customer);
    }
  catch(err){
    res.status(400).json({error:err.message});
  }
}

//getCustomers 
const getCustomers = async (req,res)=>{
try{
    const customer = await Customer.find();
    res.status(200).json(customer);
}
catch(err){
    res.status(400).json({error:err.message})
}
}

//getCustomerById
const getCustomerById = async (req,res)=>{
    try{
        const id = req.params.id;
        const customer = await Customer.findById(id);
        if(!customer) return res.status(400).json({error:"Not Found"});
        res.status(200).json(customer);

    }
     catch(err){
    res.status(400).json({error:err.message});
  }
}

//updateCustomer
const updateCustomer = async (req,res) => {
    try{
        const id = req.params.id;
        const customer = await Customer.findByIdAndUpdate(id,req.body,{new:true});
        if(!customer) return res.status(400).json({error:"Not Found"});
        res.status(200).json(customer);
    }
    catch(err){
        res.status(400).json({error:err.message});
    }
}
//deleteCustomer
const deleteCustomer =async (req,res) => {
    try{
        const id = req.params.id;
        const customer = await Customer.findByIdAndDelete(id);
        if(!customer) return res.status(400).json({error:"Not Found"});
        res.status(200).json(customer);
    }
      catch(err){
        res.status(400).json({error:err.message});
    }
}

module.exports={addCustomer,getCustomers,getCustomerById,updateCustomer,deleteCustomer};