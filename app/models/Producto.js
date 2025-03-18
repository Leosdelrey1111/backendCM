// Producto.js

const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    codigoBarras: { type: String, required: true },
    nombreProducto: { type: String, required: true },
    tamano: { type: String, required: true },
    categoriaMaquillaje: { type: String },
    subcategoria: { type: String },
    marca: { type: String },
    nombreProveedor: { type: String, required: true },
    precioCaja: { type: Number, required: true },
    precioPieza: { type: Number, required: true },
    cantidadPorCaja: { type: Number, required: true },
    cantidadPiezas: { type: Number, required: true },
    stockExhibe: { type: Number, required: true },
    stockExhibeMin: { type: Number, required: true },
    stockAlmacen: { type: Number, required: true },
    stockAlmacenMin: { type: Number, required: true },
    imagen: { type: String },
    activo: { type: Boolean, default: true } // Campo para saber si el producto está activo
});

module.exports = mongoose.model('Producto', ProductoSchema);
