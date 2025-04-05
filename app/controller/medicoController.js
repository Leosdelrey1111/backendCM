const Medico = require("../models/Medico");
const Citas = require("../models/Citas");
exports.obtenerMedicos = async (req, res) => {
  const medicos = await Medico.find();
  res.json(medicos);
};

