const express = require('express');
const methodOverride = require('method-override');
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
app.use(express.json());
app.use(
  cookieSession({
    secret: 'sophieIsTheBest',
  })
);
app.use(methodOverride('_method'));

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
    created: Date.now(),
    visited: {},
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
    created: Date.now(),
    visited: {},
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
  const userId = req.session?.user_id;
  res.redirect(userId ? '/urls' : '/login');
});

app.get('/u/:id', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.render('error', {
      ...(user ? user : {}),
      error: `'${id}' does not exist!`,
    });
  }

  urlDatabase[id].visited[Date.now()] = user ? user.email : 'anonymous';
  console.log(urlDatabase);

  const { longURL } = urlDatabase[id];

  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) return res.render('urls_index');

  const user = users[userId];
  const urls = urlsForUser(userId, urlDatabase);

  const templateVars = {
    ...user,
    urls,
  };

  res.render('urls_index', templateVars);
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
  const created = new Date(Date.now()).toDateString();

  urlDatabase[shortURL] = {
    created,
    longURL,
    userID,
    visited: {},
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) return res.redirect('/login');
  const user = users[userId];
  const templateVars = user;
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const id = req.params.id;
  let error = null;

  if (!urlDatabase[id]) {
    res.status(404);
    error = `'${id}' does not exist!`;
  }
  if (!userId && !error) {
    res.status(403);
    error = `'${id}' cannot be displayed until you are logged in!`;
  }
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!userUrls[id] && !error) {
    res.status(403);
    error = `'${id}' does not belong to you!`;
  }
  if (error) res.append('error', error);

  const templateVars = {
    ...urlDatabase[id],
    id,
    email: user ? user.email : '',
    error,
  };

  res.render('urls_show', templateVars);
});

app.put('/urls/:id', (req, res) => {
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
    return res.render('login', {
      error: `No user found with email '${email}'!`,
    });
  }
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    res.status(403);
    return res.render('login', {
      error: `Password ${password} for ${email} is incorrect!`,
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
    return res.render('register', {
      error: 'Email and password cannot be blank!',
    });
  }

  if (getUserByEmail(email, users) !== null) {
    res.status(400);
    return res.render('register', {
      error: `User already exists with email ${email}!`,
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

app.delete('/urls/:id/', (req, res) => {
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
