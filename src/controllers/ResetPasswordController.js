import jwt from "jsonwebtoken";
import administrador from "../models/Administrador.js";
import cliente from "../models/Cliente.js";
import bcrypt from "bcrypt";

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { nuevaContrasena } = req.body;

    if (!nuevaContrasena) {
      return res.status(400).json({ message: "La contraseña es obligatoria" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { dni, email } = decoded;

    let user = await administrador.findOne({ where: { DNI: dni, email } });
    if (!user) {
      user = await cliente.findOne({ where: { DNI: dni, email } });
    }

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    user.contraseña = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};
