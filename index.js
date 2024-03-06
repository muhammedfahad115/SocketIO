const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt =require('jsonwebtoken')
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
require('dotenv').config();

const PORT =  3000;

app.use(cors());
let onlineUsers = []
io.on('connection', (socket) => {
    socket.on("addUser", (studentMessage)=>{
        // check the user already exists
        // console.log(studentMessage);
        const token = studentMessage.token;
        const decodeToken = jwt.verify(token,process.env.JWT_SECRET);
        const existingUser = onlineUsers.find((user)=>user.email === decodeToken.email)
        if(!existingUser){
            let newObj = {email: decodeToken.email , socketId: socket.id}
            onlineUsers.push(newObj);
        }
        // console.log('A user connected',onlineUsers);
    // console.log(onlineUsers);
    // if not exists push user object that contain userId and socketId
    
      socket.on('messagefromtheclient', (message) => {
        // Broadcast the received message to all connected clients
        // console.log(message.socketId);
        // console.log("message", message)
        const targetUser = onlineUsers.find((user)=>user.email === message.institutionsEmail.email)
        console.log("found", targetUser)
        if(targetUser){
            io.to(targetUser.socketId).emit('messagefromtheserver',{message: message.message , email: decodeToken.email });
        }
        console.log(message.message)
        // console.log(message.institutionsEmail)
      });
      socket.on("disconnectManually",(data)=>{
        console.log("DISCONNECTED", data.token)
      })
      console.log(onlineUsers)
  })
});

server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
