const Proveedor = require('../models/Proveedor');

exports.getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.find({}, { _id: 1, nombre: 1 });
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener proveedores", error });
    }
};

exports.createProveedor = async (req, res) => {
    try {
        const proveedor = new Proveedor(req.body);
        await proveedor.save();
        res.json({ message: "Proveedor agregado", proveedor });
    } catch (error) {
        res.status(500).json({ message: "Error al agregar proveedor", error });
    }
};

exports.getProveedorById = async (req, res) => {
    try {
        const proveedor = await Proveedor.findById(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.json(proveedor);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
};

exports.deleteProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.json({ message: "Proveedor eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
};
