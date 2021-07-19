const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

const Channel = require('../models/channel');
const ChannelUserList = require('../models/channelUserlist');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

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


//채널 조회
router.get('/', async (req, res) => {
    try {
        const result = await Channel.findAll({
            order: [['createdAt', 'DESC']]
        });
        const io = req.app.get('io');
        io.of('workspace').emit("main", result);
        res.json({ "ok": true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "채널목록 불러오기를 실패하였습니다." });
    }
});


// 사용자 조회
router.get('/users', async (req, res) => {
    try {
        const result = await User.findAll({
            order: [['createdAt', 'DESC']]
        });
        console.log(result);
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
        res.status(500).json({ ok: false, message: '채널등록을 실패하였습니다.' });
    }
});

//게시글 만들기
router.post('/:id', upload.single('img'), async (req, res) => {
    try {
        const { id: channelId } = req.params;
        const { title, description, userId } = req.body;
        let img = req.file ? `/img/${req.file.filename}` : "/img/default.jpg";
        await Post.create({
            title,
            description,
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