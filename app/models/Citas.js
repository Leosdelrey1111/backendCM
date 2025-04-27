const mongoose = require("mongoose");

const CitaSchema = new mongoose.Schema({
    paciente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    medico: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Medico', 
        required: true 
    },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    especialidad: { type: String, required: true },
    motivo: String,
    estado: { 
        type: String, 
        enum: ["Pendiente", "Confirmada", "Atendida", "Cancelada", "No atendida"], 
        default: "Pendiente" 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});

    CitaSchema.virtual('pacienteInfo', {
        ref: 'Usuario',
        localField: 'paciente',
        foreignField: '_id',
        justOne: true
    });

    CitaSchema.virtual('medicoInfo', {
        ref: 'Medico',
        localField: 'medico',
        foreignField: '_id',
        justOne: true
    });



module.exports = mongoose.model("Cita", CitaSchema);