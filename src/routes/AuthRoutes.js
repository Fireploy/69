import { Router } from "express";
import { login, cambiarAvatar } from "../controllers/AuthController.js";
import { forgotPassword } from "../controllers/PasswordController.js";
import { resetPassword } from "../controllers/ResetPasswordController.js";
const router = Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/cambiar-avatar/:dni", cambiarAvatar);

export default router;
