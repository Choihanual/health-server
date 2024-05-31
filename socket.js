const SocketIO = require("socket.io");
// const io = require('socket.io')(80)
module.exports = (server) => {
    const io = SocketIO(server, {path:'/socket.io'});
    console.log("hihihi")
    io.on("connection", (socket) => {
        console.log("hihi")
        // either with send()
        socket.send('Hello!');

        // or with emit() and custom event names
        socket.emit('greetings', 'Hey!', { 'ms': 'jane' }, Buffer.from([4, 3, 3, 1]));

        // handle the event sent with socket.send()
        socket.on('message', (data) => {
            console.log("hihi");
            console.log(data);
        });

        // handle the event sent with socket.emit()
        socket.on('salutations', (elem1, elem2, elem3) => {
            console.log(elem1, elem2, elem3);
        });
    });
};