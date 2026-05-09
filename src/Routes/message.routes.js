import express from "express"
import { protetRoute } from "../Middlewares/auth.middleware.js";
import { deleteMessage, getMessages, getUserSideBar, sendMessage } from "../Controllers/message.controller.js";

const router = express.Router();

router.get("/users", protetRoute, getUserSideBar);
router.get("/:id", protetRoute, getMessages)

router.post("/send/:id", protetRoute, sendMessage)
router.delete("/delete/:id", protetRoute, deleteMessage)




export default router