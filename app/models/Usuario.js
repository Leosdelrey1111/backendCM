const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UsuarioSchema = new mongoose.Schema({
  nombreCompleto: String,
  correo: { type: String, unique: true, required: true },
  contraseña: { type: String, required: true },
  telefono: String,
  rol: { type: String, enum: ["Paciente", "Consultorio"], required: true }
});

// // Hashear la contraseña antes de guardar
// UsuarioSchema.pre("save", async function (next) {
//   if (!this.isModified("contraseña")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.contraseña = await bcrypt.hash(this.contraseña, salt);
//   next();
// });

module.exports = mongoose.model("Usuario", UsuarioSchema);
