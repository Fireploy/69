import express from "express";
import RutinaController from "../controllers/RutinaController.js";

const router = express.Router();

router.post("/chatbot", RutinaController.generarRutina);


export default router;
