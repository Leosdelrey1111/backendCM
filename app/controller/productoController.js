const Producto = require('../models/Producto');
const Historial = require('../models/Historial');
const Proveedor = require('../models/Proveedor');

// Registrar un producto con proveedor existente
exports.registrarProducto = async (req, res) => {
    try {
        const { nombreProveedor, ...productoData } = req.body;

        // Verificar si el proveedor existe
        const proveedorExistente = await Proveedor.findOne({ nombre: nombreProveedor });

        if (!proveedorExistente) {
            return res.status(400).json({ message: "El proveedor no existe" });
        }

        const producto = new Producto({ nombreProveedor, ...productoData });
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
        const { precioCaja, precioPieza } = req.body;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
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
        await producto.save();

        // Guardar historial solo si cambió el precio
        if (historialData.precioAnteriorCaja !== historialData.precioNuevoCaja || historialData.precioAnteriorPieza !== historialData.precioNuevoPieza) {
            await new Historial(historialData).save();
        }

        res.json({ message: "Producto actualizado", producto });
    } catch (error) {
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

// Actualizar stock en exhibición con validación de stock mínimo
exports.actualizarStockExhibe = async (req, res) => {
    try {
        const { id } = req.params;
        const { stockExhibe } = req.body;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        producto.stockExhibe = stockExhibe;
        await producto.save();

        let message = "Stock en exhibición actualizado";
        if (stockExhibe < producto.stockExhibeMin) {
            message += " - Alerta: Se debe reabastecer en exhibición";
        }

        res.json({ message, producto });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar stock en exhibición", error });
    }
};

// Actualizar stock en almacén con validación de stock mínimo
exports.actualizarStockAlmacen = async (req, res) => {
    try {
        const { id } = req.params;
        const { stockAlmacen } = req.body;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        producto.stockAlmacen = stockAlmacen;
        await producto.save();

        let message = "Stock en almacén actualizado";
        if (stockAlmacen < producto.stockAlmacenMin) {
            message += " - Alerta: Se debe reabastecer en almacén";
        }

        res.json({ message, producto });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar stock en almacén", error });
    }
};

// Obtener todos los productos con los proveedores
exports.getProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json({ message: "Lista de productos", productos });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error });
    }
};
