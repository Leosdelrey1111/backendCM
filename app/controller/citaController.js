
const mongoose = require("mongoose");
const Cita = require("../models/Citas");
const Medico = require("../models/Medico");
const Historico = require("../models/historico");

const normalizeString = (str) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// 1. Obtener todas las citas (Mejorado con paginación)
exports.obtenerCitas = async (req, res) => {
  try {
    const { pagina = 1, porPagina = 10 } = req.query;
    const citas = await Cita.find()
      .skip((pagina - 1) * porPagina)
      .limit(Number(porPagina))
      .populate('paciente', 'nombreCompleto')
      .populate('medico', 'nombre especialidad');
    
    const total = await Cita.countDocuments();
    res.json({ citas, total, paginas: Math.ceil(total / porPagina) });
  } catch (error) {
    res.status(500).json({ 
      mensaje: "Error al obtener citas",
      error: error.message 
    });
  }
};

// 2. Crear nueva cita (Sin transacciones)
exports.crearCita = async (req, res) => {
  try {
    const camposRequeridos = ['medico', 'fecha', 'hora', 'paciente', 'especialidad'];
    const faltantes = camposRequeridos.filter(campo => !req.body[campo]);
    
    if (faltantes.length > 0) {
      return res.status(400).json({
        mensaje: `Campos requeridos faltantes: ${faltantes.join(', ')}`
      });
    }

    const { medico, fecha, hora, paciente, especialidad, motivo = '', estado = 'Pendiente' } = req.body;

    // Validar IDs
    if (!mongoose.Types.ObjectId.isValid(medico) || !mongoose.Types.ObjectId.isValid(paciente)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    // Validar que la fecha y hora sean futuras
    const fechaObj = new Date(fecha);
    const [horaStr, minutosStr] = hora.split(':');
    fechaObj.setUTCHours(parseInt(horaStr), parseInt(minutosStr), 0, 0);
    
    if (fechaObj < new Date()) {
      return res.status(400).json({ mensaje: "No se pueden agendar citas en fechas pasadas" });
    }

    // Verificar disponibilidad del médico
    const medicoInfo = await Medico.findById(medico);
    if (!medicoInfo) {
      return res.status(404).json({ mensaje: "Médico no encontrado" });
    }

    // Verificar si el día seleccionado es un día laboral para el médico
    const diaSemana = fechaObj.getUTCDay();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaTexto = diasSemana[diaSemana];
    
    const diasLaborales = medicoInfo.diasLaborales.map(d => normalizeString(d));
    if (!diasLaborales.includes(normalizeString(diaTexto))) {
      return res.status(400).json({ 
        mensaje: `El médico no atiende los días ${diaTexto}` 
      });
    }

    // Verificar cantidad de citas para ese día
    const inicioDia = new Date(fechaObj);
    inicioDia.setUTCHours(0, 0, 0, 0);
    const finDia = new Date(fechaObj);
    finDia.setUTCHours(23, 59, 59, 999);

    const citasExistentes = await Cita.countDocuments({
      medico,
      fecha: { $gte: inicioDia, $lte: finDia }
    });

    if (citasExistentes >= (medicoInfo.citasPorDia || 10)) {
      return res.status(400).json({ 
        mensaje: "No hay disponibilidad para ese día" 
      });
    }

    // Verificar si ya existe una cita a la misma hora
    const citaExistenteMismaHora = await Cita.findOne({
      medico,
      fecha: { $gte: inicioDia, $lte: finDia },
      hora
    });

    if (citaExistenteMismaHora) {
      return res.status(400).json({ 
        mensaje: "Ya existe una cita agendada para esa hora" 
      });
    }

    // Crear la cita
    const cita = new Cita({
      paciente,
      medico,
      fecha: fechaObj,
      hora,
      especialidad,
      motivo,
      estado
    });

    await cita.save();

    // Crear histórico
    const historico = new Historico({
      paciente: paciente,
      medico: medico,
      especialidad: especialidad,
      fecha: fechaObj,
      hora: hora,
      estado
    });

    await historico.save();

    res.status(201).json({ mensaje: "Cita agendada con éxito", cita });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ mensaje: 'Error al crear la cita', error: error.message });
  }
};
// 5. Obtener citas filtradas
exports.obtenerCitasFiltradas = async (req, res) => {
  try {
    const filtro = {};
    
    // Obtener parámetros de la consulta
    const params = req.method === 'GET' ? req.query : req.body;
    const { especialidad, medico, fecha, hora, estado, paciente } = params;

    if (especialidad) filtro.especialidad = especialidad;
    if (medico) filtro.medico = medico;
    if (paciente) filtro.paciente = paciente;
    if (hora) filtro.hora = hora;
    if (estado) filtro.estado = estado;
    
    // Si se proporciona fecha, filtrar por el rango de ese día
    if (fecha) {
      const fechaObj = new Date(fecha);
      const inicioDia = new Date(fechaObj.setUTCHours(0, 0, 0, 0));
      const finDia = new Date(fechaObj.setUTCHours(23, 59, 59, 999));
      filtro.fecha = { $gte: inicioDia, $lte: finDia };
    }

    const citas = await Cita.find(filtro)
      .populate('paciente', 'nombreCompleto')
      .populate('medico', 'nombre especialidad');

    res.json(citas);

  } catch (error) {
    res.status(500).json({ 
      mensaje: "Error al filtrar citas",
      error: error.message 
    });
  }
};


