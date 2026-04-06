const express = require('express');
const router = express.Router();
const { createStory, getFeedStories, viewStory, deleteStory, getMyStories } = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/feed', protect, getFeedStories);
router.get('/mine', protect, getMyStories);
router.post('/', protect, upload.single('media'), createStory);
router.put('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
