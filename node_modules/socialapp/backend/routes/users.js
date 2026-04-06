const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePicture, uploadCoverPhoto, searchUsers, getUserPosts, getSuggestedUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/search', protect, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/:username', protect, getProfile);
router.put('/profile/update', protect, updateProfile);
router.put('/profile/picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.put('/profile/cover', protect, upload.single('coverPhoto'), uploadCoverPhoto);
router.get('/:username/posts', protect, getUserPosts);

module.exports = router;
