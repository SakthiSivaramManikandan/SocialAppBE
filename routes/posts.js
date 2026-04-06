const express = require('express');
const router = express.Router();
const { createPost, getFeed, getPost, updatePost, deletePost, likePost, getPublicPosts } = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/feed', protect, getFeed);
router.get('/explore', protect, getPublicPosts);
router.post('/', protect, upload.array('media', 10), createPost);
router.get('/:id', protect, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);

module.exports = router;
