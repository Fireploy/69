import express from "express";
import { enviarResumenMensual } from "../controllers/ReporteController.js";

const router = express.Router();

router.post("/enviar-resumen-mensual", enviarResumenMensual);

export default router;
