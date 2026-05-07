import jwt from "jsonwebtoken";
import {userModel} from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            // Attach user (exclude password)
            req.user = await userModel.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            next();
        } catch (error) {
            console.log("Token error:", error.message); // ← add this
            return res.status(401).json({ message: error.message }); 
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
};

export default authMiddleware;
