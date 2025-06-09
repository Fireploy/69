import cron from "node-cron";
import axios from "axios";

cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Ejecutando envío de resumen mensual...");
    await axios.post(`${process.env.URL_BACKEND}/enviar-resumen-mensual`);
    console.log("Envío completado");
  } catch (error) {
    console.error("Error cron:", error);
  }
});
