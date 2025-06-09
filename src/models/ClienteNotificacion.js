import { DataTypes } from "sequelize";
import db from "../db/db.js";
import Notificacion from "./Notificacion.js";
import Cliente from "./Cliente.js";

const ClienteNotificacion = db.define("cliente_notificacion",{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    fecha_creacion: {type: DataTypes.DATEONLY},
    estado: {type: DataTypes.BOOLEAN}
},{
    timestamps: false,
    freezeTableName: true
});

//relacion con notificacion
Notificacion.hasMany(ClienteNotificacion, {
    foreignKey: "id_notificacion"
})
ClienteNotificacion.belongsTo(Notificacion, {
    foreignKey: "id_notificacion"
})

//Relacion cn cliente
Cliente.hasMany(ClienteNotificacion, {
    foreignKey: "id_cliente"
});
ClienteNotificacion.belongsTo(Cliente, {
    foreignKey: "id_cliente"
})

export default ClienteNotificacion;