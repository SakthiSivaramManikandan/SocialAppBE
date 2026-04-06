const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true }
  },
  text: { type: String, maxlength: 200 },
  textStyle: {
    color: { type: String, default: '#ffffff' },
    fontSize: { type: String, default: '24px' },
    position: { type: String, default: 'center' }
  },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', StorySchema);
