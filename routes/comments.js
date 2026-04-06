const express = require('express');
const router = express.Router();
const { addComment, getComments, updateComment, deleteComment, likeComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.post('/:postId', protect, addComment);
router.get('/:postId', protect, getComments);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, likeComment);

module.exports = router;
