const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    codigoBarras: { type: String, required: true, unique: true },
    nombreProducto: { type: String, required: true },
    tamaño: { type: String, required: true }, // Tamaño del producto
    categoriaMaquillaje: { type: String },
    subcategoria: { type: String },
    marca: { type: String },
    nombreProveedor: { type: String, required: true }, // Relación con proveedor por nombre
    precioCaja: { type: Number, required: true },
    precioPieza: { type: Number, required: true },
    cantidadPorCaja: { type: Number, required: true },
    cantidadPiezas: { type: Number, required: true },
    stockExhibe: { type: Number, required: true },
    stockExhibeMin: { type: Number, required: true }, // Stock mínimo de exhibición
    stockAlmacen: { type: Number, required: true },
    stockAlmacenMin: { type: Number, required: true }, // Stock mínimo de almacén
    imagen: { type: String }  // Guardar la imagen como Base64
});

module.exports = mongoose.model('Producto', ProductoSchema);
