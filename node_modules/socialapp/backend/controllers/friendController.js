const User = require('../models/User');
const Notification = require('../models/Notification');

exports.sendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot send request to yourself' });

    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const sender = await User.findById(req.user._id);

    if (sender.friends.includes(userId))
      return res.status(400).json({ message: 'Already friends' });
    if (sender.sentRequests.includes(userId))
      return res.status(400).json({ message: 'Request already sent' });

    const existingRequest = target.friendRequests.find(r => r.from.toString() === req.user._id.toString());
    if (existingRequest) return res.status(400).json({ message: 'Request already exists' });

    target.friendRequests.push({ from: req.user._id, status: 'pending' });
    sender.sentRequests.push(userId);
    await target.save();
    await sender.save();

    await Notification.create({ recipient: userId, sender: req.user._id, type: 'friend_request' });

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    const currentUser = await User.findById(req.user._id);
    const requestIndex = currentUser.friendRequests.findIndex(r => r.from.toString() === userId);
    if (requestIndex === -1) return res.status(404).json({ message: 'Friend request not found' });

    if (action === 'accept') {
      currentUser.friends.push(userId);
      const requester = await User.findById(userId);
      requester.friends.push(req.user._id);
      requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user._id.toString());
      await requester.save();
      await Notification.create({ recipient: userId, sender: req.user._id, type: 'friend_accept' });
    } else {
      const requester = await User.findById(userId);
      requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user._id.toString());
      await requester.save();
    }

    currentUser.friendRequests.splice(requestIndex, 1);
    await currentUser.save();

    res.json({ message: `Request ${action}ed` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unfriend = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { friends: req.user._id } });
    res.json({ message: 'Unfriended' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'username firstName lastName profilePicture bio');
    const pending = user.friendRequests.filter(r => r.status === 'pending');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username firstName lastName profilePicture bio');
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const target = await User.findById(userId);
    target.friendRequests = target.friendRequests.filter(r => r.from.toString() !== req.user._id.toString());
    await target.save();

    await User.findByIdAndUpdate(req.user._id, { $pull: { sentRequests: userId } });
    res.json({ message: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
