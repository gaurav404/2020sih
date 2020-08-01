module.exports = function(ChatUsers, async, Message, FriendResult, Group) {
	return {
		setRouting: function(router) {
			router.get('/chat/group/:name', this.groupPage);
			router.post('/chat/group/:name', this.groupPostPage);
			router.get('/chat/logout', this.logout);
		},
		groupPage: function(req, res) {
			const name = req.params.name;

			async.parallel(
				[
					function(callback) {
						ChatUsers.findOne({ username: req.user.username })
							.populate('request.userId')
							.exec((err, result) => callback(err, result));
					},
					function(callback) {
						const nameRegex = new RegExp(`^${req.user.username.toLowerCase()}`, 'i');

						Message.aggregate(
							[{
								$match: {
									$or: [{ senderName: nameRegex }, { receiverName: nameRegex }],
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
															$substr: ['$senderName', 0, 1],
														},
														{
															$substr: ['$receiverName', 0, 1],
														},
													],
												},
												{
													$concat: ['$senderName', ' and ', '$receiverName'],
												},
												{
													$concat: ['$receiverName', ' and ', 'sendername'],
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
						Group.find({})
							.populate('sender')
							.exec((err, result) => callback(err, result));
					},
				],
				(err, results) => {
					const result1 = results[0];
					const result2 = results[1];
					const result3 = results[2];

					res.render('groupchat/group', {
						title: 'Groups',
						user: req.user,
						groupName: name,
						data: result1,
						chat: result2,
						groupMsg: result3,
					});
				},
			);
		},
		groupPostPage: function(req, res) {
			FriendResult.PostRequest(req, res, `/group/${req.params.name}`);

			async.parallel(
				[
					function(callback) {
						if (req.body.message) {
							const group = new Group();

							group.sender = req.user._id;
							group.body = req.body.message;
							group.name = req.body.groupName;
							group.createdAt = new Date();

							group.save((err, msg) => {
								callback(err, msg);
							});
						}
					},
				],
				(err, results) => {
					res.redirect(`/chat/group/${req.params.name}`);
				},
			);
		},
		logout: function(req, res) {
			req.logout();
			req.session.destroy(e => {
				res.redirect('/login');
			});
		},
	};
};
