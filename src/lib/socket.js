import { Server } from "socket.io"
import http from "http"
import express from "express"


const app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});

const userSockets = {};

export function getReceiverSocketId(userId) {
    return userSockets[userId];
}

io.on("connection", (socket) => {
    //console.log("user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSockets[userId] = socket.id;

    io.emit("onlineUsers", Object.keys(userSockets));

    socket.on("disconnect", () => {
        //console.log("user disconnected", socket.id);
        if (userSockets[userId] === socket.id) {
            delete userSockets[userId];
        }
        io.emit("onlineUsers", Object.keys(userSockets));
    });
});


export { app, server, io }
