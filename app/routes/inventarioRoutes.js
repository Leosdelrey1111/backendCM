const express = require('express');
const router = express.Router();
const { getInventario, createInventario } = require('../controller/inventarioController');

router.get('/', getInventario);
router.post('/', createInventario);

module.exports = router;
