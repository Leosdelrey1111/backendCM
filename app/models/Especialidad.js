const mongoose = require("mongoose");

const EspecialidadSchema = new mongoose.Schema({
  especialidad: String,
  descripcion: String
});

module.exports = mongoose.model("Especialidad", EspecialidadSchema);
