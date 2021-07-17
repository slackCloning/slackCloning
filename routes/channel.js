const express = require('express');

const Channel = require('../models/channel');
const ChannelUserList = require('../models/channelUserlist');
const User = require('../models/user');

const router = express.Router();



router.get('/', async (req, res) => {
    try {
        const result = await Channel.findAll({
            order: [['createdAt', 'DESC']]
        });
        console.log(result);
        res.json({ "ok": true, result });
    } catch (error) {
        console.error(error);
        res.json({ ok: false, message: "채널목록 불러오기를 실패하였습니다." });
    }
});

router.get('/users', async (req, res) => {
    try {
        const result = await User.findAll({
            order: [['createdAt', 'DESC']]
        });
        console.log(result);
        res.json({ "ok": true, result });
    } catch (error) {
        console.error(error);
        res.json({ ok: false, message: "채널목록 불러오기를 실패하였습니다." });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, userId, userList } = req.body;
        const channel = await Channel.create({
            title,
            userId
        });
        const channelId = channel.id;
        for (let i = 0; i < userList.length; i++) {
            const [userId, nickname] = userList[i];
            await ChannelUserList.create({
                userId,
                nickname,
                channelId,
            });
        }
        res.json({ ok: true, message: '채널등록을 성공하였습니다.' });
    } catch (error) {
        console.error(error);
        res.json({ ok: false, message: '채널등록을 실패하였습니다.' });
    }
});

module.exports = router;