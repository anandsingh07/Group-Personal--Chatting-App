const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // received
sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]    // sent
  // 6-digit ID
});

module.exports = mongoose.model('User', userSchema);