const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");

exports.registrarUsuario = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();

    res.json({ mensaje: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error });
  }
};

// exports.iniciarSesion = async (req, res) => {
//   try {
//     const { correo, contraseña } = req.body;

//     // Verificar si el usuario existe
//     const usuario = await Usuario.findOne({ correo });
//     if (!usuario) {
//       return res.status(400).json({ mensaje: "Credenciales incorrectas" });
//     }

//     // Comparar contraseñas
//     const esCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);
//     if (!esCorrecta) {
//       return res.status(400).json({ mensaje: "Credenciales incorrectas" });
//     }

//     // Responder con los datos del usuario (sin JWT)
//     res.json({ usuario });
//   } catch (error) {
//     res.status(500).json({ mensaje: "Error al iniciar sesión", error });
//   }
// };

exports.iniciarSesion = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ mensaje: "Credenciales incorrectas" });
    }

    // Comparar contraseñas (sin bcrypt, comparación directa)
    if (contraseña !== usuario.contraseña) {
      return res.status(400).json({ mensaje: "Credenciales incorrectas" });
    }

    // Responder con los datos del usuario (sin JWT)
    res.json({
      usuario: {
        _id: usuario._id,
        correo: usuario.correo,
        rol: usuario.rol
  }});
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión", error });
  }
};


exports.obtenerUsuarios = async (req, res) => {
  try {
    // Obtener todos los usuarios, excluyendo la contraseña
    const usuarios = await Usuario.find({}, { contraseña: 0 }); // No devolver la contraseña

    if (!usuarios) {
      return res.status(404).json({ mensaje: "No se encontraron usuarios" });
    }

    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error });
  }
};
