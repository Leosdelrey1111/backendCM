const Historial = require('../models/Historial');

exports.getHistorial = async (req, res) => {
    const historial = await Historial.find();
    res.json(historial);
};

exports.createHistorial = async (req, res) => {
    const historial = new Historial(req.body);
    await historial.save();
    res.json({ message: "Historial agregado", historial });
};
