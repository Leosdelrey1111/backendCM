const Producto = require('../models/Producto');
const Historial = require('../models/Historial');

// Registrar un producto con proveedor existente
exports.registrarProducto = async (req, res) => {
    try {
        const { nombreProveedor, imagen, ...productoData } = req.body;

        // Crear producto con nombre del proveedor (sin buscarlo en la base de datos)
        const producto = new Producto({
            nombreProveedor,  // Aquí usamos directamente el nombre del proveedor
            imagen,
            ...productoData
        });

        await producto.save();

        res.json({ message: "Producto registrado", producto });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar producto", error });
    }
};


// Editar un producto y crear historial si el precio cambia
exports.editarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreProveedor, precioCaja, precioPieza, imagen } = req.body;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Verificar si el proveedor existe (si se proporciona un nuevo proveedor)
        if (nombreProveedor) {
            // Si se pasa el nombre del proveedor directamente (sin referencia de ObjectId)
            producto.nombreProveedor = nombreProveedor;  // Asumimos que esto es un String
        }

        // Verificar si el precio cambió
        const historialData = {
            nombreProducto: producto.nombreProducto,
            precioAnteriorCaja: producto.precioCaja,
            precioNuevoCaja: precioCaja || producto.precioCaja,
            precioAnteriorPieza: producto.precioPieza,
            precioNuevoPieza: precioPieza || producto.precioPieza,
        };

        // Actualizar producto
        producto.precioCaja = precioCaja || producto.precioCaja;
        producto.precioPieza = precioPieza || producto.precioPieza;
        producto.imagen = imagen || producto.imagen;
        await producto.save();

        // Guardar historial solo si cambió el precio
        if (historialData.precioAnteriorCaja !== historialData.precioNuevoCaja || historialData.precioAnteriorPieza !== historialData.precioNuevoPieza) {
            await new Historial(historialData).save();
        }

        res.json({ message: "Producto actualizado", producto });
    } catch (error) {
        console.error(error);  // Muestra el error completo en el servidor
        res.status(500).json({ message: "Error al editar producto", error });
    }
};

// Eliminar un producto
exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        await Producto.findByIdAndDelete(id);
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar producto", error });
    }
};

// Obtener todos los productos
exports.getProductos = async (req, res) => {
    try {
        const productos = await Producto.find();  // No es necesario hacer populate
        res.json({ message: "Lista de productos", productos });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error });
    }
};


// Obtener un producto por su ID
exports.getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findById(id);

        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ producto });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el producto", error });
    }
};
