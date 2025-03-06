const express = require('express');
const router = express.Router();
const { getProductos, registrarProducto, editarProducto, eliminarProducto, actualizarStockExhibe, actualizarStockAlmacen } = require('../controller/productoController');


// Obtener todos los productos con filtros
router.get('/', getProductos);

// Registrar un producto
router.post('/', registrarProducto);

// Editar un producto por ID
router.put('/:id', editarProducto);

// Eliminar un producto por ID
router.delete('/:id', eliminarProducto);

// Actualizar stock en exhibición
router.put('/stockExhibe/:id', actualizarStockExhibe);

// Actualizar stock en almacén
router.put('/stockAlmacen/:id', actualizarStockAlmacen);

module.exports = router;
