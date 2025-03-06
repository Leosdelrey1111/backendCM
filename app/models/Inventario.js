const mongoose = require('mongoose');

const InventarioSchema = new mongoose.Schema({
    loteCaja: { type: String, required: true },
    nombreProveedor: { type: String, required: true }, // Relación con nombre del proveedor
    nombreProducto: { type: String, required: true }, // Relación con nombre del producto
    fechaRecibido: { type: Date, default: new Date() },
    fechaCaducidadLote: { type: Date },
    cantidadCajasLote: { type: Number, required: true },
    stockExhibe: { type: Number, required: true },
    stockExhibeMin: { type: Number, required: true }, // Stock mínimo de exhibición
    stockAlmacen: { type: Number, required: true },
    stockAlmacenMin: { type: Number, required: true } // Stock mínimo de almacén
});

module.exports = mongoose.model('Inventario', InventarioSchema);
