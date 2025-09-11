const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
         const hashedPassword = await bcrypt.hash(password, 10);
         
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server error" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({
            id: existingUser._id,
            email: existingUser.email
        },
            process.env.JWT_SECRET,
            { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login Successful',
            user: {
                id: existingUser._id,
                email: existingUser.email
            }, token
        });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Couldn't connect to the network" })
    }
}
module.exports = { registerUser ,loginUser};