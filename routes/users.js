const express = require('express');
const { Op } = require("sequelize");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const router = express.Router();



router.post('/dupCheck', async (req, res) => {
    const { email } = req.body;
    console.log(email)
    const existsUsers = await User.findAll({
        where: {email},
    });
    if (existsUsers.length) {
        res.status(400).json({
            "ok": false,
        });
        return;
    }

    res.json({ "ok": true });
})

router.post('/createAccount', async (req, res) => {
    const { email, nickname, password, } = req.body;
    console.log({ User })
    // email or nickname이 동일한게 이미 있는지 확인하기 위해 가져온다.
    const existsUsers = await User.findAll({
        where: {
            [Op.or]: [{ email }, { nickname }],
        },
    });
    if (existsUsers.length) {
        res.status(400).json({
            "ok": false,
        });
        return;
    }
    await User.create({ email, nickname, password });
    res.json({ "ok": true });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({
        where: {
            email,
        },
    });
    
    if (!user || password !== user.password) {
        res.status(400).json({
            "ok": false
        });
        return;
    }
    const token = jwt.sign({ email}, "secret-key")
    res.json({
        "ok": true,
        "result": token,
        "email":email
    });
});

router.get('/me', async (req,res) => {
    const Auth_token = req.headers.authorization.split('Bearer ')[1]
    console.log(Auth_token)

    try{
        const { email } = jwt.verify(Auth_token, "secret-key");
        console.log(email)
        const user = await User.findOne({
            where: {
                email,
            },
        });
        console.log(user)
        res.send(user)
        
    }catch(err){
        res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
          });
    }
})

module.exports = router;