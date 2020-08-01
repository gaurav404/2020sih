const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
	username: { type: String, unique: true },
	fullname: { type: String, default: '' },
	email: { type: String, default:'' },
	created:Date,
	password: { type: String, default: '' },
	userImage: { type: String, default: 'default.png' },
	facebook: { type: String, default: '' },
	fbTokens: Array,
	google: { type: String, default: '' },
	sentRequest: [{ username: { type: String, default: '' } }],
	request: [
		{
			userId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUser' },
			username: { type: String, default: '' },
		},
	],
	friendList: [
		{
			friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUser' },
			friendName: { type: String, default: '' },
		},
	],
	totalRequest: { type: Number, default: 0 },
	gender: { type: String, default: '' },
	country: { type: String, default: '' },
	mantra: { type: String, default: '' },
	favNationalTeam: [{ teamName: { type: String, default: '' } }],
	favPlayer: [{ playerName: { type: String, default: '' } }],
	favClub: [{ clubName: { type: String } }],
});

userSchema.methods = {
	encryptPassword: function(password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
	},
	validUserPassword: function(password) {
		return bcrypt.compareSync(password, this.password);
	},
};

module.exports = mongoose.model('ChatUser', userSchema);
