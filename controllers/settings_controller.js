const bcrypt = require("bcrypt");
let Profile = require("../models/profile");
let ChatUser = require("../models/chatuser");

exports.view = function (req, res) {
    if (req.isAuthenticated()) {
        Profile.find({
            username: req.user.username
        }, function (err, result) {
            if (err) throw err;

            if (result.length) {
                karma = result[0]['karma_post'] + result[0]['karma_comment']
                res.render('./settings', {
                    karma: karma
                })
            }
        })
    } else {
        res.render('./login')
    }
}
exports.change_password = function (req, res) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) throw err

        ChatUser.update({
            username: req.user.username
        }, {
            password: hash
        }, function (err, result) {
            if (err) throw err;

            if (result) {
                console.log(`[${req.user.username}] password changed!`)
                res.send("OK")
            }
        });
    });
}

exports.delete_account = function (req, res) {
    ChatUser.find({
        username: req.user.username
    }).remove(function (err, result) {
        if (err) throw err;

        if (result) {
            console.log(`[${req.user.username}] account deleted!`)
            res.send("OK")
        }
    });
}