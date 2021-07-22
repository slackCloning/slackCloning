const express = require('express');
const { sequelize } = require('../models');
const Dm = require('../models/dm');
const Chat = require('../models/chat');
const User = require('../models/user');

const router = express.Router();


router.post('/:dmsId', async (req, res) => {
    try {
        const { dmsId } = req.params
        const { userId } = req.body;

        // const dms = await Dm.findOne({
        //     where: { dmsId },
        // });

        // const io = req.app.get('io');
        // const adapter = io.of('/chat').adapter;

        const result = await Chat.findAll({
            where: { dmsId },
            include: [
                {
                    model: Dm,
                    include: [
                        {
                            model: User,
                            as: 'User',
                        },
                        {
                            model: User,
                            as: 'OtherUser',
                        }
                    ],
                    where: { userId }
                }
            ],
            order: [['createdAt', 'ASC']],
        });

        res.json({ ok: true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'chat 정보 불러오기를 실패하였습니다.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { userId, otherUserId } = req.body;
        const [result, metadata] = await sequelize.query(`SELECT * FROM dms where (userId = ${userId} and otherUserId = ${otherUserId}) 
                                                            OR (userId = ${otherUserId} and otherUserId = ${userId})`);
        const filterResult = result.filter(dm => dm.userId === userId);
        if (result.length) {
            return res.json({ ok: false, message: '이미 DM으로 등록 된 사용자입니다.', result: filterResult });
        };

        let maxId = await Dm.max('dmsId');
        maxId = maxId ? maxId : 0;
        let dmsId = maxId + 1;
        await Dm.create({
            userId: otherUserId,
            otherUserId: userId,
            dmsId,
        });
        const dm = await Dm.create({
            userId,
            otherUserId,
            dmsId,
        });

        res.json({ ok: true, result: dm });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'DM 추가를 실패하였습니다.' });
    }

});


router.post('/:dmsId/chats', async (req, res) => {
    try {
        const { dmsId } = req.params;
        const { userId, chat } = req.body;

        const result = await Chat.create({
            dmsId,
            userId,
            chat,
        });

        res.json({ ok: true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '채팅쓰기를 실패하였습니다.' });
    }
});

module.exports = router;