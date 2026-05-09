import bcrypt from "bcrypt"
import User from "../Models/auth.models.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/Cloudinary.js";

export const signup = async (req, res) => {
    const { email, fullname, password } = req.body;

    try {
        if (!fullname || !email) {
            return res.status(400).json({ message: "every filed is required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Passowrd must be 6 character long" })
        }

        // checking the email existance
        const IfExist = await User.findOne({ email })
        if (IfExist) {
            return res.status(400).json({ message: "email Already exist" })
        }

        // hashing the password
        const hashedPassword = await bcrypt.hash(password, 10)
        // console.log(hashedPassword)

        // creating the user
        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,

        })


        if (newUser) {
            // genreating the token
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(201).json(newUser)
        }
        else {
            res.status(400).json({ message: "invalid user data" })
        }

    } catch (error) {
        console.log("error in sigun controller", error.message)
        res.status(500).json(error.message)
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(req);
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "every filed is required" })
        }

        // if (password.length < 6) {
        //     return res.status(400).json({ message: "Passowrd must be 6 character long" })
        // }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "invalid credential" })
        }

        const isCorrectUser = await bcrypt.compare(password, user.password)

        if (!isCorrectUser) {
            return res.status(400).json({ message: "invalid cradential" })

        }

        generateToken(user._id, res)
        res.status(200).json(user)

    } catch (error) {
        console.log("error in login controller", error.message)
        res.status(500).json({ message: "internal server error" })

    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "logout successfully" })

    } catch (error) {
        console.log("error in logout cotroller")
        res.status(500).json({ message: "internal server error" })
    }
}

export const profilepic = async (req, res) => {
    try {
        const { profilepic } = req.body;
        if (!profilepic) {
            return res.status(400).json({ message: "profilepc is required" })
        }

        const userId = req.user._id

        const upload = await cloudinary.uploader.upload(profilepic, {
            width: 500,   // Resize to a max width
            height: 500,  // Resize to a max height
            crop: "limit", // Prevent enlarging images
            quality: "auto:good",  // Automatically adjust quality
        });
        const updateduser = await User.findByIdAndUpdate(userId, { profilepic: upload.secure_url }, { new: true })
        res.status(200).json(updateduser)

    } catch (error) {
        console.log("errorn in profile route: ", error);
        res.status(500).json({ message: "internal server error" })

    }
}

export const chekcAuth = (req, res) => {
    try {
        res.status(200).json(req.user)

    } catch (error) {
        console.log("error in checkauth route: ", error.message);
        res.status(500).json({ message: "internal server error" })
    }
}