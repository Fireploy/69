import { DataTypes } from "sequelize";
import db from "../db/db.js";
import Cliente from "./Cliente.js";
import Membresia from "./Membresia.js";

const Pago = db.define("pago", {
    id_pago: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    fecha_pago: {type: DataTypes.DATEONLY, allowNull: false}
}, {
    timestamps: false, 
    freezeTableName: true
});

//Relación Cliente-Pago
Cliente.hasMany(Pago, {
    foreignKey: "id_cliente"
});

Pago.belongsTo(Cliente, {
    foreignKey: "id_cliente"
})

//Relación Membresía-Pago
Membresia.hasMany(Pago, {
    foreignKey: "id_membresia"
});
Pago.belongsTo(Membresia, {
    foreignKey: "id_membresia"
});

export default Pago;