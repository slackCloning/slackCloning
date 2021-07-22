const passport = require('passport');

exports.authenticateJWT = (req, res, next) =>
    passport.authenticate("jwt", { sessions: false }, (error, user, message) => {
        if (user) {
            req.user = user;
            next();
        } else {
            res.redirect("/")
        }
    })(req, res, next);
