const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken')
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
require('dotenv').config();

const PORT = 3000; 

app.use(cors());
let onlineUsers = []
io.on('connection', (socket) => {

    socket.on("addUser", (studentMessage) => {
        // check the user already exists
        const token = studentMessage.token;
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        const existingUser = onlineUsers.find((user) => user.email === decodeToken.email)
        if (!existingUser) {
            let newObj = { email: decodeToken.email, socketId: socket.id }
            onlineUsers.push(newObj);
        }

        // if not exists push user object that contain userId and socketId
        socket.on('messagefromtheclient', (message) => {
            // Broadcast the received message to all connected clients
            const targetUser = onlineUsers.find((user) => user.email === message.institutionsEmail.email)
            console.log("found", targetUser)
            if (targetUser) {
                io.to(targetUser.socketId).emit('messagefromtheserver', { message: message.message, senderEmail: decodeToken.email , recieverEmail:message.institutionsEmail.email});
            }
            console.log(message.message)
        });

        socket.on("disconnect", () => {
            const disconnectUserIndex = onlineUsers.findIndex((user)=> user.socketId == socket.id);
            if(disconnectUserIndex !== -1){
                const disconnectUser = onlineUsers[disconnectUserIndex];
                onlineUsers.splice(disconnectUserIndex, 1);
                console.log(`user with ${disconnectUser.email} this email with this ${disconnectUser.socketId} socketId has disconnceted the socket io `)
            }
            console.log(`socket ${socket.id} disconnected`);
            console.log(onlineUsers)
        })
        console.log(onlineUsers);
    })
});

server.listen(PORT, () => {
    console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
