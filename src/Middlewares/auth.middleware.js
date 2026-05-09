import jwt from "jsonwebtoken"
import User from "../Models/auth.models.js"

export const protetRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(400).json({ message: "Unauthorized - token not found" })
        }
        console.log(token);
        const VerifiedToken = jwt.verify(token, process.env.JWT_SECRET);
          
        if (!VerifiedToken) {
            return res.status(400).json({ message: "Unauthorized - token not found" })
        }

        const user = await User.findById(VerifiedToken.userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "Unauthorized - user not found" })
        }

        req.user = user
        next()

    } catch (error) {
        console.log("error in protect route in middlwware");
        res.status(500).json({ message: "internal server error" })

    }
}