module.exports = function(_, passport, User) {
	return {
		setRouting: function(router) {
			router.get('/login', this.indexPage);
			router.get('/signup', this.getSignUp);
			// /auth/facebook/ -> fb-passport -> /auth/facebook/callback -> fb-passport -> redirect home | signup page
			router.get('/auth/facebook', this.getFacebookLogin);
			router.get('/auth/facebook/callback', this.facebookLogin);
			router.get('/auth/google', this.getGoogleLogin);
			router.get('/auth/google/callback', this.googleLogin);

			router.post('/login', User.loginValidation, this.postLogin);
			router.post('/signup', User.signupValidation, this.postSignUp);
		},
		indexPage: function(req, res) {
			const errors = req.flash('error');

			return res.render('index', {
				title: 'ChatLogin',
				messages: errors,
				hasErrors: errors.length > 0,
			});
		},
		postLogin: passport.authenticate('local.login', {
			successRedirect: '/chat/home',
			failureRedirect: '/login',
			failureFlash: true,
		}),
		getSignUp: function(req, res) {
			const errors = req.flash('error');

			return res.render('signup', {
				title: 'ChatSignup',
				messages: errors,
				hasErrors: errors.length > 0,
			});
		},
		postSignUp: passport.authenticate('local.signup', {
			successRedirect: '/chat/home',
			failureRedirect: '/signup',
			failureFlash: true,
		}),
		getFacebookLogin: passport.authenticate('facebook', {
			scope: 'email',
		}),
		getGoogleLogin: passport.authenticate('google', {
			scope: [
				'https://www.googleapis.com/auth/plus.login',
				'https://www.googleapis.com/auth/plus.profile.emails.read',
			],
		}),
		facebookLogin: passport.authenticate('facebook', {
			successRedirect: '/chat/home',
			failureRedirect: '/signup',
			failureFlash: true,
		}),
		googleLogin: passport.authenticate('google', {
			successRedirect: '/chat/home',
			failureRedirect: '/signup',
			failureFlash: true,
		})
	};
};
