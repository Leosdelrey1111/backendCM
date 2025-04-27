const Medico = require("../models/Medico");
const Citas = require("../models/Citas");

exports.obtenerMedicos = async (req, res) => {
  const medicos = await Medico.find();
  res.json(medicos);
};

exports.obtenerMedicoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const medico = await Medico.findById(id);
    if (!medico) return res.status(404).json({ msg: 'Médico no encontrado' });
    res.json(medico);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};