const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

exports.createPost = async (req, res) => {
  try {
    const { content, privacy } = req.body;
    const media = req.files ? req.files.map(f => ({
      url: `/uploads/${f.mimetype.startsWith('image') ? 'images' : 'videos'}/${f.filename}`,
      type: f.mimetype.startsWith('image') ? 'image' : 'video'
    })) : [];

    if (!content && media.length === 0)
      return res.status(400).json({ message: 'Post must have content or media' });

    const post = await Post.create({ author: req.user._id, content, media, privacy });
    await post.populate('author', 'username firstName lastName profilePicture');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const friendIds = [...user.friends, req.user._id];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      $or: [
        { author: { $in: friendIds }, privacy: { $in: ['public', 'friends'] } },
        { author: req.user._id }
      ]
    })
      .populate('author', 'username firstName lastName profilePicture')
      .populate({ path: 'comments', options: { limit: 3, sort: { createdAt: -1 } }, populate: { path: 'author', select: 'username firstName lastName profilePicture' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: { $in: friendIds } });
    res.json({ posts, hasMore: skip + posts.length < total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username firstName lastName profilePicture' } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    post.content = req.body.content ?? post.content;
    post.privacy = req.body.privacy ?? post.privacy;
    await post.save();
    await post.populate('author', 'username firstName lastName profilePicture');
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await Comment.deleteMany({ post: post._id });
    await Notification.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    else {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({ recipient: post.author, sender: req.user._id, type: 'like_post', post: post._id });
      }
    }
    await post.save();
    res.json({ likes: post.likes, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPublicPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const posts = await Post.find({ privacy: 'public' })
      .populate('author', 'username firstName lastName profilePicture')
      .populate({ path: 'comments', options: { limit: 2 }, populate: { path: 'author', select: 'username firstName lastName profilePicture' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
