const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require('http');
const validator = require('express-validator');
const flash = require('connect-flash');
const socketIO = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { Users } = require('./helpers/UsersClass');
const { Global } = require('./helpers/Global');
const compression = require('compression');
const helmet = require('helmet');
const passport = require("passport");
const cookieParser = require('cookie-parser');
const db = require("./configs/database");
const methodOverride = require("method-override"),
    Doctor  = require("./models/doctor"),
    Comment     = require("./models/comment"),
    User        = require("./models/user");

const container = require('./container');
//check
container.resolve(function(users, _, admin, home, group, results, privatechat, profile, interest) {
	mongoose.Promise = global.Promise;
	mongoose.connect(db.config.uri, db.config.options);

	const app = setupExpress();

	function setupExpress() {
		const app = express();

		const server = http.createServer(app);
		//change https
		// https.createServer(httpsOptions, app).listen(3000, () => {
		// 	console.log('Listening on port 3000');
		// });
		const io = socketIO(server);

		server.listen(process.env.PORT || 5000, () => {
			console.log('Listening on port 5000');
		});

        // Use 
		configureExpress(app);

		// Set SocketIO
		require('./socket/groupchat')(io, Users);
		require('./socket/friend')(io);
		require('./socket/globalroom')(io, Global, _);
		require('./socket/privatemessage')(io);

		

		// Setup router
		var commentRoutes    = require("./routes/comments"),
		doctorRoutes = require("./routes/doctors"),
		indexRoutes      = require("./routes/indexRoutes");
		//app.use('/', require('./routes/auth'));
		
		const router = require('express-promise-router')();
		// Chat Routes
		users.setRouting(router);
		admin.setRouting(router);
		home.setRouting(router);
		group.setRouting(router);
		results.setRouting(router);
		privatechat.setRouting(router);
		profile.setRouting(router);
		interest.setRouting(router);
	
		app.use(router);
		// Forum Routes
		app.use('/forum', require('./routes/front'));
		app.use('/', require('./routes/indexRoutes'));
		app.use('/forum', require('./routes/index'));
		app.use('/forum', require('./routes/settings'));
		app.use('/forum/r/', require('./routes/subreddit'));
		app.use('/forum/u/', require('./routes/profile'));
		app.use('/api', require('./routes/api'));
		//app.use("/doctor", indexRoutes);
		//Doctor Routes
		app.use('/doctors/', require('./routes/doctors'));
			app.use('/blog', require('./routes/blog'));
      //  app.use("/doctors/:id/comments", commentRoutes);
        app.get('*', function (req, res) {
			res.status(404);
			res.render("./error")
		});
	}

	function configureExpress(app) {
		app.use(compression());
		app.use(helmet());
		
		app.use(express.static('public'));
		app.use(methodOverride("_method"));
		app.use(cookieParser());
		app.set('view engine', 'ejs');
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));

		app.use(validator());

		app.use(session({
			secret: 'keyboard cat',
			resave: true,
            saveUninitialized: true,
            store: new MongoStore({
                mongooseConnection : mongoose.connection,
            }),
        }));
        app.use(passport.initialize());
		app.use(passport.session());
		app.use(function (req, res, next) {
			if(req.user){
				res.locals.user = req.user.username;
			}else{
				res.locals.user=null;
			}
			res.locals.isauth = req.isAuthenticated();

			next();
		});
		require('./passport/passport-local');
		require('./passport/passport-facebook');
		require('./passport/passport-google');
		passport.serializeUser(function (user_id, done) {
			done(null, user_id);
		});
		passport.deserializeUser(function (user_id, done) {
			done(null, user_id);
		});
		
		
		// functions for persistant sessions
		

		
		app.use(flash());
		// ejs can use lodash
		app.locals._ = _;
	}
});