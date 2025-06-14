
import dotenv from "dotenv";
dotenv.config({
  path: "../.env"
});

import { Sequelize } from "sequelize";


const sequelize = new Sequelize(process.env.DB_CONNECTION_URI, {
  define: { timestamps: false },
});

// const sequelize = new Sequelize("klinsmann", "root", "", {
//   host: "localhost",
//   dialect: "mysql"
// });

//probando conexión con la base de datos
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(" Conexión a la base de datos exitosa.");
  } catch (error) {
    console.error(" Error al conectar a la base de datos:", error);
  }
}

export default sequelize;