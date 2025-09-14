const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();


const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

router.get('/search/:id', authMiddleware, async (req, res) => {
  const user = await User.findOne({ userId: req.params.id }).select('username userId _id');
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
});


router.post('/send-request', authMiddleware, async (req, res) => {
  const { targetId } = req.body;
  const from = await User.findById(req.userId);
  const to = await User.findById(targetId);

  if (!to || to._id.equals(from._id)) return res.status(400).json({ msg: 'Invalid target' });

  if (
    from.friends.includes(to._id) ||
    from.sentRequests.includes(to._id) ||
    to.friendRequests.includes(from._id)
  ) return res.status(400).json({ msg: 'Already connected or pending' });

  from.sentRequests.push(to._id);
  to.friendRequests.push(from._id);

  await from.save();
  await to.save();
  res.json({ msg: 'Request sent' });
});

router.post('/accept-request', authMiddleware, async (req, res) => {
  const { fromId } = req.body;
  const currentUser = await User.findById(req.userId);
  const fromUser = await User.findById(fromId);

  if (!currentUser.friendRequests.includes(fromUser._id)) {
    return res.status(400).json({ msg: 'No such request' });
  }

  currentUser.friendRequests = currentUser.friendRequests.filter(id => !id.equals(fromUser._id));
  currentUser.friends.push(fromUser._id);

  fromUser.sentRequests = fromUser.sentRequests.filter(id => !id.equals(currentUser._id));
  fromUser.friends.push(currentUser._id);

  await currentUser.save();
  await fromUser.save();

  res.json({ msg: 'Friend added' });
});
router.get('/friends', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId)
    .populate('friends', 'username userId')
    .populate('friendRequests', 'username userId')
    .populate('sentRequests', 'username userId');

  res.json({
    friends: user.friends,
    received: user.friendRequests,
    sent: user.sentRequests
  });
});

module.exports = router;
