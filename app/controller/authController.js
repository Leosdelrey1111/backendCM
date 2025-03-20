const User = require('../models/User'); // Asegúrate de que la ruta sea correcta

exports.login = async (req, res) => {
    console.log("🔹 Datos recibidos en el backend:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        console.log("⚠️ Falta email o password");
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    try {
        const user = await User.findOne({ email });
        console.log("🔹 Usuario encontrado:", user);

        if (!user) {
            console.log("⚠️ Usuario no encontrado en la base de datos.");
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        if (!user.password) {
            console.log("⚠️ El usuario no tiene contraseña almacenada.");
            return res.status(400).json({ message: 'Error en la base de datos: contraseña no definida' });
        }

        const isMatch = await user.comparePassword(password);
        console.log("🔹 ¿Contraseña correcta?", isMatch);

        if (!isMatch) {
            console.log("⚠️ Contraseña incorrecta.");
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: { email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("🚨 Error en el servidor:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.register = async (req, res) => {
  console.log("🔹 Datos recibidos para registro:", req.body);

  const { email, password, role } = req.body;

  if (!email || !password || !role) {
      console.log("⚠️ Faltan datos para el registro.");
      return res.status(400).json({ message: 'Email, contraseña y rol son obligatorios.' });
  }

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          console.log("⚠️ Usuario ya registrado.");
          return res.status(400).json({ message: 'El usuario ya está registrado.' });
      }

      const newUser = new User({ email, password, role });
      await newUser.save();

      console.log("✅ Usuario registrado con éxito:", newUser.email);
      res.status(201).json({ message: 'Usuario registrado con éxito', user: { email: newUser.email, role: newUser.role } });

  } catch (error) {
      console.error("🚨 Error en el servidor:", error);
      res.status(500).json({ message: 'Error en el servidor' });
  }
};
