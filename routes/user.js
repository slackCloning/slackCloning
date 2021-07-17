const express = require('express');
const { Op } = require("sequelize");
const { User } = require("../models");
const router = express.Router();
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
router.post("/auth", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({
        where: {
            email,
        },
    });
    // NOTE: 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
    if (!user || password !== user.password) {
        res.status(400).send({
            errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
        });
        return;
    }
    res.send({
        token: jwt.sign({ userId: user.userId }, "customized-secret-key"),
    });
});

module.exports = router;