const express = require('express');
const router = express.Router();
const { getInventario, createInventario, updateStockExhibe } = require('../controller/inventarioController');

// Ruta para obtener inventario
router.get('/', getInventario);

// Ruta para crear inventario
router.post('/', createInventario);

// Ruta para actualizar stockExhibe
router.put('/:id', updateStockExhibe);

module.exports = router;
