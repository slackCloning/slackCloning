const SocketIO = require('socket.io');
const Chat = require('./models/chat');

module.exports = (server, app) => {
    const io = SocketIO(server, {
        path: '/socket.io',
    });


    app.set('io', io);
    const workspace = io.of('/workspace');
    const channel = io.of('/channel');
    const chat = io.of('/chat');

    workspace.on('connection', (socket) => {
        console.log('워크스페이스 접속!');
        socket.on('disconnect', () => {
            console.log('클라이언트 접속 해제');
            clearInterval(socket.interval);
        });
        socket.on('error', (error) => {
            console.error(error);
        });
    });

    chat.on('connection', (socket) => {
        console.log('Chat 접속!');
        socket.on('disconnect', () => {
            clearInterval(socket.interval);
        });
        socket.on('error', (error) => {
            console.error(error);
        });
        socket.on('chat', async (data) => {
            const { dmsId, userId, chat } = data;
            const result = await Chat.create({
                dmsId,
                userId,
                chat,
            });
            io.of('chat').emit("receive", result);
        });
    });

};
