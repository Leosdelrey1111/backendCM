const mongoose = require("mongoose");
const Cita = require("../models/Citas");
const Medico = require("../models/Medico");
const Historico = require("../models/historico");
const Usuario = require("../models/Usuario");

const normalizeString = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// 1. Obtener todas las citas (paginado)
exports.obtenerCitas = async (req, res) => {
  try {
    const { pagina = 1, porPagina = 10 } = req.query;
    const citas = await Cita.find()
      .skip((pagina - 1) * porPagina)
      .limit(Number(porPagina))
      .populate("paciente", "nombreCompleto")
      .populate("medico", "nombre especialidad");

    const total = await Cita.countDocuments();
    res.json({ citas, total, paginas: Math.ceil(total / porPagina) });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener citas",
      error: error.message,
    });
  }
};

// 2. Crear nueva cita (sin transacciones)
exports.crearCita = async (req, res) => {
  try {
    // 1) Validación de campos y ObjectId
    const campos = ["medico", "fecha", "hora", "paciente", "especialidad"];
    const faltantes = campos.filter((c) => !req.body[c]);
    if (faltantes.length) {
      return res
        .status(400)
        .json({ mensaje: `Faltan: ${faltantes.join(", ")}` });
    }
    const { medico, fecha, hora, paciente, especialidad, motivo = "" } =
      req.body;
      if (
        !mongoose.Types.ObjectId.isValid(medico) ||
        !mongoose.Types.ObjectId.isValid(paciente)
      ) {
        return res.status(400).json({ mensaje: "ID inválido" });
      }
      
    // 2) Parsear fecha+hora en local para evitar desfases UTC
    const [year, month, day] = fecha.split("-").map((n) => parseInt(n, 10));
    const [hour, minute] = hora.split(":").map((n) => parseInt(n, 10));
    const fechaHora = new Date(year, month - 1, day, hour, minute, 0, 0);

    if (fechaHora < new Date()) {
      return res
        .status(400)
        .json({ mensaje: "La cita debe ser en el futuro." });
    }

    // 3) Cargar médico y validar día laboral
    const medicoInfo = await Medico.findById(medico);
    if (!medicoInfo)
      return res.status(404).json({ mensaje: "Médico no encontrado" });

    const diaTextoArr = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    const diaTexto = diaTextoArr[fechaHora.getDay()];
    if (
      !medicoInfo.diasLaborales
        .map(normalizeString)
        .includes(normalizeString(diaTexto))
    ) {
      return res
        .status(400)
        .json({ mensaje: `El médico no atiende los ${diaTexto}.` });
    }

    // 4) Validar rango de horario
    const [iniH, iniM] = medicoInfo.horario.inicio.split(":").map((n) => +n);
    const [finH, finM] = medicoInfo.horario.fin.split(":").map((n) => +n);
    const turnoIni = new Date(fechaHora);
    turnoIni.setHours(iniH, iniM, 0, 0);
    const turnoFin = new Date(fechaHora);
    turnoFin.setHours(finH, finM, 0, 0);

    if (fechaHora < turnoIni || fechaHora >= turnoFin) {
      return res.status(400).json({
        mensaje: `Fuera de horario. Disponible de ${medicoInfo.horario.inicio} a ${medicoInfo.horario.fin}.`,
      });
    }

    // 5) Límite diario de citas
    const inicioDia = new Date(fechaHora);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fechaHora);
    finDia.setHours(23, 59, 59, 999);
    const cnt = await Cita.countDocuments({
      medico,
      fecha: { $gte: inicioDia, $lte: finDia },
    });
    if (cnt >= (medicoInfo.citasPorDia || 0)) {
      return res
        .status(400)
        .json({ mensaje: "Día completo, sin más citas disponibles." });
    }

    // 6) Conflicto exacto de hora
    const ya = await Cita.findOne({
      medico,
      fecha: { $gte: inicioDia, $lte: finDia },
      hora,
      estado: { $ne: "Cancelada" } // <- Agregar esta línea
    });
    if (ya) {
      return res.status(400).json({ mensaje: "Ese horario ya está ocupado." });
    }

    // 7) Crear cita e histórico
    const cita = await Cita.create({
      paciente,
      medico,
      fecha: fechaHora,
      hora,
      especialidad,
      motivo,
      estado: "Pendiente",
    });
    await Historico.create({
      paciente,
      medico,
      especialidad,
      fecha: fechaHora,
      hora,
      motivo,
      estado: "Pendiente",
    });

    res.status(201).json({ mensaje: "Cita agendada con éxito", cita });
  } catch (error) {
    console.error("Error al crear la cita:", error);
    res
      .status(500)
      .json({ mensaje: "Error al crear la cita", error: error.message });
  }
};

// 5. Obtener citas filtradas
exports.obtenerCitasFiltradas = async (req, res) => {
  try {
    const filtro = {};
    const params = req.method === "GET" ? req.query : req.body;
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
      .populate("paciente", "nombreCompleto")
      .populate("medico", "nombre especialidad");

    res.json(citas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al filtrar citas",
      error: error.message,
    });
  }
};

