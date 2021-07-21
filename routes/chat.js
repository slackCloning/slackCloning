const express = require('express');
const { sequelize } = require('../models');
const { Op, where } = require('sequelize');
const Dm = require('../models/dm');
const Chat = require('../models/chat');
const User = require('../models/user');

const router = express.Router();


router.post('/:dmsId', async (req, res) => {
    try {
        const { dmsId } = req.params
        const { userId } = req.body;

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

        // const dm = await Dm.findOne({
        //     where: {
        //         [Op.and]: [{ id: dmsId }, { [Op.or]: [{ userId }, { otherUserId: userId }] }]
        //     },
        //     include: [
        //         {
        //             model: User,
        //             as: 'User',
        //         },
        //         {
        //             model: User,
        //             as: 'OtherUser',
        //         }
        //     ],
        // });

        // if (!dm) {
        //     return res.status(400).json({ ok: false, message: '접근권한이 없습니다.' });
        // };

        console.log();
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
        if (result.length) {
            return res.json({ ok: false, message: '이미 DM으로 등록 된 사용자입니다.' });
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
        req.session.user = 1;
        const { dmsId } = req.params;
        const { userId, chat } = req.body;

        const result = await Chat.create({
            dmsId,
            userId,
            chat,
        });
        console.log(req.session);
        const io = req.app.get('io');
        io.of('chat').emit("message", result.chat);
        res.json({ ok: true, result, user: res.session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '채팅쓰기를 실패하였습니다.' });
    }
});

module.exports = router;