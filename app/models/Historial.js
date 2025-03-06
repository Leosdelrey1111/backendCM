const mongoose = require('mongoose');

const HistorialSchema = new mongoose.Schema({
    nombreProducto: { type: String, required: true },
    precioAnteriorCaja: { type: Number },
    precioNuevoCaja: { type: Number },
    precioAnteriorPieza: { type: Number },
    precioNuevoPieza: { type: Number },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Historial', HistorialSchema);