// 6. Actualizar estado
exports.actualizarEstadoCita = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const cita = await Cita.findByIdAndUpdate(id, { estado }, { new: true });
    if (!cita) return res.status(404).send("Cita no encontrada");
    res.json(cita);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar el estado");
  }
};

// 7. Editar cita
// 7. Editar cita
exports.editarCita = async (req, res) => {
  const { id } = req.params;
  const { fecha, hora, medico, especialidad, paciente, motivo = "" } = req.body;

  try {
    // Validar campos
    const campos = ["medico", "fecha", "hora", "paciente", "especialidad"];
    const faltantes = campos.filter((c) => !req.body[c]);
    if (faltantes.length) {
      return res
        .status(400)
        .json({ mensaje: `Faltan: ${faltantes.join(", ")}` });
    }

    if (
      !mongoose.Types.ObjectId.isValid(medico) ||
      !mongoose.Types.ObjectId.isValid(paciente)
    ) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    // Parsear fecha y hora correctamente
    const [year, month, day] = fecha.split("-").map((n) => parseInt(n, 10));
    const [hour, minute] = hora.split(":").map((n) => parseInt(n, 10));
    const fechaHora = new Date(year, month - 1, day, hour, minute, 0, 0);

    if (fechaHora < new Date()) {
      return res.status(400).json({ mensaje: "La cita debe ser en el futuro." });
    }

    // Validar médico
    const medicoInfo = await Medico.findById(medico);
    if (!medicoInfo)
      return res.status(404).json({ mensaje: "Médico no encontrado" });

    const diaTextoArr = [
      "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
    ];
    const diaTexto = diaTextoArr[fechaHora.getDay()];
    if (!medicoInfo.diasLaborales.map(normalizeString).includes(normalizeString(diaTexto))) {
      return res.status(400).json({ mensaje: `El médico no atiende los ${diaTexto}.` });
    }

    // Validar horario del médico
    const [iniH, iniM] = medicoInfo.horario.inicio.split(":").map((n) => +n);
    const [finH, finM] = medicoInfo.horario.fin.split(":").map((n) => +n);
    const turnoIni = new Date(fechaHora);
    turnoIni.setHours(iniH, iniM, 0, 0);
    const turnoFin = new Date(fechaHora);
    turnoFin.setHours(finH, finM, 0, 0);

    if (fechaHora < turnoIni || fechaHora >= turnoFin) {
      return res.status(400).json({
        mensaje: `Fuera de horario. Disponible de ${medicoInfo.horario.inicio} a ${medicoInfo.horario.fin}.`
      });
    }

    // Validar conflicto exacto de hora (sin contar esta misma cita)
    const inicioDia = new Date(fechaHora);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fechaHora);
    finDia.setHours(23, 59, 59, 999);

    const ya = await Cita.findOne({
      _id: { $ne: id }, // No contarme a mí mismo
      medico,
      fecha: { $gte: inicioDia, $lte: finDia },
      hora,
      estado: { $ne: "Cancelada" } // <- Agregar esta línea
    });
    if (ya) {
      return res.status(400).json({ mensaje: "Ese horario ya está ocupado." });
    }

    // Actualizar cita
    const cita = await Cita.findByIdAndUpdate(id, {
      paciente,
      medico,
      fecha: fechaHora,
      hora,
      especialidad,
      motivo,
    }, { new: true });

    if (!cita) return res.status(404).send("Cita no encontrada");

    res.json({ mensaje: "Cita actualizada correctamente", cita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al editar la cita", error: error.message });
  }
};



// 8. Eliminar cita
// exports.eliminarCita = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const citaEliminada = await Cita.findByIdAndDelete(id);
//     if (!citaEliminada)
//       return res.status(404).json({ mensaje: "Cita no encontrada" });
//     await Historico.findOneAndDelete({
//       paciente: citaEliminada.paciente,
//       fecha: citaEliminada.fecha,
//     });
//     res.json({ mensaje: "Cita eliminada con éxito", cita: citaEliminada });
//   } catch (error) {
//     res.status(500).json({ mensaje: "Error al eliminar cita", error });
//   }
// };

// 8. Cancelar cita (en lugar de eliminar)
exports.cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cita = await Cita.findByIdAndUpdate(
      id,
      { estado: "Cancelada" },
      { new: true }
    );
    
    if (!cita) return res.status(404).json({ mensaje: "Cita no encontrada" });
    
    // Actualizar histórico
    await Historico.findOneAndUpdate(
      { cita: id },
      { estado: "Cancelada" },
      { new: true }
    );
    
    res.json({ mensaje: "Cita cancelada con éxito", cita });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cancelar cita", error });
  }
};
// 9. Otras consultas...

