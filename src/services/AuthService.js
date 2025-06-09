import Administrador from "../models/Administrador.js";
import Cliente from "../models/Cliente.js";
import bcrypt from "bcrypt";
import SuscripcionService from "../services/SuscripcionService.js";
import { NotFoundError, BadRequestError } from "../errors/Errores.js";

const { verificarMembresiaExpirada } = SuscripcionService;

export async function authenticateUser(DNI, contraseña) {
  let usuario = await Administrador.findByPk(DNI);

  if (usuario) {
    const isValid = bcrypt.compareSync(contraseña, usuario.contraseña);
    if (!isValid) throw new BadRequestError("Contraseña incorrecta");
    return { usuario, role: "Administrador" };
  }

  usuario = await Cliente.findByPk(DNI);
  if (usuario) {
    const isValid = bcrypt.compareSync(contraseña, usuario.contraseña);
    if (!isValid) throw new BadRequestError("Contraseña incorrecta");

    const expirada = await verificarMembresiaExpirada(usuario.DNI);
    if (expirada)
      throw new BadRequestError(
        "Tu membresía ha expirado. Por favor, renueva para continuar."
      );

    return { usuario, role: "Cliente" };
  }

  throw new NotFoundError("Usuario no encontrado");
}

export async function buscarUsuarioPorCorreo(email) {
  let usuario = await Administrador.findOne({ where: { email } });
  if (usuario) return { usuario, role: "Administrador" };

  usuario = await Cliente.findOne({ where: { email } });
  if (usuario) return { usuario, role: "Cliente" };

  return null;
}

export async function actualizarAvatar(DNI, nuevoAvatar) {
  let usuario = await Administrador.findByPk(DNI);
  if (usuario) {
    usuario.avatar = nuevoAvatar;
    await usuario.save();
    return {
      message: "Avatar actualizado correctamente",
      avatar: usuario.avatar,
    };
  }

  usuario = await Cliente.findByPk(DNI);
  if (usuario) {
    usuario.avatar = nuevoAvatar;
    await usuario.save();
    return {
      message: "Avatar actualizado correctamente",
      avatar: usuario.avatar,
    };
  }

  throw new NotFoundError("Usuario no encontrado");
}
