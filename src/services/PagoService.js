import Cliente from "../models/Cliente.js";
import Membresia from "../models/Membresia.js";
import Suscripcion from "../models/Suscripcion.js";
import Pago from "../models/Pago.js";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
  Conflict,
} from "../errors/Errores.js";
import SuscripcionService from "./SuscripcionService.js";
import {
  tieneMembresiaActiva,
  membresiasDeCliente,
} from "./ClienteServices.js";

//Registrar un nuevo pago, al hacerlo debo también registrar que el cliente adquirió una nuva suscripción
async function registrar(cliente_id, membresia_id) {
  //valido los datos
  if (!cliente_id) {
    throw new BadRequestError("Cliente inválido");
  }
  if (!membresia_id) {
    throw new BadRequestError("Membresia inválida");
  }
  try {
    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) {
      throw new NotFoundError("Cliente no encontrado");
    }
    //Para saber si el cliente ya cuenta con una membresia activa
    const clienteConMembresias = await membresiasDeCliente(cliente.DNI);
    if (clienteConMembresias) {
      const suscripciones =
        clienteConMembresias?.Cliente_Membresia ||
        clienteConMembresias?.dataValues?.Cliente_Membresia;

      const ultimaSuscripcion = suscripciones?.[0];
      if (ultimaSuscripcion) {
        const tieneMembreActvia = tieneMembresiaActiva(
          ultimaSuscripcion.fecha_fin
        );
        if (tieneMembreActvia) {
          throw new Conflict("El cliente ya cuenta con una membresia activa");
        }
      }
    }

    const membresia = await Membresia.findByPk(membresia_id);
    if (!membresia) {
      throw new NotFoundError("Membresia no encontrada");
    }
    const pago = await Pago.create({
      fecha_pago: new Date(),
      id_cliente: cliente_id,
      id_membresia: membresia_id,
    });
    SuscripcionService.registrar(cliente_id, membresia_id);
    return pago;
  } catch (error) {
    throw error;
  }
}

export default {
  registrar,
};
