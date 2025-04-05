const Especialidad = require("../models/Especialidad");

exports.obtenerEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.find();
    res.json(especialidades); // Se devuelve la lista de especialidades
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener especialidades');
  }
};
