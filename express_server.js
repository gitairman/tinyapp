const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
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

const getUserByEmail = (email) => {
  const allUsers = Object.values(users);
  const foundUser = allUsers.find((user) => user.email === email);
  return foundUser ? foundUser : null;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];

  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars = { email: user ? user.email : '', urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars = user ? user : { email: '' };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const id = req.params.id;
  const templateVars = {
    id,
    longURL: urlDatabase[id],
    email: user ? user.email : '',
  };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const templateVars = user ? user : { email: '' };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Email and password cannot be blank!');
    return;
  }

  if (getUserByEmail(email) !== null) {
    res.status(400).send('User already exists with that email!');
    return;
  }
  let id = null;
  while (id === null || users.hasOwnProperty[id]) {
    id = generateRandomString();
  }
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie('user_id', id);
  console.log(users);

  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  let { longURL } = req.body;
  if (!longURL.includes('http')) longURL = 'https://' + longURL;

  let shortURL = null;
  while (shortURL === null || urlDatabase.hasOwnProperty[shortURL]) {
    shortURL = generateRandomString();
  }

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;

  let { editedURL } = req.body;
  if (!editedURL.includes('http')) editedURL = 'https://' + editedURL;
  urlDatabase[id] = editedURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
