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
const authRoutes = require('./app/routes/authRoutes');
const citasRoutes = require('./app/routes/citas');
const historicoRoutes = require('./app/routes/historico');
const medicosRoutes = require('./app/routes/medicos');
const especialidadesRoutes = require('./app/routes/especialidades');

// Definir rutas
app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/especialidades', especialidadesRoutes);

app.get('/', (req, res) => {
    res.send({ data: 'Hola profe Torres 🚀' });
});

// Servidor en puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
