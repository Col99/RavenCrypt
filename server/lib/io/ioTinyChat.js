var io = global.io;

var ioTinyChat = io.of('/tinyChat').on('connection', function (socket) {
        global.logger.info("NewConnection on /tinyChat From: " + socket.handshake.address.address);

        ioTinyChat.emit('userConnected', socket.handshake.tinyName + ' connected');

        socket.join('room');

        //socket.on('message', function (from, msg) {
        socket.on('message', function (msg) {

            var from = socket.handshake.tinyName;
            console.log(new Date().getTime() + ' - ' + from + ': ' + msg);

            //use rooms like this when not in '/'
            ioTinyChat.in('room').emit('message', from, msg);

        });

        socket.on('disconnect', function () {
            ioTinyChat.emit('userDisconnected', 'user disconnected');
        });
    }
);

global.logger.trace("Added TinyChat");