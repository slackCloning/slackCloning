const SocketIO = require('socket.io');

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, {
        path: '/socket.io',
    });


    app.set('io', io);
    const workspace = io.of('/workspace');
    const channel = io.of('/channel');
    const chat = io.of('/chat');

    // io.use((socket, next) => {
    //     console.log(socket.request);
    //     sessionMiddleware(socket.request, socket.request.res, next);
    // });

    workspace.on('connection', (socket) => {
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('워크스페이스 접속!', ip, socket.id, req.ip);
        socket.on('disconnect', () => {
            console.log('클라이언트 접속 해제', ip, socket.id);
            clearInterval(socket.interval);
        });
        socket.on('error', (error) => {
            console.error(error);
        });
        socket.on('reply', (data) => {
            console.log(data);
        });
    });

    chat.on('connection', (socket) => {
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('Chat 접속!', ip, socket.id, req.ip);
        socket.on('disconnect', () => {
            clearInterval(socket.interval);
        });
        socket.on('error', (error) => {
            console.error(error);
        });
        socket.on('reply', (data) => {
            console.log(data);
        });
    });

};
