const Group = require('../models/Group');
const bcrypt = require('bcrypt');

exports.createGroup = async (req, res) => {
  const { name, passcode, image } = req.body;
  const userId = req.user.id;

  try {
    const exist = await Group.findOne({ name });
    if (exist) return res.status(400).json({ message: 'Group already exists' });

    const hashedPasscode = await bcrypt.hash(passcode, 10);

    const group = new Group({
      name,
      passcode: hashedPasscode,
      image,
      admin: userId,
      members: [userId],
    });

    await group.save();

    res.json({ message: 'Group created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinGroup = async (req, res) => {
  const { name, passcode } = req.body;
  const userId = req.user.id;

  try {
    const group = await Group.findOne({ name });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMatch = await bcrypt.compare(passcode, group.passcode);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect passcode' });

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: 'Joined group successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().select('name image');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
};
