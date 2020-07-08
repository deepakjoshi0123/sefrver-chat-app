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
  getSocketId,
  checkifitsROom,
} = require("./services /service");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.json());
app.use(cors());
app.use(router);

io.on("connect", (socket) => {
  socket.on("join", ({ email, room }, callback) => {
    // console.log(" err - > ", email, room);
    const { error, user } = addUser({ id: socket.id, email, room });
    // console.log(socket.id, " right or wrong user : ", user);
    if (error) return callback(error);
    socket.join(user.room);
    socket.emit("message", {
      user: "admin",
      text: `${user.email}, welcome to room ${user.room}.`,
      time: new Date(new Date().getTime()).toLocaleTimeString(),
      addto: room,
    });

    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.email} has joined!`,
      time: new Date(new Date().getTime()).toLocaleTimeString(),
      addto: room,
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  //__________________________for one to one message______________________________________

  socket.on("1to1message", ({ message, user, usrfrnd }) => {
    console.log("is it same ", getSocketId(usrfrnd)[0].id);
    socket.to(getSocketId(usrfrnd)[0].id).emit("1to1message", {
      user: user,
      msg: message,
      frnd: usrfrnd,
    });
  });

  socket.on("acceptfrndreq", (usrfrnd) => {
    console.log("yesemitted", usrfrnd);
    console.log("why not going", getSocketId(usrfrnd)[0].id);
    socket.to(getSocketId(usrfrnd)[0]).emit("acceptfrndreq", {
      usrfrnd: usrfrnd,
    });
  });

  // socket.on("sendMessagePVT", (message, sendby, sento) => {
  //   socket.to(getSocketId(sentto)).emit({ message: message });
  // });

  //__________________________________________________________________________________________________

  socket.on("sendMessage", (message, activetab, callback) => {
    console.log("send msg ", message);
    const user = getUser(socket.id);
    let IsRoom = checkifitsROom(activetab);
    if (IsRoom) {
      console.log("check what is this ? ", IsRoom[0].room);
      io.to(IsRoom[0].room).emit("message", {
        user: user.email,
        text: message,
        time: new Date(new Date().getTime()).toLocaleTimeString(),
        addto: activetab,
      });
    }
    callback();
    //const user = getSocketId(activetab)[0]; // to get who sended this msg  , to get sender(client) socket id
    console.log("deepak", activetab);

    // if (user && checkifitsROom(activetab)) {
    //   console.log("yes emitting ");
    //   io.to(user.room).emit("message", {
    //     user: user.email,
    //     text: message,
    //     time: new Date(new Date().getTime()).toLocaleTimeString(),
    //     addto: activetab,
    //   });
    // } else {
    //   socket.to(getSocketId(activetab)[0].id).emit("message", {
    //     user: user.email,
    //     text: message,
    //     time: new Date(new Date().getTime()).toLocaleTimeString(),
    //     addto: activetab,
    //}
    // }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    // console.log("user disconnted ");
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.email} has left.`,
        addto: user.room,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 3001);
