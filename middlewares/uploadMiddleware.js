const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');  // La carpeta donde se almacenarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Establecer el nombre del archivo
  }
});

// Filtrar para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // Aceptar imagen
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);  // Rechazar si no es imagen
  }
};

// Middleware Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limitar el tamaño del archivo a 5MB
  fileFilter: fileFilter
}).single('product-image');  // Solo un archivo, el campo de imagen es 'product-image'

module.exports = upload;
