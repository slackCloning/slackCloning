const SocketIO = require('socket.io');

module.exports = (server, app) => {
    const io = SocketIO(server, {
        path: '/socket.io',
    });


    app.set('io', io);
    const workspace = io.of('/workspace');
    const channel = io.of('/channel');
    const chat = io.of('/chat');

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

};
