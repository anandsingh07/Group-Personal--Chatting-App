const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  passcode: { type: String, required: true },
  image: { type: String, required: true },
  groupMembers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      nickname: { type: String, required: true },
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Group', groupSchema);
