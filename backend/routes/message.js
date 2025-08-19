const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // ✅ FIXED
const Message = require('../models/Message');
const { decrypt } = require('../utils/encryption');
const authMiddleware = require('../middleware/auth');

// ✅ GROUP CHAT HISTORY
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const groupObjectId = new mongoose.Types.ObjectId(req.params.groupId); // ✅ Cast groupId to ObjectId
    const messages = await Message.find({ group: groupObjectId })
      .sort('createdAt')
      .populate('sender', 'username');

    const formatted = messages.map((msg) => ({
      ...msg.toObject(),
      content: decrypt(msg.content),
      username: msg.sender?.username || 'Unknown',
    }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Failed to load group messages:', err.message);
    res.status(500).json({ msg: 'Failed to load group messages' });
  }
});

// ✅ PERSONAL CHAT HISTORY
router.get('/personal/:friendId', authMiddleware, async (req, res) => {
  const myId = req.userId;
  const friendId = req.params.friendId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: myId, to: friendId },
        { sender: friendId, to: myId },
      ],
    }).sort({ createdAt: 1 }).populate('sender', 'username');

    const formatted = messages.map((msg) => ({
      ...msg.toObject(),
      content: decrypt(msg.content),
      username: msg.sender?.username || 'Unknown',
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to load personal messages' });
  }
});
 // ✅ CLEAR CHAT (group or personal)
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const { isGroup, roomId, receiverId } = req.body;

    if (isGroup) {
      await Message.deleteMany({ group: roomId });
    } else {
      await Message.deleteMany({
        $or: [
          { sender: req.userId, to: receiverId },
          { sender: receiverId, to: req.userId },
        ],
      });
    }

    res.json({ success: true, message: 'Chat cleared successfully' });
  } catch (err) {
    console.error('❌ Failed to clear chat:', err.message);
    res.status(500).json({ msg: 'Failed to clear chat' });
  }
});

module.exports = router;
