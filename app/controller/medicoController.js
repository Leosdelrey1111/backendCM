const Medico = require("../models/Medico");

exports.obtenerMedicos = async (req, res) => {
  const medicos = await Medico.find();
  res.json(medicos);
};
