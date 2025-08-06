const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();

// Serve static files from the 'public_html' directory
app.use(express.static(path.join(__dirname, '../public_html')));

//used too parse a POST request in HTML file into data which can be stored in db
app.use(bodyParser.urlencoded({ extended: true }));

//this will instantiate a database sql object. This will also create a database file
//within your myApp folder on cPanel called 'users.db'
let db = new sqlite3.Database('users.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
  });

  //this creates the actual db. Serialize is automatic method to sequentialize ordering of 
  //steps too create db. Run method runs the database, with table created if not exists.
  //three different variables, id, user, passwd are created, with id being autoincremented
  //(the values inside quotes are commands for db)
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
  });

// Default route to serve signIn.html when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html', 'signIn.html'));
});

//is a post signal is sent (by clicking 'register'), then user will be guided too /register
//httep request. At this point, we extract user,passwd from req.body which through bodyparser
//was parsed into user friendly format earlier. We then run and insert the user and the 
//password into our database
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function (err) {
      if (err) {
        return console.error(err.message);
      }
      res.send('User registered successfully');
    });
  });


  // From the login option. user and paswd are taken from req body. The * option in db.get
  //selects all columns where username and password = ?, which is how the username and password
  //are extracted from the req.body and placed into sql too search in it's file. 
  //side note: app.post() has two value sin its interface: req,res; and with these we can do
  //a combination of different things by extracting from the html "post"
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        // Directly compare the plain text password
        if (password === row.password) {
          res.sendFile(path.join(__dirname, '../public_html', 'mainPage.html'));
        } else {
          res.send('Invalid credentials');
        }
      } else {
        res.send('Invalid credentials');
      }
    });
  });

  app.post('/create-subreddit', (req, res) => {
    // Redirect the user to the /createSub route
    res.redirect('/createSub');
});

app.get('/createSub', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html', 'createSub.html'));
});

//Here we will be intializing a database which will store all of the subreddits which exist
let subredditsDb = new sqlite3.Database('subreddits.db', (err) => {
  if (err) {
    return console.error('Error connecting to subreddits.db:', err.message);
  }
  console.log('Connected to the subreddits.db');
});

//we will then mark down how we want to organize this sqlite database here
subredditsDb.serialize(() => {
  subredditsDb.run(`
    CREATE TABLE IF NOT EXISTS subreddits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `);
});

//this has it such that each time the /login page is accessed, the particular file will be sent
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html', 'mainPage.html'));
});

//POST from the /make_sub so take in the /make_sub url and both store the recently added
//subreddit value into the newly created db 
app.post('/make_sub', (req, res) => {
  const subname = req.body.subname;  // assuming 'subname' is the field in the form

  subredditsDb.run(`INSERT INTO subreddits (name) VALUES (?)`, [subname], function (err) {
    if (err) {
      return res.send('Error: Subreddit name already exists or an error occurred.');
    }
    res.redirect('/login');
  });
});

// Catch all dynamic subreddit routes, if the / value after is not caught from the before pats, it 
//will be caught here
app.get('/:subName', (req, res) => {
  const subName = req.params.subName;
  subredditsDb.get(`SELECT * FROM subreddits WHERE name = ?`, [subName], (err, row) => {
    if (err) {
      return res.send('Error querying the database.');
    }
    
    if (row) {
      res.send(`Welcome to r/${subName}!`);
    } else {
      res.send(`Subreddit r/${subName} not found!`);
    }
  });
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Node.js app listening on port ${port}`);
});
