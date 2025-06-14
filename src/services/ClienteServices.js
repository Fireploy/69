import cliente from "../models/Cliente.js";
import suscripcion from "../models/Suscripcion.js";
import membresia from "../models/Membresia.js";
  import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
  Conflict,
} from "../errors/Errores.js";      
import Cliente from "../models/Cliente.js";

    //listar todos los clientes sin repetir
    export async function listar() {
        const clientes = await cliente.findAll({
          include: [
            {
              model: suscripcion,
              include: [
                {
                  model: membresia,
                },
              ],
            },
          ],
          order: [[{ model: suscripcion }, 'fecha_fin', 'DESC']]
        });
      
        return clientes.map((cliente) => {
            const suscripciones = cliente.Cliente_Membresia;
            const ultimaSuscripcion = suscripciones?.[0];
      
          let diasRestantes = 0;
          let estado = "inactivo";
          let tipoMembresia = "No tiene";
      
          if (ultimaSuscripcion) {
            diasRestantes = calcularDiasRestantes(ultimaSuscripcion.fecha_fin);
            tipoMembresia = ultimaSuscripcion.membresium.tipo;
      
            if (diasRestantes > 0) {
              estado = "activo";
            } else {
              estado = "inactivo";
              diasRestantes = 0;
            }
            
          }
      
          return {
            DNI: cliente.DNI,
            nombre: cliente.nombre,
            estado,
            tipo_membresia: tipoMembresia,
            dias_restantes: diasRestantes,
          };
        });
      };
      
      // para calcular el la diferencia entre la fecha fin y la fecha actual
      export function calcularDiasRestantes(fechaFin) {  
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diferencia = fin - hoy;
        const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
        return dias > 0 ? dias : 0;
      };

export async function buscarPorCedula(dni) {
  return await cliente.findByPk(dni);
}

export async function registrarCliente(datosCliente) {
    return await cliente.create(datosCliente);
};

export async function actualizarCliente(dni, nuevosDatos) {
    const clienteExistente = await cliente.findByPk(dni);
  
    if (!clienteExistente) {
      throw new Error("Cliente no encontrado");
    }
  
    await clienteExistente.update(nuevosDatos);
  
    return clienteExistente; 
  }

  export async function actualizarContraseña(dni, contraseñaHasheada) {
    const clienteExistente = await cliente.findByPk(dni);
    if (!clienteExistente) {
      throw new Error("Cliente no encontrado");
    }
  
    clienteExistente.contraseña = contraseñaHasheada;
    await clienteExistente.save();
    return clienteExistente;
  };

  export function tieneMembresiaActiva(fechaFin){
    return new Date(fechaFin) >= new Date();
  };

  export async function membresiasDeCliente(dni) {
    return await cliente.findByPk(dni,{
      include: {
        model:suscripcion,
        separate: true,
       order: [['fecha_fin', 'DESC']]
      }
    });
  }

export async function buscarClienteDias(dni){
  try {
    if(!dni){
      throw new BadRequestError("Documento vacio");
    }
    const cliente = await Cliente.findByPk(dni, {
       include: [
            {
              model: suscripcion,
              include: [
                {
                  model: membresia,
                },
              ],
            },
          ],
          order: [[{ model: suscripcion }, 'fecha_fin', 'DESC']]
    })

    const suscripciones = cliente.Cliente_Membresia;
    const ultimaSuscripcion = suscripciones?.[0];
      
          let diasRestantes = 0;
      
          if (ultimaSuscripcion) {
            diasRestantes = calcularDiasRestantes(ultimaSuscripcion.fecha_fin);
          }
          return {
            DNI: cliente.DNI,
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
            dias: diasRestantes
          } 
  } catch (error) {
    throw error;
  }
}

export async function fechaFinSuscripcion(dni) {
  const clienteEncontrado = await cliente.findByPk(dni, {
    include: [
      {
        model: suscripcion,
        include: [
          {
            model: membresia,
          },
        ],
        order: [['fecha_fin', 'DESC']],
      },
    ],
  });

  if (!clienteEncontrado) {
    throw new NotFoundError("Cliente no encontrado");
  }

  const suscripciones = clienteEncontrado.Cliente_Membresia;
  const ultimaSuscripcion = suscripciones?.[0];

  return {
    DNI: clienteEncontrado.DNI,
    fecha_fin: ultimaSuscripcion ? ultimaSuscripcion.fecha_fin : null,
  };
}