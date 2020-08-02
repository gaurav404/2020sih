const passport = require('passport');
const User = require('../models/chatuser');
const LocalStrategy = require('passport-local').Strategy;
const Profile = require('../models/profile');
const { post } = require('../routes');
const validator = require('aadhaar-validator');
passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

passport.use(
	'local.signup',
	new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password',
			passReqToCallback: true,
		},
		async (req, username, password, done) => {
			try {
				const findUser = await User.findOne({ username });

				if (findUser) {
					return done(
						null,
						false,
						req.flash('error', 'User with this name exist'),
					);
				}
				console.log(!validator.isValidNumber(req.body.aadhaar) && !validator.isValidVID(req.body.aadhaar ));
				if(!validator.isValidNumber(req.body.aadhaar) && !validator.isValidVID(req.body.aadhaar )){
					return done(
						null,
						false,
						req.flash('error', 'Enter a valid Aadhaar or virtual ID'),
					);
				}

				const newUser = new User();
				newUser.username = req.body.username;
				newUser.fullname = req.body.username;
				newUser.email = req.body.email;
				newUser.aadhaar = req.body.aadhaar,
				newUser.password = newUser.encryptPassword(req.body.password);
				newUser.created = Date.now();
				const user = await newUser.save();
				const newProfile = new Profile();
				newProfile.username = req.body.username;
				await newProfile.save((err,doc)=>{
					if(err){
						throw err;
					}
				})
				done(null, user);
				
				
			} catch (error) {
				done(error);
			}
		},
	),
);

passport.use(
	'local.login',
	new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password',
			passReqToCallback: true,
		},
		async (req, username, password, done) => {
			try {
				const user = await User.findOne({ username });

				const messages = [];

				if (!user || !user.validUserPassword(password)) {
					messages.push(
						'Email Does Not Exist or Password is Invalid',
					);

					return done(null, false, req.flash('error', messages));
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);
