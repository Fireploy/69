import { InternalServerError } from "../errors/Errores.js";
import { authenticateUser, actualizarAvatar } from "../services/AuthService.js";
import NotificacionUsuarioService from "../services/NotificacionUsuarioService.js";
import { format, differenceInCalendarDays } from "date-fns";
import SuscripcionService from "../services/SuscripcionService.js";
import NotificacionService from "../services/NotificacionService.js"
export async function login(req, res) {
  try {
    const { DNI, contraseña } = req.body;

    if (!DNI || !contraseña) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    const { usuario, role } = await authenticateUser(DNI, contraseña);
    //aqui que verifique cuantos dias le quedan y si se crea la noti
    if (role == "Cliente") {
      const ultimaSuscripcion =
        await SuscripcionService.obtenerUltimaSuscripcion(DNI);
      if (!ultimaSuscripcion) {
        throw new NotFoundError("No se encontró la suscripcion");
      }
      let hoy = new Date();
      const fin = new Date(ultimaSuscripcion.fecha_fin);
      const diasRestantes = differenceInCalendarDays(fin, new Date(hoy));
      if (diasRestantes <= 2) {
        const notificacion = await NotificacionService.crearNotificacionGeneral(
          "Vencimiento Membresía",
          `Te quedan ${diasRestantes} días`,
          2
        );
        if (!notificacion) {
          throw new InternalServerError("no se pudo crear la notificacion");
        }
        const notifiUsuario = await NotificacionUsuarioService.crearNotiUsuario(
          notificacion.id_notificacion,
          DNI
        );
        if (!notifiUsuario) {
          throw new InternalServerError(
            "No se creo la notificacion para el usuario"
          );
        }
      }
    }

    return res.json({
      role,
      message: "Inicio de sesión exitoso",
      usuario: {
        DNI: usuario.DNI,
        nombre: usuario.nombre,
        avatar: usuario.avatar,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error.message);

    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function cambiarAvatar(req, res) {
  const { avatar } = req.body;
  const { dni } = req.params;
  try {
    const resultado = await actualizarAvatar(dni, avatar);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error en cambiarAvatar:", error); // <-- Agrega esto
    res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar avatar",
    });
  }
}
