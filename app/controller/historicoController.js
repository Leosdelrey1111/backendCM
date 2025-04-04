const Historico = require("../models/historico");

exports.obtenerHistorico = async (req, res) => {
  const historico = await Historico.find();
  res.json(historico);
};
