module.exports = function(async, ChatUsers, Message) {
	return {
		PostRequest: function(req, res, url) {
			async.parallel(
				[
					function(callback) {
						if (req.body.receiverName) {
							ChatUsers.update(
								{
									username: req.body.receiverName,
									'request.userId': { $ne: req.user._id },
									'friendList.friendId': {
										$ne: req.user._id,
									},
								},
								{
									$push: {
										request: {
											userId: req.user._id,
											username: req.user.username,
										},
									},
									$inc: { totalRequest: 1 },
								},
								(err, count) => {
									callback(err, count);
								},
							);
						}
					},
					function(callback) {
						if (req.body.receiverName) {
							ChatUsers.update(
								{
									username: req.user.username,
									'sentRequest.username': {
										$ne: req.body.receiverName,
									},
								},
								{
									$push: {
										sentRequest: {
											username: req.body.receiverName,
										},
									},
								},
								(err, count) => {
									callback(err, count);
								},
							);
						}
					},
				],
				(err, results) => {
					res.redirect(url);
				},
			);
			// update receiver of friend as it is accepted.
			async.parallel(
				[
					function(callback) {
						if (req.body.senderId) {
							ChatUsers.update(
								{
									_id: req.user._id,
									'friendList.friendId': {
										$ne: req.body.senderId,
									},
								},
								{
									$push: {
										friendList: {
											friendId: req.body.senderId,
											friendName: req.body.senderName,
										},
									},
									$pull: {
										request: {
											userId: req.body.senderId,
											username: req.body.senderName,
										},
									},
									$inc: { totalRequest: -1 },
								},
								(err, count) => {
									callback(err, count);
								},
							);
						}
					},
					function(callback) {
						if (req.body.senderId) {
							ChatUsers.update(
								{
									_id: req.body.senderId,
									'friendList.friendId': {
										$ne: req.user._id,
									},
								},
								{
									$push: {
										friendList: {
											friendId: req.user._id,
											friendName: req.user.username,
										},
									},
									$pull: {
										sentRequest: {
											username: req.user.username,
										},
									},
								},
								(err, count) => {
									callback(err, count);
								},
							);
						}
					},
					function(callback) {
						if (req.body.user_Id) {
							ChatUsers.update(
								{
									_id: req.user._id,
									'request.userId': { $eq: req.body.user_Id },
								},
								{
									$pull: {
										request: { userId: req.body.user_Id },
									},
									$inc: { totalRequest: -1 },
								},
								(err, count) => {
									callback(err, count);
								},
							);
						}
					},
					function(callback) {
						if (req.body.user_Id) {
							ChatUsers.update(
								{
									_id: req.body.user_Id,
									'sentRequest.username': {
										$eq: req.user.username,
									},
								},
								{
									$pull: {
										sentRequest: {
											username: req.user.username,
										},
									},
								},
								(err, count) => {
									callback(err, count);
								},
							);
						}
					},
					function(callback) {
						if (req.body.chatId) {
							Message.update(
								{ _id: req.body.chatId },
								{ isRead: true },
								(err, done) => callback(err, done),
							);
						}
					},
				],
				(err, results) => {
					res.redirect(url);
				},
			);
		},
	};
};
