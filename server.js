const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// Inicializar app
const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Importar rutas
const proveedorRoutes = require('./app/routes/proveedorRoutes');
const productoRoutes = require('./app/routes/productoRoutes');
const inventarioRoutes = require('./app/routes/inventarioRoutes');
const historialRoutes = require('./app/routes/historialRoutes');
const authRoutes = require('./app/routes/authRoutes');

// Definir rutas
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send({ data: 'Hola profe Torres 🚀' });
});

// Servidor en puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
