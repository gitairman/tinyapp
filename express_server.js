const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

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
  console.log(req.params.id);

  const longURL = urlDatabase[req.params.id];
  console.log(longURL);

  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const templateVars = { id, longURL: urlDatabase[id] };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  let { longURL } = req.body;
  if (!longURL.includes('http')) longURL = 'https://' + longURL;

  const randStr = generateRandomString();
  urlDatabase[randStr] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randStr}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
