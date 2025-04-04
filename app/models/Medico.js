const mongoose = require("mongoose");

const MedicoSchema = new mongoose.Schema({
  nombre: String,
  especialidad: String,
  correo: String,
  telefono: String,
  diasLaborales: [String],
  horario: {
    inicio: String,
    fin: String
  },
  citasPorDia: Number
});

module.exports = mongoose.model("Medico", MedicoSchema);
