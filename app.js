const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { createReadStream } = require('fs');
const { randomBytes } = require('crypto');

const COOKIE_SECRET = 'dashldhe128ewhgcvasdy7et2hvhwytt2';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser(COOKIE_SECRET));

// sessionID -> username
const SESSIONS = {}

// temporary database
const USERS = {
    'user1': 'password1',
    'user2': 'password2'
}

const BALANCES = {
  'user1': 500,
  'user2': 1000
}

// routing for  the homepage
app.get('/', (req, res) => {
  const sessionId = req.cookies.sessionId
  // getting stored username from the browser cookies
  const username = SESSIONS[sessionId];
  
  // checks for the username if it exists
  if (username) {
    const balance = BALANCES[username];
    res.send(`Hi ${username}! Your balance is ${balance}.`)
  }
  else{
    createReadStream('index.html').pipe(res);
  }
})

// routing for the login page
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = USERS[username]

  if (password === req.body.password){
    // getting the next sessionId from crypto lib
    const nextSessionId = randomBytes(16).toString('base64')
    // storing username after passwords validity
    res.cookie('sessionId', nextSessionId);
    SESSIONS[nextSessionId] = username;
    res.redirect('/');
  }
  else{
    // if password checks fail
    res.send('Failed to log in!')
  }

})

// routing for logout
app.get('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  // deleting the sessionId from temporary database
  delete SESSIONS[sessionId];
  // clearing the stored cookies sessionId
  res.clearCookie('sessionId');
  res.redirect('/');
})

// Server lisening to localhost and port 3000
app.listen(process.env.port || 3000);