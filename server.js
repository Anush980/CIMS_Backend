const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


const app = express();
const port = process.env.PORT||8000;

app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/authRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require("./routes/customerRoutes");
const salesRoutes = require("./routes/salesRoutes");

app.use('/api',authRoutes);
app.use('/api',inventoryRoutes);
app.use('/api',customerRoutes);
app.use('/api',salesRoutes);

mongoose.connect(
process.env.MONGODB_URI)
.then(()=>console.log("Connected to the database"))
.catch((err)=>console.error("Error connecting to the database",err));



app.listen(port,()=>{
console.log(`Server is running on port ${port}`);
});