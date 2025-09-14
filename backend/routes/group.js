const express = require('express');
const Group = require('../models/Group');
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


router.post('/create', authMiddleware, async (req, res) => {
  const { name, passcode, image } = req.body;

  try {
    const group = new Group({
      name,
      passcode,
      image,
      createdBy: req.userId,
      groupMembers: [],
    });

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Group creation failed' });
  }
});


router.get('/', async (req, res) => {
  const groups = await Group.find({}, 'name image');
  res.json(groups);
});


router.post('/join', authMiddleware, async (req, res) => {
  const { groupId, passcode, nickname } = req.body;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ msg: 'Group not found' });
  if (group.passcode !== passcode) return res.status(400).json({ msg: 'Wrong passcode' });

  const existingMember = group.groupMembers.find(m => m.user.toString() === req.userId);

  if (existingMember) {
    if (existingMember.nickname !== nickname) {
      existingMember.nickname = nickname;
      await group.save();
    }
    return res.json({ msg: 'Already joined. Nickname updated if changed.' });
  }

  group.groupMembers.push({ user: req.userId, nickname });
  await group.save();

  res.json({ msg: 'Joined group successfully' });
});


router.get('/search/:query', async (req, res) => {
  try {
    const regex = new RegExp(req.params.query, 'i');
    const groups = await Group.find({ name: regex }).select('name image _id');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: 'Group search failed' });
  }
});


router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).select('groupMembers');
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch group' });
  }
});

module.exports = router;