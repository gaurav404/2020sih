const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
	message: { type: String },
	sender: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUser' },
	receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUser' },
	senderName: { type: String },
	receiverName: { type: String },
	userImage: { type: String, default: 'defaultPic.png' },
    isRead: { type: Boolean, default: false },
    // default as function executed that return value
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
