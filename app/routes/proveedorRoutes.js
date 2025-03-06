const express = require('express');
const router = express.Router();
const { getProveedores, createProveedor, getProveedorById, deleteProveedor } = require('../controller/proveedorController');

router.get('/', getProveedores);
router.post('/', createProveedor);
router.get('/:id', getProveedorById);
router.delete('/:id', deleteProveedor);

module.exports = router;
