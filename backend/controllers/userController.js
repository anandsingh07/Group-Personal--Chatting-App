const User = require('../models/User');

exports.searchUser = async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findOne({ userId }).select('username userId _id');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Search error', error: err.message });
  }
};

exports.sendRequest = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!receiver || !sender) return res.status(404).json({ message: 'User not found' });
    if (sender._id.equals(receiver._id)) return res.status(400).json({ message: 'Cannot send request to self' });

    if (
      sender.friends.includes(receiverId) ||
      sender.sentRequests.includes(receiverId) ||
      receiver.friendRequests.includes(senderId)
    ) {
      return res.status(400).json({ message: 'Already connected or pending' });
    }

    sender.sentRequests.push(receiverId);
    receiver.friendRequests.push(senderId);
    await sender.save();
    await receiver.save();

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending request', error: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests', 'username userId')
      .populate('sentRequests', 'username userId');
    res.json({
      received: user.friendRequests,
      sent: user.sentRequests,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests', error: err.message });
  }
};

exports.acceptRequest = async (req, res) => {
  const userId = req.user.id;
  const { senderId } = req.body;

  try {
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!user || !sender) return res.status(404).json({ message: 'Users not found' });
    if (!user.friendRequests.includes(senderId)) return res.status(400).json({ message: 'No such request' });

    user.friendRequests = user.friendRequests.filter((id) => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter((id) => id.toString() !== userId);
    user.friends.push(senderId);
    sender.friends.push(userId);

    await user.save();
    await sender.save();

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting request', error: err.message });
  }
};