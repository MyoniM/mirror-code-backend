const users = [
  // { id:"54545asdasdasd", username:"test", room:"xyz" }
];

// join user to code space
const userJoined = (id, username, room) => {
  const user = { id, username, room };
  users.push(user);
  return user;
};

// User leaves code space
const leaveRoom = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
};

// Get current user
const getCurrentUser = (id) => {
  return users.find((user) => user.id === id);
};

// Get room users
const getRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  userJoined,
  leaveRoom,
  getCurrentUser,
  getRoomUsers,
};
