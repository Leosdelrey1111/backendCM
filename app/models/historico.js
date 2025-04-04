const mongoose = require("mongoose");

const HistoricoSchema = new mongoose.Schema({
  paciente: { 
    type: mongoose.Schema.Types.ObjectId,  // Debe ser ObjectId
    ref: 'Usuario',  // Referencia al modelo de usuarios
    required: true 
  },
  medico: { 
    type: mongoose.Schema.Types.ObjectId,  // ObjectId para referencia
    ref: 'Medico', 
    required: true 
  },
  especialidad: { 
    type: String, 
    required: true 
  },
  fecha: { 
    type: Date,  // Usar tipo Date para fechas
    required: true 
  },
  hora: { 
    type: String, 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ["Pendiente", "Confirmada", "Atendida", "Cancelada"], // Estados actualizados
    default: "Pendiente" 
  },
  motivo: { 
    type: String, 
    required: false 
  },
  observacionesMedicas: { 
    type: String, 
    default: "" 
  },
  fechaActualizacion: { 
    type: Date,  // Tipo Date para timestamp
    default: Date.now 
  }
});

module.exports = mongoose.model("Historico", HistoricoSchema);