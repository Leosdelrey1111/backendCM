const mongoose = require("mongoose");
const Cita = require("../models/Citas");
const Medico = require("../models/Medico");
const Historico = require("../models/historico");
const Usuario = require("../models/Usuario");

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

// 2. Crear nueva cita (Transaccional con validación mejorada)
exports.crearCita = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    await cita.save({ session });

    // Crear histórico
    const historico = new Historico({
      paciente: paciente,
      medico: medico,
      especialidad: especialidad,
      fecha: fechaObj,
      hora: hora,
      estado: estado,
      motivo: motivo
    });

    await historico.save({ session });

    await session.commitTransaction();
    res.status(201).json({ mensaje: "Cita creada con éxito", cita });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      mensaje: "Error al crear la cita",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// 5. Obtener citas filtradas
exports.obtenerCitasFiltradas = async (req, res) => {
  try {
    const filtro = {};
    
    // Compatibilidad con método GET o POST
    const params = req.method === 'GET' ? req.query : req.body;
    const { especialidad, medico, fecha, hora, estado, paciente } = params;

    if (especialidad) filtro.especialidad = especialidad;
    if (medico) filtro.medico = medico;
    if (paciente) filtro.paciente = paciente;
    if (hora) filtro.hora = hora;
    if (estado) filtro.estado = estado;
    
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

exports.actualizarEstadoCita = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const cita = await Cita.findByIdAndUpdate(id, { estado }, { new: true });

    if (!cita) {
      return res.status(404).send('Cita no encontrada');
    }

    return res.status(200).json(cita);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error al actualizar el estado');
  }
};


// Editar cita
exports.editarCita = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Datos para editar cita:", req.body);
    const { id } = req.params;
    const actualizacion = req.body;

    const citaActualizada = await Cita.findByIdAndUpdate(
      id,
      actualizacion,
      { new: true, session }
    ).populate('paciente medico');

    if (!citaActualizada) {
      return res.status(404).json({ mensaje: "Cita no encontrada" });
    }

    // Actualizar histórico
    await Historico.findOneAndUpdate(
      { 
        paciente: citaActualizada.paciente._id,
        fecha: citaActualizada.fecha
      },
      {
        motivo: citaActualizada.motivo,
        fechaActualizacion: new Date(),
        estado: citaActualizada.estado
      },
      { session }
    );

    await session.commitTransaction();
    res.json(citaActualizada);

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      mensaje: "Error al actualizar cita",
      error: error.message 
    });
  } finally {
    session.endSession();
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
exports.obtenerCitasPorMedico = async (req, res) => {
  const medicoId = req.params.medicoId;

  try {
    console.log("ID del médico recibido:", medicoId);

    if (!mongoose.Types.ObjectId.isValid(medicoId)) {
      return res.status(400).json({ mensaje: 'ID de médico no válido' });
    }

    const medicoObjectId = new mongoose.Types.ObjectId(medicoId);
    
    // Obtener todas las citas para un médico
    const citas = await Cita.find({ medico: medicoObjectId }).lean();

    if (!citas || citas.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron citas para este médico' });
    }

    // Obtener los nombres completos de los pacientes basados en el ObjectId
    for (let cita of citas) {
      const _id = cita.paciente; // Obtener el ID del paciente
      if (_id) {
        // Buscar el nombre del paciente en la colección de usuarios
        const paciente = await Usuario.findById(_id).select('nombreCompleto');
        
        // Verificar qué está devolviendo la consulta
        console.log("Paciente encontrado:", paciente);
        
        if (paciente) {
          cita.pacienteNombre = paciente.nombreCompleto; // Añadir el nombre completo al objeto cita
        }
      }
    }

    // Retornar las citas con el nombre completo del paciente
    res.status(200).json({ citas });

  } catch (error) {
    console.error('Error al buscar citas:', error);
    res.status(500).json({ mensaje: 'Error interno al buscar citas', error: error.message });
  }
};
