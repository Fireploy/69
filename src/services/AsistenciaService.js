import SuscripcionService from "./SuscripcionService.js";
import { Op } from "sequelize";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
  Conflict,
} from "../errors/Errores.js";
import Asistencia from "../models/Asistencia.js";
import { startOfWeek, addDays, format } from "date-fns";
import {  differenceInCalendarDays } from "date-fns";
import NotificacionService from "./NotificacionService.js";
import NotificacionUsuarioService from "./NotificacionUsuarioService.js";
import Membresia from "../models/Membresia.js";

async function registrarAsistencia(dni) {
  try {
    const ultimaSuscripcion = await SuscripcionService.obtenerUltimaSuscripcion(
      dni
    );
    if (!ultimaSuscripcion) {
      throw new NotFoundError("No se encontró la suscripcion");
    }
    let hoy = new Date();
    let ahora = new Date();
    hoy = format(hoy, "yyyy-MM-dd");
    ahora = format(ahora, "HH:mm");
    const fin = new Date(ultimaSuscripcion.fecha_fin);
    //valido si aún no se ha registrado asistencia
    const yaRegistro = await verSiYaRegistroAsistencia(dni, hoy);
    //si aún le quedan días  creo la asistencia
    if (yaRegistro) {
      throw new Conflict("Ya registró asistencia hoy.");
    }
    if (hoy > fin) {
      throw new Conflict("No cuenta con membresía activa");
    }
    const asistencia = await Asistencia.create({
      fecha: hoy,
      id_cliente: dni,
    });
    if (!asistencia) {
      throw new InternalServerError("No se pudo crear la asistencia");
    }

    //que se registró la asistencia con éxito 
      const notificacion = await NotificacionService.crearNotificacionGeneral("Registrada", 
        `Asisencia registrada con éxito`, 3);
      if(!notificacion){
          throw new InternalServerError("no se pudo crear la notificacion");
        }
      const notifiUsuario = await NotificacionUsuarioService.crearNotiUsuario(notificacion.id_notificacion, dni);
      if(!notifiUsuario){
          throw new InternalServerError("No se creo la notificacion para el usuario")
      };
    return asistencia;
  } catch (error) {
    throw error;
  }
}

async function verSiYaRegistroAsistencia(dni, fecha) {
  const asistencia = await Asistencia.findOne({
    where: {
      id_cliente: dni,
      fecha: fecha,
    },
  });
  return asistencia !== null;
}

async function obtenerAsistenciasPorCliente(dni) {
  console.log("Buscando asistencias para cliente DNI:", dni);
  const asistencias = await Asistencia.findAll({
    where: { id_cliente: dni },
    attributes: ["fecha"],
    order: [["fecha", "ASC"]],
  });

  console.log("Asistencias encontradas:", asistencias);

  return asistencias.map((a) => a.fecha);
}

async function obtenerAsistenciasPorClienteEnRango(dni, fechaInicio, fechaFin) {
  const asistencias = await Asistencia.findAll({
    where: {
      id_cliente: dni,
      fecha: {
        [Op.between]: [fechaInicio, fechaFin],
      },
    },
    attributes: ["fecha"],
    order: [["fecha", "ASC"]],
  });
  return asistencias.map((a) => a.fecha);
}

async function obtenerAsistenciasUltimaSemana(dni) {
  const hoy = new Date();
  const lunes = startOfWeek(hoy, { weekStartsOn: 1 });
  const sabado = addDays(lunes, 5);

  const fechaInicio = format(lunes, "yyyy-MM-dd");
  const fechaFin = format(sabado, "yyyy-MM-dd");

  const asistencias = await Asistencia.findAll({
    where: {
      id_cliente: dni,
      fecha: {
        [Op.between]: [fechaInicio, fechaFin],
      },
    },
    attributes: ["fecha"],
  });

  // Crear un mapa de fechas asistidas
 const fechasAsistidas = new Set(asistencias.map(a => new Date(a.fecha).toISOString().slice(0, 10)));

  // Generar la lista de días de lunes a sábado
  const resultado = [];
  for (let i = 0; i < 6; i++) {
    const fecha = addDays(lunes, i);
     const fechaStr = fecha.toISOString().slice(0, 10);
    const diaSemana = format(fecha, "EEEE", { locale: undefined }); // Puedes usar 'es' si tienes date-fns/locale/es
    resultado.push({
      fecha: fechaStr,
      dia: diaSemana,
      asistio: fechasAsistidas.has(fechaStr),
    });
  }

  return resultado;
}

export default {
  registrarAsistencia,
  verSiYaRegistroAsistencia,
  obtenerAsistenciasPorCliente,
  obtenerAsistenciasPorClienteEnRango,
  obtenerAsistenciasUltimaSemana,
};


