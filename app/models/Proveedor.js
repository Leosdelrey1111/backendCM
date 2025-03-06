const mongoose = require('mongoose');

const ProveedorSchema = new mongoose.Schema({
    folioProveedor: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    telefono: { type: String },
    correo: { type: String },
    direccion: {
        calle: { type: String },
        numeroInterior: { type: String },
        numeroExterior: { type: String },
        colonia: { type: String },
        codigoPostal: { type: String },
        ciudad: {
            nombreCiudad: { type: String }
        }
    }
});

module.exports = mongoose.model('Proveedor', ProveedorSchema);
