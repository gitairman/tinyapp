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

console.log(generateRandomString());

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];

  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const templateVars = {
    id,
    longURL: urlDatabase[id],
    username: req.cookies['username'],
  };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render('register', templateVars);
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
