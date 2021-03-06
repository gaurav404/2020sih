const path = require('path');
const fs = require('fs');

module.exports = function(async, ChatUsers, Message, formidable, FriendResult) {
	return {
		setRouting: function(router) {
			router.get('/chat/settings/profile', this.getProfilePage);
			// replace aws by localhost
			// router.post('/userupload', aws.Upload.any(), this.userUpload);
			router.post('/chat/userupload', this.userUpload);
			router.post('chat/settings/profile', this.postProfilePage);

			router.get('/chat/profile/:name', this.overviewPage);
			router.post('/chat/profile/:name', this.overviewPostPage);
		},
		getProfilePage: function(req, res) {
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
								callback(err, newResult);
							},
						);
					},
				],
				(err, results) => {
					const result1 = results[0];
					const result2 = results[1];

					res.render('user/profile', {
						title: 'Profile',
						user: req.user,
						data: result1,
						chat: result2,
					});
				},
			);
		},
		userUpload: function(req, res) {
			const form = new formidable.IncomingForm();

			form.uploadDir = path.join(__dirname, '../public/uploads');

			form.on('file', (field, file) => {
				// change filename
				fs.rename(file.path, path.join(form.uploadDir, file.name), err => {
					if (err) {
						throw err;
					}
				});
			});

			form.on('error', e => {});

			form.on('end', () => {});

			form.parse(req);
		},
		postProfilePage: function(req, res) {
			FriendResult.PostRequest(req, res, `/chat/settings/profile`);

			async.waterfall(
				[
					function(callback) {
						ChatUsers.findOne({ _id: req.user._id }, (err, result) => callback(err, result));
					},
					function(result, callback) {
						const { upload, ...bodyObject } = req.body;

						const userImage = upload || result.userImage;

						console.log('userImage', userImage);

						ChatUsers.update(
							{ _id: req.user._id },
							{
								userImage,
								...bodyObject,
							},
							{
								upsert: true,
							},
							(err, result) => callback(err, result),
						);
					},
				],
				(err, result) => {
					res.redirect('/chat/settings/profile');
				},
			);
		},
		overviewPage: function(req, res) {
			async.parallel(
				[
					function(callback) {
						ChatUsers.findOne({ username: req.params.name })
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
				],
				(err, results) => {
					const result1 = results[0];
					const result2 = results[1];

					res.render('user/overview', {
						title: 'Overview',
						user: req.user,
						data: result1,
						chat: result2,
					});
				},
			);
		},
		overviewPostPage: function(req, res) {
			FriendResult.PostRequest(req, res, `/chat/profile/${req.params.name}`);
		},
	};
};
