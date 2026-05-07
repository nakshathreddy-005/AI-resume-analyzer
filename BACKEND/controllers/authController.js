import { userModel } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

//user register
const registerUser=async(req,res,next)=>{
    try{
        const {username,email,password}=req.body;
        const userExists=await userModel.findOne({email});
        if(userExists)
        {
            return res.status(400).json({message:"User already exists"});
        }
        // It should be this — password hashed before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({ username, email, password: hashedPassword });
        res.status(201).json({message:"Register Done",payload:user,token:generateToken(user._id)});
    }
    catch(error) {
  res.status(500).json({ message: error.message })
}
}

//user login

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //directly compare instead of user.matchPassword()
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
 
    res.json({message:"Login Successfully",payload:user,token:generateToken(user._id)});
  } catch (error) {
    next(error);
  }
}

//get resume
const getMe = async (req, res, next) => {
  try {
    res.json(req.user); // already has user without password from authMiddleware
  } catch (error) {
    next(error);
  }
};
 
export { registerUser, loginUser, getMe };