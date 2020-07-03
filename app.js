const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const router = require("./routes /routes.js");
const bodyParser = require("body-parser");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./services /service");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.json());
app.use(cors());
app.use(router);

io.on("connect", (socket) => {
  socket.on("join", ({ email, room }, callback) => {
    console.log(" err - > ", email, room);
    const { error, user } = addUser({ id: socket.id, email, room });
    // console.log(socket.id, "user : ", user, "name : ", name);
    if (error) return callback(error);
    socket.join(user.room);
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  //__________________________for one to one message____________________________________

  socket.on("1to1message", ({ message, user }) => {
    //socket.join(user);
    console.log("1 to 1", user, message);
    socket.emit("1to1message", { user: user, msg: message });
  });
  //_______________________________________________________________________________--

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", { user: user.name, text: message });
    }
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log("user disconnted ");
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 3001, () =>
  console.log(`chat server ready to serve `)
);
