const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const nunjucks = require('nunjucks');
const path = require('path');
const cors = require('cors');

const { sequelize } = require('./models');

const { swaggerUi, specs } = require('./swagger/swagger');
const userRouter = require('./routes/users');
const channelRouter = require('./routes/channel');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');
const chatRouter = require('./routes/chat');


dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

sequelize.sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((error) => {
        console.error(error);
    });

//middleware
app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extend: true }));

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
    cors({ origin: '*', credentials: true, }
    ));


// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//router
app.get('/', (req, res) => {
    res.render('index');
});

app.use('/users', userRouter);
app.use('/channels', channelRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/chats', chatRouter);

//error router
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다!!`);
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.locals.error = error;
    res.status(error.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트 대기중...');
});