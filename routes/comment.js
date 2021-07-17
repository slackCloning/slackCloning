const express = require('express');

const router = express.Router();
const Comment = require('../models/comment');

router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.findAll({
            where: {
                postId
            },
            order: [['createdAt', 'DESC']]
        });
        console.log(comments);
        res.json({ ok: true, result: comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '댓글 조회를 실패하였습니다.' });
    }
});

router.post('/', async (req, res) => {
    const { comment, userId, postId } = req.body;
    try {
        await Comment.create({
            comment,
            userId,
            postId
        });
        res.json({ ok: true, message: '댓글 등록을 성공하였습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '댓글 등록을 실패하였습니다.' });
    }
});



router.patch('/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId, comment } = req.body;

        if (!await permissionCheck(commentId, userId)) {
            return res.status(400).json({ ok: false, message: '댓글 작성자만 수정할 수 있습니다.' });
        };

        await Comment.update({
            comment
        }, {
            where: {
                id: commentId
            },
        });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '댓글 수정를 실패하였습니다.' });
    }
});


router.delete('/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;

        const { userId } = req.body;

        if (!await permissionCheck(commentId, userId)) {
            return res.status(400).json({ ok: false, message: '댓글 작성자만 삭제할 수 있습니다.' });
        };

        await Comment.destroy({
            where: {
                id: commentId
            },
        });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: '댓글 삭제를 실패하였습니다.' });
    }
});


async function permissionCheck(commentId, userId) {
    const comment = await Comment.findOne({
        where: {
            id: commentId
        }
    });
    console.log(userId, comment.userId);
    if (userId !== comment.userId) return false;
    return true;
}

module.exports = router;