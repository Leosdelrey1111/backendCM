const cron = require('node-cron');
const Cita = require('../models/Citas'); // Asegúrate de tener este modelo en tu proyecto
const Historico = require('../models/historico'); // Asegúrate de tener este modelo en tu proyecto

// Todos los días a medianoche
cron.schedule('0 0 * * *', async () => {
  const hoy = new Date();
  
  try {
    // 1. Cancelar citas pendientes no confirmadas del pasado
    await Cita.updateMany(
      {
        estado: "Pendiente",
        fecha: { $lt: hoy }
      },
      { estado: "Cancelada" }
    );
    
    // 2. Marcar citas confirmadas no atendidas
    const citasVencidas = await Cita.find({
      estado: "Confirmada",
      fecha: { $lt: hoy }
    });
    
    for (const cita of citasVencidas) {
      // Actualizamos el estado en el histórico
      await Historico.findOneAndUpdate(
        { cita: cita._id },
        { estado: "No atendida" },
        { new: true }
      );
    }
    
    // Actualizamos las citas vencidas
    await Cita.updateMany(
      {
        estado: "Confirmada",
        fecha: { $lt: hoy }
      },
      { estado: "No atendida" }
    );
    
    console.log('Estados de citas actualizados automáticamente');
  } catch (error) {
    console.error('Error al actualizar estados de citas:', error);
  }
});
