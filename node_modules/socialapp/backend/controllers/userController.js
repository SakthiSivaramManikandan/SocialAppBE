const User = require('../models/User');
const Post = require('../models/Post');
const path = require('path');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('friends', 'username firstName lastName profilePicture');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, location, website } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, bio, location, website },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = `/uploads/images/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { profilePicture: imageUrl }, { new: true }).select('-password');
    res.json({ profilePicture: user.profilePicture, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadCoverPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = `/uploads/images/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { coverPhoto: imageUrl }, { new: true }).select('-password');
    res.json({ coverPhoto: user.coverPhoto, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user._id }
    }).select('username firstName lastName profilePicture bio').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username firstName lastName profilePicture')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username firstName lastName profilePicture' } })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const exclude = [req.user._id, ...currentUser.friends, ...currentUser.sentRequests];
    const users = await User.find({ _id: { $nin: exclude } })
      .select('username firstName lastName profilePicture bio')
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
