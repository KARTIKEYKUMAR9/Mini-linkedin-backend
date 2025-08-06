const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  bio: { type: String, default: '' }, // 🆕 Add bio
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);