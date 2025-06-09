import { enviarCorreo } from "../services/EmailService.js";
import { generarTokenParaRecuperacion } from "../GenerarToken.js";
import administrador from "../models/Administrador.js";
import cliente from "../models/Cliente.js";

export const forgotPassword = async (req, res) => {
  try {
    const { dni, email } = req.body;

    let user = await administrador.findOne({ where: { DNI: dni } });
    let role = "administrador";

    if (!user) {
      user = await cliente.findOne({ where: { DNI: dni } });
      role = "cliente";
    }

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.email !== email) {
      return res
        .status(400)
        .json({ message: "El correo no coincide con el registrado" });
    }

    const token = generarTokenParaRecuperacion(dni, email);

    const resetLink = `${process.env.URL_FRONTEND}/reset-password/${token}`;

    const mensaje = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #2c3e50; text-align: center;">Restablecimiento de contraseña</h2>
    <p>Hola 👋,</p>
    <p>Hemos recibido una solicitud para restablecer tu contraseña en <strong>Gym Klinsmann</strong>.</p>
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en nuestra plataforma <strong>Gym Klinsmann</strong>.</p>
    <p>Si realizaste esta solicitud, haz clic en el siguiente botón para continuar con el proceso:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background-color: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Cambiar contraseña
      </a>
    </div>
    <p style="font-size: 14px; color: #555;">Si no solicitaste este cambio, ignora este mensaje.</p>
    <hr style="margin: 20px 0;" />
    <p style="font-size: 12px; color: #999; text-align: center;">Equipo de soporte técnico de Gym Klinsmann</p>
  </div>
`;

    await enviarCorreo(
      email,
      "Recuperación de contraseña - Gym Klinsmann",
      mensaje
    );

    return res.status(200).json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ message: "Error al enviar el correo" });
  }
};
