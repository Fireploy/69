import { NotFoundError,
  BadRequestError,
  InternalServerError, } from "../errors/Errores.js";
import TipoNotificacion from "../models/TipoNotificacion.js";

async function crearTipo(nombre) {
    if(!nombre){
        throw new NotFoundError("El nombre no puede estar vacio")
    };
    try {
        const tipo = await TipoNotificacion.create({
            nombre: nombre
        });
        if(!tipo){
            throw new InternalServerError("Error al crear el tipo")
        }
        return tipo;
    } catch (error) {
        throw error;
    }
};

async function obtenerPorID(id) {
    if(!id){
        throw new BadRequestError("id vacio");
    }
        const tipo = await TipoNotificacion.findByPk(id);
        return tipo;
}

export default {crearTipo, obtenerPorID};