import * as QRCode from "qrcode";

// URL local de registrar asistencia al que apunta el QR 
const url = 'https://fitmanage.netlify.app/cliente/registrar-asistencia';

// Generar el QR y guardarlo como imagen PNG
QRCode.toFile('qr-asistencias.png', url, {
  color: {
    dark: '#000',  // color del QR
    light: '#FFF'  // fondo blanco
  }
}, function (err) {
  if (err) throw err;
  console.log('Código QR generado: qr-asistencia.png');
});
