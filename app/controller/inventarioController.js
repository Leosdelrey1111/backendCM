const Inventario = require('../models/Inventario');
const Producto = require('../models/Producto');
const mongoose = require('mongoose');

// Obtener el inventario y agregar los detalles de los productos
exports.getInventario = async (req, res) => {
    try {
        const inventario = await Inventario.find();

        if (inventario.length === 0) {
            return res.status(404).json({ message: "No se encontraron productos en el inventario" });
        }

        const inventarioConProductos = await Promise.all(inventario.map(async (item) => {
            const producto = await Producto.findOne({ nombreProducto: item.nombreProducto });
            if (producto) {
                item.nombreProducto = producto.nombreProducto;
                item.stockExhibe = producto.stockExhibe;
            }
            return item;
        }));

        res.json(inventarioConProductos);
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

exports.updateStockExhibe = async (req, res) => {
    const { id } = req.params;
    const { stockExhibe } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID no válido' });
    }
  
    try {
      const inventario = await Inventario.findById(id);
      if (!inventario) {
        return res.status(404).json({ message: 'Producto no encontrado en el inventario' });
      }
  
      inventario.stockExhibe = stockExhibe;
      await inventario.save();
  
      res.json({ message: 'Stock Exhibición actualizado', inventario });
    } catch (error) {
      console.error('Error al actualizar stockExhibe:', error);
      res.status(500).json({ message: 'Error al actualizar stockExhibe', error });
    }
  };
  
  

// Actualizar inventario completo
exports.actualizarInventario = async (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID no válido' });
    }
  
    try {
      const inventario = await Inventario.findById(id);
      if (!inventario) {
        return res.status(404).json({ message: 'Inventario no encontrado' });
      }
  
      Object.assign(inventario, datosActualizados); // Actualizar los datos del inventario
      await inventario.save();
  
      res.json({ message: 'Inventario actualizado', inventario });
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      res.status(500).json({ message: 'Error al actualizar inventario', error });
    }
  };


exports.eliminarInventario = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID no válido' });
    }
  
    try {
      const inventario = await Inventario.findByIdAndDelete(id);
      if (!inventario) {
        return res.status(404).json({ message: 'Inventario no encontrado' });
      }
  
      res.json({ message: 'Inventario eliminado', inventario });
    } catch (error) {
      console.error('Error al eliminar inventario:', error);
      res.status(500).json({ message: 'Error al eliminar inventario', error });
    }
  };
  
  
  