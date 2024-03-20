const getUserByEmail = (email, usersDb) => {
  const allUsers = Object.values(usersDb);
  return allUsers.find((user) => user.email === email) || null;
};

const generateRandomString = (len = 6) => {
  let randIntArr = [];
  let count = len;
  while (count > 0) {
    let randInt = Math.floor(Math.random() * 26 + 1) + 64;
    let randCase = Math.floor(Math.random() * 2 + 1) === 1;
    if (randCase) randInt += 32;
    randIntArr.push(randInt);
    count--;
  }
  return String.fromCharCode(...randIntArr);
};

const urlsForUser = (id, urlDb) => {
  return Object.entries(urlDb).reduce((a, [urlId, { userID }]) => {
    if (userID === id) return { ...a, [urlId]: urlDb[urlId] };
    return a;
  }, {});
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
};
