import express from "express"
import {Server} from "socket.io"
import http from "http"

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server( { cors : {
   origin: [ allowedOrigin ] ,
}});

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}


const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() sends event to everyone - broadcast
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on is used to listen for events
  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };