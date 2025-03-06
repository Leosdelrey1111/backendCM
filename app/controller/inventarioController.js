const Inventario = require('../models/Inventario');

exports.getInventario = async (req, res) => {
    try {
        const inventario = await Inventario.find();
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener inventario", error });
    }
};

exports.createInventario = async (req, res) => {
    try {
        const inventario = new Inventario(req.body);
        await inventario.save();
        res.json({ message: "Inventario agregado", inventario });
    } catch (error) {
        res.status(500).json({ message: "Error al agregar inventario", error });
    }
};
