const Especialidad = require("../models/Especialidad");

exports.obtenerEspecialidades = async (req, res) => {
  const especialidades = await Especialidad.find();
  res.json(especialidades);
};
