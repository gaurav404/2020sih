module.exports = function(async, ChatUsers, Message, FriendResult) {
	return {
		setRouting: function(router) {
			router.get('/chat/chat/:name', this.getChatPage);
			router.post('/chat/chat/:name', this.postChatPage);
		},
		getChatPage: function(req, res) {
			async.parallel(
				[
					function(callback) {
						ChatUsers.findOne({ username: req.user.username })
							.populate('request.userId')
							.exec((err, result) => {
								callback(err, result);
							});
					},
					function(callback) {
						const nameRegex = new RegExp(
							`^${req.user.username.toLowerCase()}`,
							'i',
						);

						Message.aggregate(
							[{
								$match: {
									$or: [
										{ senderName: nameRegex },
										{ receiverName: nameRegex },
									],
								},
							},
							{ $sort: { createdAt: -1 } },
							{
								$group: {
									_id: {
										last_message_between: {
											$cond: [
												{
													$gt: [
														{
															$substr: [
																'$senderName',
																0,
																1,
															],
														},
														{
															$substr: [
																'$receiverName',
																0,
																1,
															],
														},
													],
												},
												{
													$concat: [
														'$senderName',
														' and ',
														'$receiverName',
													],
												},
												{
													$concat: [
														'$receiverName',
														' and ',
														'sendername',
													],
												},
											],
										},
									},
									body: { $first: '$$ROOT' },
								},
							}],
							function(err, newResult) {
								const arr = [
									{ path: 'body.sender', model: 'ChatUser' },
									{ path: 'body.receiver', model: 'ChatUser' },
								];

								Message.populate(newResult, arr, (err, newResult) => callback(err, newResult));
							},
						);
					},
					function(callback) {
						Message.find({
							$or: [
								{ senderName: req.user.username },
								{ receiverName: req.user.username },
							],
						})
							.populate('sender')
							.populate('receiver')
							.exec((err, result3) => callback(err, result3));
					},
				],
				(err, results) => {
					const result1 = results[0];
					const result2 = results[1];
					const result3 = results[2];

					const params = req.params.name.split('.');
					const nameParams = params[0];

					res.render('chat/private/privatechat', {
						title: 'Private Chat',
						user: req.user,
						data: result1,
						chat: result2,
						chats: result3,
						name: nameParams,
					});
				},
			);
		},
		postChatPage: function(req, res, next) {
			const params = req.params.name.split('.');
			const nameParams = params[0];
			const nameRegex = new RegExp(`^${nameParams.toLowerCase()}`, 'i');

			async.waterfall(
				[
					function(callback) {
						if (req.body.message) {
							ChatUsers.findOne(
								{ username: { $regex: nameRegex } },
								(err, data) => {
									callback(err, data);
								},
							);
						}
					},
					function(data, callback) {
						if (req.body.message) {
							const newMessage = new Message({
								sender: req.user._id,
								receiver: data._id,
								senderName: req.user.username,
								receiverName: data.username,
								message: req.body.message,
								userImage: req.user.userImage,
								createdAt: new Date(),
							});

							newMessage.save((err, result) => {
								if (err) {
									return next(err);
								}
								callback(err, result);
							});
						}
					},
				],
				(err, results) => {
					res.redirect(`/chat/chat/${req.params.name}`);
				},
			);

			FriendResult.PostRequest(req, res, `/chat/chat/${req.params.name}`);
		},
	};
};
