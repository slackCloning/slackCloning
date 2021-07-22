const express = require('express');
const jwt = require("jsonwebtoken");
const bycrypt = require('bcrypt');


const { User } = require("../models");

const { authenticateJWT } = require('../middlewares/authJwt')
const { isNotLoggedIn } = require('../middlewares/isLoggedInOrisNotLoggedIn');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.get('/me', authenticateJWT, async (req, res) => {
    res.cookie("user", { "id": req.user.id, "email": req.user.email });
    res.json({ "user": req.user });
});


router.post('/createAccount', isNotLoggedIn, validate, async (req, res, next) => {
    try {
        const { email, nickname, password, } = req.body;

        const existsUsers = await User.findOne({
            where: { email },
        });
        if (existsUsers) {
            res.json({ "ok": false, "message": "이메일 혹은 닉네임이 중복 됩니다." });
            return;
        };
        const hash = await bycrypt.hash(password, 12);
        await User.create({ email, nickname, password: hash });
        res.json({ "ok": true });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post("/login", isNotLoggedIn, async (req, res, next) => {
    try {
        passport.authenticate('local', (error, user, info) => {
            if (error) {
                console.error(error);
                return next(error);
            };
            if (!user) {
                return res.json({ "message": `${info.message}` });
            };

            return req.login(user, { session: false }, (loginError) => {
                if (loginError) {
                    console.error(loginError);
                    return next(loginError);
                };
                const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
                res.json({ "ok": true, token });
            });
        })(req, res);
    } catch (error) {
        console.error(error);
        next(error);
    }
});


router.post('/dupCheck', async (req, res) => {
    try {
        const { email } = req.body;
        const existsUsers = await User.findOne({
            where: { email },
        });
        if (existsUsers) {
            res.json({ "ok": false, "message": "중복된 이메일입니다." });
            return;
        };
        res.json({ "ok": true });
    } catch (error) {
        res.json({ "ok": false, "message": "중복체크에 실패하였습니다." });
        console.error(error);
    }
});




module.exports = router;