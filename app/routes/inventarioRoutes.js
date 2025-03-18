const express = require('express');
const router = express.Router();
const { getInventario, createInventario, updateStockExhibe, actualizarInventario, eliminarInventario } = require('../controller/inventarioController');

// Ruta para obtener inventario
router.get('/', getInventario);

// Ruta para crear inventario
router.post('/', createInventario);

// Actualizar stockExhibe
router.put('/:id', updateStockExhibe);


router.put('/actualizar/:id', actualizarInventario);

// Eliminar inventario
router.delete('/:id', eliminarInventario);



module.exports = router;
