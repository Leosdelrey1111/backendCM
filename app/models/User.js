const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['empleado', 'almacenista'] },
});

// Función para comparar contraseñas
UserSchema.methods.comparePassword = async function(password) {
    return await (password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
