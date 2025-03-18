const Proveedor = require('../models/Proveedor');

// Obtener todos los proveedores
exports.getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.find();  // Obtener todos los proveedores
        res.json(proveedores); // Devolver todos los proveedores
    } catch (error) {
        res.status(500).json({ message: "Error al obtener proveedores", error });
    }
};

// Crear un nuevo proveedor
exports.createProveedor = async (req, res) => {
    try {
        const { folioProveedor, nombre, telefono, correo, direccion } = req.body;

        // Verificar si todos los campos obligatorios están presentes
        if (!folioProveedor || !nombre || !direccion) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        // Verificar si el folioProveedor es único
        const proveedorExistente = await Proveedor.findOne({ folioProveedor });
        if (proveedorExistente) {
            return res.status(400).json({ message: "El folio del proveedor ya existe" });
        }

        const proveedor = new Proveedor({
            folioProveedor,
            nombre,
            telefono,
            correo,
            direccion
        });

        await proveedor.save();
        res.status(201).json({ message: "Proveedor agregado", proveedor });
    } catch (error) {
        res.status(500).json({ message: "Error al agregar proveedor", error });
    }
};

// Obtener un proveedor por su ID
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

// Eliminar un proveedor por su ID
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

// Actualizar un proveedor por su ID
exports.updateProveedor = async (req, res) => {
    try {
        const { folioProveedor, nombre, telefono, correo, direccion } = req.body;

        // Verificar que al menos un campo sea proporcionado para la actualización
        if (!folioProveedor || !nombre || !direccion) {
            return res.status(400).json({ message: "Faltan datos obligatorios para actualizar" });
        }

        const proveedorActualizado = await Proveedor.findByIdAndUpdate(req.params.id, {
            folioProveedor,
            nombre,
            telefono,
            correo,
            direccion
        }, { new: true }); // `new: true` devuelve el documento actualizado

        if (!proveedorActualizado) {
            return res.status(404).json({ message: "Proveedor no encontrado para actualizar" });
        }

        res.json({ message: "Proveedor actualizado", proveedor: proveedorActualizado });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar proveedor", error });
    }
};
