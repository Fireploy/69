import { Router } from "express";
import SuscripcionController from "../controllers/SuscripionController.js";

const router = Router();

router.post("/", SuscripcionController.registrar);

export default router;