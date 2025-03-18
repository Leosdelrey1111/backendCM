const express = require('express');
const router = express.Router();
const { getProveedores, createProveedor, getProveedorById, deleteProveedor, updateProveedor } = require('../controller/proveedorController');

// Rutas para manejar proveedores
router.get('/', getProveedores); // Obtener todos los proveedores
router.post('/', createProveedor); // Crear un nuevo proveedor
router.get('/:id', getProveedorById); // Obtener un proveedor por ID
router.put('/:id', updateProveedor); // Actualizar un proveedor por ID
router.delete('/:id', deleteProveedor); // Eliminar un proveedor por ID

module.exports = router;
