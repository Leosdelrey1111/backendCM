const express = require('express');
const router = express.Router();
const { getHistorial, createHistorial } = require('../controller/historialController');

router.get('/', getHistorial);
router.post('/', createHistorial);

module.exports = router;
