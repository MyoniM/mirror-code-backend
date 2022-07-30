require("dotenv").config();

const express = require("express");
const moment = require("moment");

// local imports
const { userJoined, leaveRoom, getCurrentUser, getRoomUsers } = require("./utils/users");
const { formatMessage } = require("./utils/messages");
const { generateFile } = require("./generateFile");
const { executePython } = require("./core/executePython");

const app = express();
app.use(express.json());
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
    socket.to(user.room).emit("message", formatMessage(serverName, `${user.username} joined the room.`));
    // Send users and room info
    io.to(user.room).emit("room_users", { joinedUser: user.username, users: getRoomUsers(user.room) });
    console.log(user);
  });

  // Runs when a user joins a room and tries to sync
  socket.on("sync_code", ({ room, code }) => {
    io.to(room).emit("code_change", code);
  });

  // Runs when code changes
  socket.on("code_change", ({ room, code }) => {
    socket.to(room).emit("code_change", code);
  });

  // Runs when user executes code
  socket.on("execute_code", async ({ room, payload }) => {
    const { language, code } = payload;
    // get time stamp for code execution
    const startDate = new Date();
    const submittedAt = moment(startDate).toString();
    let endDate;
    let executionTime;
    // tell users in the room that code is being executed
    socket.to(room).emit("code_executing");
    // execute the code
    try {
      const filePath = generateFile(language, code);
      const output = await executePython(filePath);
      endDate = new Date();
      executionTime = moment(endDate).diff(submittedAt, "millisecond", true);
      // return the result for every user in the room
      io.to(room).emit("run_result", { submittedAt: moment(submittedAt).format("h:mm:ss a"), executionTime, output });
    } catch (_) {
      io.to(room).emit("run_result", {
        submittedAt: submittedAt.format("h:mm:ss a"),
        executionTime: executionTime ?? ">1000",
        output: { data: "stdout maxBuffer length exceeded. Maybe there is a long running loop in your code?", stderr: true },
      });
    }
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
