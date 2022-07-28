require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// local imports
const { userJoined, leaveRoom, getCurrentUser, getRoomUsers } = require("./utils/users");
const { formatMessage } = require("./utils/messages");

const app = express();
// ? create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

app.use(express.json());
app.use(morgan("combined", { stream: accessLogStream }));

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const serverName = "Mirror-Code";
// runs when a new client connects
io.on("connection", (socket) => {
  socket.on("join_room", ({ username, room }) => {
    if (!username) return;
    const user = userJoined(socket.id, username, room);
    socket.join(user.room);
    // notify the user that just joined
    socket.emit("message", formatMessage(serverName, "You joined a room."));
    // notify every user in the room except the user that just joined
    socket.broadcast.to(user.room).emit("message", formatMessage(serverName, `${user.username} joined the room.`));
    // Send users and room info
    io.to(user.room).emit("room_users", { room: user.room, users: getRoomUsers(user.room) });
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = leaveRoom(socket.id);
    if (user) {
      socket.leave();
      io.to(user.room).emit("message", formatMessage(serverName, `${user.username} has left the room`));
      // Send users and room info
      io.to(user.room).emit("room_users", { room: user.room, users: getRoomUsers(user.room) });
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
