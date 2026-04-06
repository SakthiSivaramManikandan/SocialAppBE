const express = require('express');
const router = express.Router();
const { sendRequest, respondRequest, unfriend, getFriendRequests, getFriends, cancelRequest } = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

router.get('/requests', protect, getFriendRequests);
router.get('/', protect, getFriends);
router.post('/request/:userId', protect, sendRequest);
router.put('/respond/:userId', protect, respondRequest);
router.delete('/unfriend/:userId', protect, unfriend);
router.delete('/cancel/:userId', protect, cancelRequest);

module.exports = router;
