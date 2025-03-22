const Producto = require('../models/Producto');
const Historial = require('../models/Historial');
const Inventario = require('../models/Inventario');

// Registrar un producto con proveedor existente
exports.registrarProducto = async (req, res) => {
    try {
        const { 
            nombreProveedor, imagen, cantidadCajasLote, stockExhibe, 
            stockExhibeMin, stockAlmacen, stockAlmacenMin, fechaCaducidadLote, 
            codigoBarras, nombreProducto, tamano, categoriaMaquillaje, 
            subcategoria, marca, precioCaja, precioPieza, cantidadPorCaja, 
            cantidadPiezas 
        } = req.body;

        // Verificar si los campos requeridos existen
        if (!codigoBarras || !nombreProducto || !tamano || !precioCaja || !precioPieza) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        // Generar un número de lote único (Helper function)
        const loteCaja = generarLote(req.body);

        // Crear producto con nombre del proveedor
        const producto = new Producto({
            nombreProveedor,
            imagen,
            codigoBarras,
            nombreProducto,
            tamano,
            categoriaMaquillaje,
            subcategoria,
            marca,
            precioCaja,
            precioPieza,
            cantidadPorCaja,
            cantidadPiezas,
            stockExhibe,
            stockExhibeMin,
            stockAlmacen,
            stockAlmacenMin
        });

        // Crear inventario al registrar el producto
        const inventario = new Inventario({
            loteCaja,
            nombreProveedor,
            nombreProducto,
            cantidadCajasLote,
            stockExhibe,
            stockExhibeMin,
            stockAlmacen,
            stockAlmacenMin,
            fechaCaducidadLote  // Fecha de caducidad
        });

        // Guardar en la base de datos
        await producto.save(); 
        await inventario.save(); 

        res.json({ message: "Producto registrado y inventario creado", producto });
    } catch (error) {
        console.error("Error al registrar producto:", error);
        res.status(500).json({ message: "Error al registrar producto", error: error.message });
    }
};

exports.bajaTemporalProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Actualizar el producto y marcarlo como inactivo (activo: false)
        const producto = await Producto.findByIdAndUpdate(id, { activo: false }, { new: true });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto dado de baja temporalmente', producto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al dar baja temporal al producto', error });
    }
};

// Nueva función para reactivar un producto
exports.reactivarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findByIdAndUpdate(id, { activo: true }, { new: true });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto reactivado', producto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al reactivar el producto', error });
    }
};

// Obtener todos los productos activos
exports.getProductos = async (req, res) => {
    try {
        const productos = await Producto.find({ activo: true }); // Filtrar solo productos activos
        res.json({ message: "Lista de productos", productos });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error });
    }
};



// Función para generar un número de lote único
function generarLote(producto) {
    const fecha = new Date().toISOString().slice(0, 10); // Fecha en formato YYYY-MM-DD
    const proveedor = producto.nombreProveedor.substring(0, 3).toUpperCase(); // Primeros 3 caracteres del nombre del proveedor
    const categoria = producto.categoriaMaquillaje.substring(0, 3).toUpperCase(); // Primeros 3 caracteres de la categoría
    const randomNum = Math.floor(Math.random() * 1000); // Generar un número aleatorio para hacer único el lote
    return `${proveedor}-${categoria}-${fecha}-${randomNum}`;
}

// Editar un producto y crear historial solo si el precio cambia
exports.editarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            codigoBarras, nombreProducto, tamano, categoriaMaquillaje, 
            subcategoria, marca, nombreProveedor, precioCaja, precioPieza, 
            cantidadPorCaja, cantidadPiezas, stockExhibe, stockAlmacen, 
            stockExhibeMin, stockAlmacenMin, imagen 
        } = req.body;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Crear historial solo si los precios cambian
        let historial = null;
        if (producto.precioCaja !== precioCaja || producto.precioPieza !== precioPieza) {
            historial = new Historial({
                nombreProducto: producto.nombreProducto,
                precioAnteriorCaja: producto.precioCaja,
                precioNuevoCaja: precioCaja,
                precioAnteriorPieza: producto.precioPieza,
                precioNuevoPieza: precioPieza
            });
        }

        // Actualizar los campos
        producto.codigoBarras = codigoBarras || producto.codigoBarras;
        producto.nombreProducto = nombreProducto || producto.nombreProducto;
        producto.tamano = tamano || producto.tamano;
        producto.categoriaMaquillaje = categoriaMaquillaje || producto.categoriaMaquillaje;
        producto.subcategoria = subcategoria || producto.subcategoria;
        producto.marca = marca || producto.marca;
        producto.nombreProveedor = nombreProveedor || producto.nombreProveedor;
        producto.precioCaja = precioCaja || producto.precioCaja;
        producto.precioPieza = precioPieza || producto.precioPieza;
        producto.cantidadPorCaja = cantidadPorCaja || producto.cantidadPorCaja;
        producto.cantidadPiezas = cantidadPiezas || producto.cantidadPiezas;
        producto.stockExhibe = stockExhibe || producto.stockExhibe;
        producto.stockAlmacen = stockAlmacen || producto.stockAlmacen;
        producto.stockExhibeMin = stockExhibeMin || producto.stockExhibeMin;
        producto.stockAlmacenMin = stockAlmacenMin || producto.stockAlmacenMin;
        producto.imagen = imagen || producto.imagen;

        // Guardar cambios
        await producto.save();

        // Si hay historial, guardar el historial de precios
        if (historial) {
            await historial.save();
        }

        res.json({ message: "Producto actualizado", producto });
    } catch (error) {
        console.error(error);
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
        const productos = await Producto.find();  
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

exports.actualizarStockExhibe = async (req, res) => {
    try {
        const { id } = req.params;
        const { stockExhibe } = req.body;
  
        // Verificar si el producto existe
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
  
        // Verificar si stockExhibe es un número válido
        if (typeof stockExhibe !== 'number') {
            return res.status(400).json({ message: "stockExhibe debe ser un número" });
        }
  
        // Actualizar solo el stockExhibe
        console.log("Actualizando stockExhibe a:", stockExhibe);  // Verifica que el valor correcto esté llegando
        producto.stockExhibe = stockExhibe;
  
        // Guardar los cambios
        await producto.save();
  
        res.json({ message: "Stock exhibido actualizado", producto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el stock exhibido", error: error.message });
    }
  };
  