exports.obtenerCitasPorMedico = async (req, res) => { /* ... */ };
exports.obtenerCitasPorMedicoAceptada = async (req, res) => { /* ... */ };
exports.obtenerCitasPorUsuario = async (req, res) => { /* ... */ };
exports.getMedicos = async (req, res) => { /* ... */ };
exports.getEspecialidades = async (req, res) => { /* ... */ };

// 10. Disponibilidad de un médico
exports.obtenerDisponibilidad = async (req, res) => {
  try {
    const { medicoId } = req.params;
    const { startDate, endDate, slotDuration = 60 } = req.query;
    if (!mongoose.Types.ObjectId.isValid(medicoId)) {
      return res.status(400).json({ mensaje: "ID de médico inválido" });
    }
    const medicoInfo = await Medico.findById(medicoId);
    if (!medicoInfo)
      return res.status(404).json({ mensaje: "Médico no encontrado" });

    const hoy = new Date();
    const inicio = startDate ? new Date(startDate) : hoy;
    const fin = endDate 
      ? new Date(endDate)
      : new Date(hoy.getFullYear(), hoy.getMonth() + 3, 0); // 3 meses hacia adelante

    const disponibilidad = [];
    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      const diaTextoArr = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ];
      const diaTexto = diaTextoArr[d.getDay()];

      if (
        !medicoInfo.diasLaborales
          .map(normalizeString)
          .includes(normalizeString(diaTexto))
      )
        continue;

      const inicioDia = new Date(d);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(d);
      finDia.setHours(23, 59, 59, 999);

      const cnt = await Cita.countDocuments({
        medico: medicoId,
        fecha: { $gte: inicioDia, $lte: finDia },
      });
      if (cnt >= medicoInfo.citasPorDia) continue;

    // En exports.obtenerDisponibilidad, modificar la consulta:
    const citasDia = await Cita.find({
      medico: medicoId,
      fecha: { $gte: inicioDia, $lte: finDia },
      estado: { $nin: ["Cancelada", "No atendida"] } // Ignorar estas citas
    });

      const [hIni, mIni] = medicoInfo.horario.inicio.split(":").map((n) => +n);
      const [hFin, mFin] = medicoInfo.horario.fin.split(":").map((n) => +n);

      const slots = [];
      const t = new Date(d);
      t.setHours(hIni, mIni, 0, 0);
      const finTurno = new Date(d);
      finTurno.setHours(hFin, mFin, 0, 0);

      while (t < finTurno) {
        const hh = t.getHours().toString().padStart(2, "0");
        const mm = t.getMinutes().toString().padStart(2, "0");
        const label = `${hh}:${mm}`;
        if (!citasDia.some((c) => c.hora === label)) slots.push(label);
        t.setMinutes(t.getMinutes() + parseInt(slotDuration, 10));
      }

      if (slots.length) {
        disponibilidad.push({
          fecha: inicioDia.toISOString().slice(0, 10),
          dia: diaTexto,
          slots,
        });
      }
    }

    res.json({ disponibilidad });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al obtener disponibilidad",
      error: error.message,
    });
  }
};

exports.obtenerCitasPorUsuario = async (req, res) => {
  const usuarioId = req.params.usuarioId;

  try {
    const citas = await Cita.find({ paciente: usuarioId })
      .populate('pacienteInfo', 'nombreCompleto')
      .populate('medicoInfo', 'nombre')

    if (!citas || citas.length === 0) {
      return res.status(404).json({ message: "No se encontraron citas." });
    }

    return res.status(200).json(citas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener citas." });
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
    const citas = await Cita.find({ medico: medicoObjectId,estado: 'Pendiente' }).lean();

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



exports.obtenerCitasPorMedicoAceptada = async (req, res) => {
  const medicoId = req.params.medicoId;

  try {
    console.log("ID del médico recibido:", medicoId);

    if (!mongoose.Types.ObjectId.isValid(medicoId)) {
      return res.status(400).json({ mensaje: 'ID de médico no válido' });
    }

    const medicoObjectId = new mongoose.Types.ObjectId(medicoId);
    
    const citas = await Cita.find({ 
      medico: medicoObjectId,
      estado: { $in: ['Confirmada', 'Atendida'] }
    }).lean();

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


// Obtener citas por usuario
// controllers/citaController.js
// exports.obtenerCitasPorUsuario = async (req, res) => {
//   try {
//     const usuarioId = req.params.usuarioId;
    
//     if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
//       return res.status(400).json({ mensaje: "ID de usuario inválido" });
//     }

//     const citas = await Cita.find({ paciente: usuarioId })
//       .populate('medico', 'nombre especialidad')
//       .lean();

//     res.json(citas);
    
//   } catch (error) {
//     res.status(500).json({
//       mensaje: "Error al obtener citas",
//       error: error.message
//     });
//   }
// };
// Obtener médicos
exports.getMedicos = async (req, res) => {
  try {
    const medicos = await Medico.find().select('nombre especialidad');
    res.json(medicos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



