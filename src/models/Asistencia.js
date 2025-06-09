import { DataTypes } from "sequelize";
import db from "../db/db.js";
import Cliente from "./Cliente.js";
import Administrador from "./Administrador.js";


const Asistencia = db.define("asistencia", {
    id_asistencia: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    fecha: {type: DataTypes.DATEONLY, allowNull: false},
    hora: {type: DataTypes.TIME}
},{
    timestamps: false, 
    freezeTableName: true
});

//Relación Asistencia_Cliente
Cliente.hasMany(Asistencia, {
    foreignKey: "id_cliente"
});
Asistencia.belongsTo(Cliente, {
    foreignKey: "id_cliente"
});

//Relación Asistencia_Administrador
Administrador.hasMany(Asistencia, {
    foreignKey: "id_administrador"
})
Asistencia.belongsTo(Administrador, {
    foreignKey: "id_administrador"
})

export default Asistencia;