const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
} = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    secret: 'sophieIsTheBest',
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
};

const users = {
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user@example.com',
    password: 'abcd',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/u/:id', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.render('error', {
      ...(user ? user : {}),
      message: `'${id}' does not exist!`,
    });
  }

  const { longURL } = urlDatabase[id];

  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {
    ...(user ? user : {}),
    urls: urlsForUser(userId, urlDatabase),
  };

  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) return res.redirect('/login');
  const user = users[userId];
  const templateVars = user;
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.status(403).send('You must be logged in to shorten URLs!');
  }

  let { longURL } = req.body;
  if (!longURL.includes('http')) longURL = 'https://' + longURL;

  let shortURL = null;
  while (shortURL === null || urlDatabase.hasOwnProperty[shortURL]) {
    shortURL = generateRandomString();
  }

  urlDatabase[shortURL] = {
    longURL,
    userID,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;

  if (!urlDatabase[id]) {
    res.status(404);
    return res.render('error', {
      ...user,
      message: `'${id}' does not exist!`,
    });
  }
  if (!userId) {
    res.status(403);
    return res.render('error', {
      ...user,
      message: `'${id}' cannot be displayed until you are logged in!`,
    });
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!userUrls[id]) {
    res.status(403);
    return res.render('error', {
      ...user,
      message: `'${id}' does not belong to you!`,
    });
  }
  const { longURL } = urlDatabase[id];
  const templateVars = {
    id,
    longURL,
    email: user ? user.email : '',
  };

  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send(`'${id}' does not exist!`);
  }
  if (!userId) {
    return res
      .status(403)
      .send(`'${id}' cannot be edited until you are logged in!`);
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!userUrls[id]) {
    return res.status(403).send(`'${id}' does not belong to you!`);
  }

  let { editedURL } = req.body;
  if (!editedURL.includes('http')) editedURL = 'https://' + editedURL;
  urlDatabase[id].longURL = editedURL;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = user;
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(403);
    return res.render('error', {
      message: `No user found with email '${email}'!`,
    });
  }
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    res.status(403);
    return res.render('error', {
      message: `Password ${password} for ${email} is incorrect!`,
    });
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = user;
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    return res.render('error', {
      message: 'Email and password cannot be blank!',
    });
  }

  if (getUserByEmail(email, users) !== null) {
    res.status(400);
    return res.render('error', {
      message: `User already exists with email ${email}!`,
    });
  }
  let id = null;
  while (id === null || users.hasOwnProperty[id]) {
    id = generateRandomString();
  }
  const hashed = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashed,
  };

  req.session.user_id = id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send(`'${id}' does not exist!`);
  }
  if (!userId) {
    return res
      .status(403)
      .send(`'${id}' cannot be deleted until you are logged in!`);
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!userUrls[id]) {
    return res.status(403).send(`'${id}' does not belong to you!`);
  }

  delete urlDatabase[id];

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});
