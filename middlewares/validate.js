const Joi = require('joi');


exports.validate = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string()
            .alphanum()
            .regex(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            .required()
            .messages({
                'string.base': `이메일은 문자열이어야 합니다.`,
                'string.empty': `이메일을 입력하세요.`,
                'string.pattern.base': `이메일 형식이어야 합니다.`
            }),

        nickname: Joi.string(),

        password: Joi.string()
            .min(8)
            .custom((value, helper) => {
                if (value.includes(req.body.nickname)) {
                    return helper.message("닉네임과 같은 값이 비밀번호에 포함되면 안됩니다.");
                }
            })
            .messages({
                'string.min': `비밀번호는 8자 이상이어야 합니다.`,
            }),
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.json({ "ok": false, "message": result.error.message })
    } else {
        next();
    }
};