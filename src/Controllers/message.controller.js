import cloudinary from "../lib/Cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import User from "../Models/auth.models.js";
import Message from "../Models/message.model.js";


export const getUserSideBar = async (req, res) => {
    try {
        const logedInUser = req.user._id;
        const filteredUser = await User.find({ _id: { $ne: logedInUser } }).select("-password");
        console.log("fileter", filteredUser);
        res.status(201).json(filteredUser)


    } catch (error) {
        console.log("error in get user route: ", error.message)
        res.status(500).json({ message: "internal server error" })

    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id;

        const message = await Message.find({
            $or: [
                { senderId: userToChatId, receiverId: myId },
                { senderId: myId, receiverId: userToChatId },
            ]
        })

        res.status(200).json(message)

    } catch (error) {
        console.log("error in getmessage route: ", error.message);
        return res.status(500).json({ message: "internal server error" })

    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        let imageUrl = null;

        if (image) {
            const upload = await cloudinary.uploader.upload(image)
            imageUrl = upload.secure_url

        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl

        })
        await newMessage.save();

        // todo: add socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage)

    } catch (error) {
        console.log("error in send message controller", error)
        res.status(500).json({ message: "internal server error" })

    }

}

export const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (message.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not allowed to delete this message" });
        }

        await Message.findByIdAndDelete(req.params.id);

        // Emit event to receiver user (other side)
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", message._id);
        }

        // Also notify the sender side if needed
        const senderSocketId = getReceiverSocketId(message.senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messageDeleted", message._id);
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
