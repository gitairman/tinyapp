const { assert } = require('chai');

const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require('../helpers');

const testDb = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
};

const testUsers = {
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
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user1@example.com',
    password: 'abcd',
  },
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.equal(user.id, expectedUserID);
  });
  it('should return null if user does not exist in database', () => {
    const user = getUserByEmail('user@examp.com', testUsers);
    const expectedUser = null;
    assert.equal(user, expectedUser);
  });
  it('should return user object if user exists', () => {
    const user = getUserByEmail('user2@example.com', testUsers);
    const expectedUser = testUsers.user2RandomID;
    assert.deepEqual(user, expectedUser);
  });
});

describe('generateRandomString', () => {
  it('returns a random string of 6 characters by default', () => {
    const string = generateRandomString();
    const expected = 'abcdef';
    assert.equal(expected.length, string.length);
  });
  it('returns a random string of 10 characters when 10 passed in', () => {
    const string = generateRandomString(10);
    const expected = 10;
    assert.equal(expected, string.length);
  });
});

describe('urlsForUser', () => {
  it('returns urls created by user', () => {
    const urls = urlsForUser('aJ48lW', testDb);
    const expected = testDb;
    assert.deepEqual(urls, expected);
  });
  it('returns an empty object if no urls found', () => {
    const urls = urlsForUser('user2RandomID', testDb);
    const expected = {};
    assert.deepEqual(urls, expected);
  });
});