// 6. Actualizar estado de cita
exports.actualizarEstadoCita = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id, estado } = req.params;
    const estadosPermitidos = ["Pendiente", "Confirmada", "Atendida", "Cancelada", "Completada"];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ mensaje: "Estado inválido" });
    }

    const citaActualizada = await Cita.findByIdAndUpdate(
      id,
      { estado },
      { new: true, session }
    ).populate('paciente', '_id');

    if (!citaActualizada) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    await Historico.findOneAndUpdate(
      { 
        paciente: citaActualizada.paciente._id,
        fecha: citaActualizada.fecha
      },
      { 
        estado,
        fechaActualizacion: new Date()
      },
      { session }
    );

    await session.commitTransaction();
    res.json(citaActualizada);

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      mensaje: "Error al actualizar estado",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// Editar cita
// Modificar el método editarCita para devolver el objeto actualizado
exports.editarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const citaActualizada = await Cita.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    ).populate('medico', 'nombre especialidad');

    if (!citaActualizada) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    res.json(citaActualizada);
    
  } catch (error) {
    res.status(500).json({ 
      mensaje: "Error al actualizar cita",
      error: error.message 
    });
  }
};
// 7. Eliminar cita
exports.eliminarCita = async (req, res) => {
  const { id } = req.params;

  try {
    const citaEliminada = await Cita.findByIdAndDelete(id);

    if (!citaEliminada) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    // También eliminar el registro en Historico
    await Historico.findOneAndDelete({ 
      paciente: citaEliminada.paciente, 
      fecha: citaEliminada.fecha 
    });

    res.status(200).json({ 
      mensaje: "Cita eliminada con éxito", 
      cita: citaEliminada 
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar cita",
      error: error.message
    });
  }
};

// Obtener citas por usuario
// controllers/citaController.js
exports.obtenerCitasPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      return res.status(400).json({ mensaje: "ID de usuario inválido" });
    }

    const citas = await Cita.find({ paciente: usuarioId })
      .populate('medico', 'nombre especialidad')
      .lean();

    res.json(citas);
    
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener citas",
      error: error.message
    });
  }
};
// Obtener médicos
exports.getMedicos = async (req, res) => {
  try {
    const medicos = await Medico.find().select('nombre especialidad');
    res.json(medicos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener especialidades
exports.getEspecialidades = async (req, res) => {
  try {
    const especialidades = await Medico.distinct('especialidad');
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};