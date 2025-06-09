import SuscripcionService from "../services/SuscripcionService.js";
import AsistenciaService from "../services/AsistenciaService.js";
import { enviarCorreo } from "../services/EmailService.js";
import { startOfMonth, endOfMonth, format } from "date-fns";

function generarMensajeResumen(cliente, asistencias) {
  const tieneAsistencias = asistencias.length > 0;

  const listaAsistencias = tieneAsistencias
    ? `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 15px 0;">
        <h3 style="color: #2c3e50; margin-top: 0; font-size: 18px;">Tus asistencias registradas:</h3>
        <ul style="padding-left: 20px; margin: 10px 0; color: #34495e; list-style-type: none;">
          ${asistencias
            .map((fecha, index) => {
              const dateStr =
                typeof fecha === "string"
                  ? fecha.split("-").reverse().join("/")
                  : format(new Date(fecha), "dd/MM/yyyy");

              return `
                <li style="margin-bottom: 5px; position: relative; padding-left: 15px;">
                  <span style="position: absolute; left: 0; color: #e74c3c;">•</span>
                  ${dateStr}
                </li>`;
            })
            .join("")}
        </ul>
        <div style="background: #e8f4fc; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <p style="margin: 0; color: #2980b9; font-weight: bold;">
            Total de asistencias: <span style="color: #e74c3c;">${
              asistencias.length
            }</span>
          </p>
        </div>
      </div>
    `
    : `
      <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 0 4px 4px 0;">
        <p style="margin: 0; color: #ff9800; font-weight: bold;">
          No registraste asistencias este mes.
        </p>
        <p style="margin: 10px 0 0; color: #795548;">
          ¡Te extrañamos en el gimnasio! Esperamos verte pronto para seguir alcanzando tus metas.
        </p>
      </div>
    `;

  const mensajeFinal = tieneAsistencias
    ? `Gracias por formar parte de nuestra comunidad fitness. ¡Sigue adelante y no pares de avanzar!<br>
       <strong>Equipo Gym Klinsmann</strong>`
    : `Cada día es una nueva oportunidad para retomar tus metas y fortalecer tu cuerpo y mente.<br>
       <strong>Equipo Gym Klinsmann</strong>`;

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; color: #333; line-height: 1.6;">
      <div style="background: linear-gradient(135deg, #1e5799 0%,#207cca 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Gym Klinsmann</h1>
      </div>
      
      <div style="padding: 20px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
        <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">Resumen mensual de asistencias</h2>
        
        <p>Hola <strong style="color: #1e5799;">${cliente.nombre}</strong>,</p>
        
        <p>Aquí tienes tu resumen de actividades del mes en <strong>Gym Klinsmann</strong>:</p>
        
        ${listaAsistencias}
        
        <p style="font-size: 14px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 0;">
          ${mensajeFinal}
        </p>
      </div>
      
      <div style="text-align: center; padding: 15px; font-size: 12px; color: #95a5a6;">
        © ${new Date().getFullYear()} Gym Klinsmann. Todos los derechos reservados.
      </div>
    </div>
  `;
}
export async function enviarResumenMensual(req, res) {
  try {
    const clientes = await SuscripcionService.obtenerClientesActivos();

    if (!clientes || clientes.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay clientes activos para enviar resumen." });
    }

    const inicioMes = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const finMes = format(endOfMonth(new Date()), "yyyy-MM-dd");

    for (const cliente of clientes) {
      if (!cliente || !cliente.email || !cliente.DNI) {
        console.warn(
          `Cliente inválido u omitido (nombre: ${cliente?.nombre}, id: ${cliente?.id}, dni: ${cliente?.DNI})`
        );
        continue;
      }

      const asistencias =
        await AsistenciaService.obtenerAsistenciasPorClienteEnRango(
          cliente.DNI,
          inicioMes,
          finMes
        );

      const mensaje = generarMensajeResumen(cliente, asistencias);

      try {
        await enviarCorreo(
          cliente.email,
          "Resumen mensual de asistencias - Gym Klinsmann",
          mensaje
        );
      } catch (correoError) {
        console.error(
          `Error enviando correo a ${cliente.email}:`,
          correoError.message
        );
      }
    }

    return res
      .status(200)
      .json({ message: "Proceso de envío de correos finalizado." });
  } catch (error) {
    console.error("Error en enviarResumenMensual:", error);
    return res.status(500).json({ message: "Error interno enviando correos." });
  }
}
