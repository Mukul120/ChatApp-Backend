import express from "express"
import { chekcAuth, login, logout, profilepic, signup } from "../Controllers/auth.controller.js";
import { protetRoute } from "../Middlewares/auth.middleware.js";

const router = express.Router()


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/profilepic", protetRoute, profilepic)

router.get("/check", protetRoute, chekcAuth)

export default router