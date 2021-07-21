const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

const Channel = require('../models/channel');
const ChannelUserList = require('../models/channelUserlist');
const Dms = require('../models/dm');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');


const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
};

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});



router.get('/allUsers', async (req, res) => {
    try {
        const result = await User.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ "ok": true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "사용자목록 불러오기를 실패하였습니다." });
    }
});

//게시글 조회
router.get('/:channelId', async (req, res) => {
    try {
        const { channelId } = req.params;
        const result = await Post.findAll({
            where: { channelId },
            order: [['createdAt', 'DESC']],
        });
        console.log(result);
        res.json({ "ok": true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "게시글목록 불러오기를 실패하였습니다." });
    }
});


//채널 사용자 조회
router.get('/:channelId/users', async (req, res) => {
    try {
        const { channelId } = req.params;
        const result = await ChannelUserList.findAll({
            where: { channelId },
            include: [{
                model: User,
                order: [['createdAt', 'DESC']]
            }]
        });
        console.log(result);
        res.json({ "ok": true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "채널 사용자 목록 불러오기를 실패하였습니다." });
    }
});



//게시글 상세 조회
router.get('/:channelId/post/:postId', async (req, res) => {
    try {
        const { channelId, postId } = req.params;

        const post = await Post.findOne({
            where: {
                [Op.and]: [{ id: postId }, { channelId }]
            },
            include: [{
                model: Comment,
                order: [['createdAt', 'DESC']]
            }]
        });
        console.log(post);
        console.log(post.Comments);

        res.json({ ok: true, result: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '게시글 상세 조회를 실패하였습니다.' });
    }
});



// DM사용자 조회
router.post('/users', async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await Dms.findAll({
            where: { userId },
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
            order: [['createdAt', 'DESC']]
        });
        console.log(result);
        res.json({ "ok": true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "사용자목록 불러오기를 실패하였습니다." });
    }
});


//채널 만들기
router.post('/', async (req, res) => {
    try {
        const { title, userId, userList } = req.body;
        const channel = await Channel.create({
            title,
            userId
        });
        const channelId = channel.id;
        for (let i = 0; i < userList.length; i++) {
            await ChannelUserList.create({
                userId: userList[i],
                channelId,
            });
        }

        // console.log(result);
        // const io = req.app.get('io');
        // io.of('workspace').emit("main", result);

        res.json({ ok: true, message: '채널등록을 성공하였습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '채널등록을 실패하였습니다.' });
    }
});


//채널 조회
router.post('/lists', async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await ChannelUserList.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: {
                model: Channel,
                order: [['createdAt', 'DESC']]
            },
        })

        // const result = await Channel.findAll({

        //     order: [['createdAt', 'DESC']]
        // });
        res.json({ "ok": true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "채널목록 불러오기를 실패하였습니다." });
    }
});



//게시글 만들기
router.post('/:id', upload.single('img'), async (req, res) => {
    try {
        const { id: channelId } = req.params;
        const { chat, userId } = req.body;
        let img = req.file ? `/img/${req.file.filename}` : "/img/default.jpg";
        await Post.create({
            chat,
            img,
            channelId,
            userId
        });
        res.json({ ok: true, message: '게시글 등록을 성공하였습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '게시글 등록을 실패하였습니다.' });
    }
});


//채널 나가기
router.delete('/:channelId', async (req, res) => {
    try {
        const { channelId } = req.params;
        const { userId } = req.body;
        await ChannelUserList.destroy({
            where: {
                [Op.and]: [{ channelId }, { userId }],
            }
        });

        res.json({ ok: true, message: '채널나가기를 성공하였습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '채널나가기를 실패하였습니다.' });
    }
});


//게시글 삭제
router.delete('/:channelId/post/:postId', upload.single('img'), async (req, res) => {
    try {
        const { channelId, postId } = req.params;

        const { userId } = req.body;

        const post = await Post.findOne({
            where: {
                [Op.and]: [{ id: postId }, { channelId }]
            }
        });
        console.log(post.userId);

        if (post.userId !== +userId) {
            return res.json({ ok: false, message: '작성자만 게시글을 지울 수 있습니다.' });
        }
        await Post.destroy({
            where: { id: postId }
        });
        res.json({ ok: true, message: '게시글 삭제를 성공하였습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '게시글 삭제를 실패하였습니다.' });
    }
});



module.exports = router;