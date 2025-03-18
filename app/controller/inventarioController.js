const Inventario = require('../models/Inventario');
const Producto = require('../models/Producto');

// Obtener el inventario y agregar los detalles de los productos
exports.getInventario = async (req, res) => {
    try {
        // Obtener todos los productos del inventario
        const inventario = await Inventario.find();

        if (inventario.length === 0) {
            return res.status(404).json({ message: "No se encontraron productos en el inventario" });
        }

        // Recuperar los detalles del producto para cada ítem del inventario
        const inventarioConProductos = await Promise.all(inventario.map(async (item) => {
            const producto = await Producto.findOne({ nombreProducto: item.nombreProducto });  // Buscar el producto por nombre
            if (producto) {
                item.nombreProducto = producto.nombreProducto;
                item.stockExhibe = producto.stockExhibe;  // Actualizar el stockExhibe con el valor del producto
            }
            return item;
        }));

        res.json(inventarioConProductos);  // Retornar el inventario con los productos actualizados
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener inventario", error });
    }
};

// Crear un nuevo producto en el inventario
exports.createInventario = async (req, res) => {
    try {
        const inventario = new Inventario(req.body);
        await inventario.save();
        res.json({ message: "Inventario agregado", inventario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al agregar inventario", error });
    }
};

// Función para actualizar la cantidad de un producto
exports.updateStockExhibe = async (req, res) => {
    const { id } = req.params; // ID del producto en el inventario
    const { stockExhibe } = req.body; // El nuevo valor de stockExhibe

    try {
        // Encuentra el producto en el inventario por su ID
        const inventario = await Inventario.findById(id);
        if (!inventario) {
            return res.status(404).json({ message: 'Producto no encontrado en el inventario' });
        }

        // Actualiza el stockExhibe en el inventario
        inventario.stockExhibe = stockExhibe;
        await inventario.save(); // Guarda el inventario actualizado

        // Ahora actualiza el producto correspondiente en el modelo Producto
        const producto = await Producto.findOne({ nombreProducto: inventario.nombreProducto });
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado en el catálogo de productos' });
        }

        // Actualiza solo el campo stockExhibe, sin activar la validación completa
        await producto.updateOne({ stockExhibe: stockExhibe }, { runValidators: false });

        res.json({ message: 'Cantidad actualizada correctamente', inventario });
    } catch (error) {
        console.error('Error al actualizar el stockExhibe:', error);
        res.status(500).json({ message: 'Error al actualizar la cantidad', error: error.message });
    }
};
