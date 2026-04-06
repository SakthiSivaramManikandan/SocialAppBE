const Story = require('../models/Story');
const User = require('../models/User');

exports.createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Media file required' });
    const mediaUrl = `/uploads/${req.file.mimetype.startsWith('image') ? 'images' : 'videos'}/${req.file.filename}`;
    const story = await Story.create({
      author: req.user._id,
      media: { url: mediaUrl, type: req.file.mimetype.startsWith('image') ? 'image' : 'video' },
      text: req.body.text,
      textStyle: req.body.textStyle ? JSON.parse(req.body.textStyle) : {}
    });
    await story.populate('author', 'username firstName lastName profilePicture');
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedStories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendIds = [...user.friends, req.user._id];
    const stories = await Story.find({
      author: { $in: friendIds },
      expiresAt: { $gt: new Date() }
    })
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    // Group by author
    const grouped = {};
    stories.forEach(s => {
      const key = s.author._id.toString();
      if (!grouped[key]) grouped[key] = { author: s.author, stories: [] };
      grouped[key].stories.push(s);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }
    res.json({ message: 'Viewed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({ author: req.user._id, expiresAt: { $gt: new Date() } })
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
