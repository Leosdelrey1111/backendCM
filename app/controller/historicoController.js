const historicoModel = require('../models/historico');  // Asegúrate de tener el modelo correspondiente

// Obtener el historial completo
exports.obtenerHistorico = async (req, res) => {
  try {
    const historico = await historicoModel.find();
    res.status(200).json(historico);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el historial", error });
  }
};

// Obtener historial por paciente
exports.obtenerHistorialPorPaciente = async (req, res) => {
  const pacienteId = req.params.id;
  try {
    const historialPaciente = await historicoModel.find({ pacienteId });
    res.status(200).json(historialPaciente);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el historial del paciente", error });
  }
};

// Obtener historial por usuario
exports.obtenerHistoricoPorUsuario = async (req, res) => {
  const { usuarioId } = req.query;
  try {
    const historialUsuario = await historicoModel.find({ usuarioId });
    res.status(200).json(historialUsuario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el historial del usuario", error });
  }
};
