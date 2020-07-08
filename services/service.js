const users = [];

const addUser = ({ id, email, room }) => {
  email = email.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.room === room && user.email === email
  );

  if (!email || !room) return { error: "Username and room are required." };
  if (existingUser) return { error: "Username is taken." };

  const user = { id, email, room };

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const getSocketId = (usrfrnd) => users.filter((user) => user.email === usrfrnd);

const checkifitsROom = (isroom) => users.filter((user) => user.room === isroom);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getSocketId,
  checkifitsROom,
};
