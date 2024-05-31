const SocketIO = require("socket.io");
// const io = require('socket.io')(80)

module.exports = (server) => {
    const io = SocketIO(server, {path:'/socket.io', cors: {
        origin: "http://localhost:3000"
        }});

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id)
        // either with send()
        socket.send('Hello!');

        io.emit("data", "hi");

        // or with emit() and custom event names
        socket.emit('greetings', 'Hey!');

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
    return io;
};