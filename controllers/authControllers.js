const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
  const { shopName, email, password,  } = req.body;

  try {
    // Check if the email already exists for this shop
    const existingUser = await User.findOne({ email, shopName });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists for this shop" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new User({
      shopName,
      email,
      password: hashedPassword,
      role: "admin",
      jobTitle:"Owner"
    });

    await newUser.save();

    res.status(201).json({
      message: "Shop admin registered successfully",
      user: {
        id: newUser._id,
        shopName: newUser.shopName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const loginUser = async (req, res) => {
  const { shopName,email, password,  } = req.body;

  try {
   
    const user = await User.findOne({ email});
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Sign JWT with shop info
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        shopName: user.shopName
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login Successful",
      user: {
        id: user._id,
        shopName: user.shopName,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { registerUser, loginUser };
