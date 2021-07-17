const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

const Dm = require('../models/dm');

const router = express.Router();



router.post('/', async (req, res) => {
    try {
        const { userId, otherUserId } = req.body;

        const [result, metadata] = await sequelize.query(`SELECT * FROM dms where (userId = ${userId} and otherUserId = ${otherUserId}) 
                                                            OR (userId = ${otherUserId} and otherUserId = ${userId})`);
        if (result.length) {
            return res.json({ ok: false, message: '이미 DM으로 등록 된 사용자입니다.' });
        }

        await Dm.create({
            userId,
            otherUserId,
        })
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'DM 추가를 실패하였습니다.' });
    }

});

module.exports = router;