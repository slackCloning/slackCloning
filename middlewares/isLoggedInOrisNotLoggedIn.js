exports.isLoggedIn = (req, res, next) => {
    const cookie = req.headers.cookie?.split('=')[1];
    if (cookie) {
        next();
    } else {
        const error = new Error("로그인이 필요합니다");
        error.status = 403;
        next(error);
    };
}

exports.isNotLoggedIn = (req, res, next) => {
    let cookie = req.headers.cookie || "user=undefined";
    cookie = cookie.split('=')[1];
    if (cookie === 'undefined') {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
}