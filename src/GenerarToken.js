import jwt from "jsonwebtoken";

export function generarTokenParaRecuperacion(dni, email) {
  const payload = { dni, email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "6m" });
}
