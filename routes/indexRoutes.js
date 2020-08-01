var express = require("express");
var router  = express.Router();
var passport = require("passport");

//root route
router.get("/", function(req, res){
   // res.render("landing");
  res.render("indexUI");

});

// show register form
// router.get("/registerDoctor", function(req, res){
//    res.render("register"); 
// });

//handle sign up logic
// router.post("/register", function(req, res){
//     var newUser = new User({username: req.body.username});
//     User.register(newUser, req.body.password, function(err, user){
//         if(err){
//             console.log(err);
//             return res.render("register");
//         }
//         passport.authenticate("local")(req, res, function(){
//            res.redirect("/doctors/new"); 
//         });
//     });
// });

//show login form
// router.get("/login", function(req, res){
//    res.render("login"); 
// });

// //handling login logic
// router.post("/login", passport.authenticate("local", 
//     {
//         successRedirect: "doctors?search=&searchby=doctors",
//         failureRedirect: "/login"
//     }), function(req, res){
// });

// // logout route
// router.get("/logout", function(req, res){
//    req.logout();
//    res.redirect("/doctors");
// });

// //middleware
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }

module.exports = router;