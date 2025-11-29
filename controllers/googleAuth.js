const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {//verfiy token from google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;
        //check if user exists
        let user = await User.findOne({ email });
        //create new one if not
        if (!user) {
            user = new user({
                name,
                 email,
                  photo: picture, 
                  provider: "Google",
                   providerId:sub,
                    password: null
            });
            await user.save();
        }
        //create our own JWT
        const authToken=jwt.sign(
            {
                id:user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );
        res.status(200).json({message:"Google login successfully",user,token:authToken});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message:"Something went wrong! "})
    }
};
modules.export=googleLogin;
