//Methods and/or sub-methods which are marked with a "possible deletion" section
//are serviced to be deleted once all checks have been run through
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const subreddit = require('./subreddit');
const Post = require('./Post');
//setting up the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public_html')));

app.use(bodyParser.urlencoded({ extended: true }));

//init databases. First is for users
let db = new sqlite3.Database('users.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
});

//init subreddit database
let subredditsDb = new sqlite3.Database('subreddits.db', (err) => {
  if (err) {
    return console.error('Error connecting to subreddits.db:', err.message);
  }
  console.log('Connected to the subreddits.db');
});

// In app.js, after your existing subreddits table creation:
subredditsDb.serialize(() => {
  subredditsDb.run(`
    CREATE TABLE IF NOT EXISTS subreddits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `);
    subredditsDb.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subreddit_id INTEGER,
      title TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subreddit_id) REFERENCES subreddits (id)
    )
  `);
});

// Default route to serve signIn.html when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html', 'signIn.html'));
});

//adds vals to db when registering in
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function (err) {
      if (err) {
        return console.error(err.message);
      }
      res.send('User registered successfully');
    });
  });


  //as user logs in, checks to see if cred. maps. If match, points them to mainPage
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

  app.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, '../public_html', 'mainPage.html'));
  });

/*
app.post('/create-subreddit', (req, res) => {
    // Redirect the user to the /createSub route
    res.redirect('/createSub');
});

app.get('/createSub', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html', 'createSub.html'));
});
*/
//POST from the /make_sub so take in the /make_sub url and both store the recently added
//subreddit value into the newly created db 
app.post('/make_sub', (req, res) => {
  console.log('=== /make_sub route hit ===');
  console.log('Full req.body:', req.body);
  
  const subname = req.body.subname;  // assuming 'subname' is the field in the form
  console.log('Extracted subname:', subname);
  console.log('Type of subname:', typeof subname);

  subredditsDb.run(`INSERT INTO subreddits (name) VALUES (?)`, [subname], function (err) {
    if (err) {
      console.error('Database error:', err.message);
      console.error('Error code:', err.code);
      console.error('SQL that failed:', `INSERT INTO subreddits (name) VALUES ('${subname}')`);
      return res.send(`Database Error: This subreddit already exists! Click back and input another sub name`);
    }
    console.log('Successfully inserted subreddit:', subname);
    console.log('Row ID:', this.lastID);
    res.redirect('/login');
  });
});

//calling routed vals from the subreddit.js and Post.js files
subreddit.registerRoutes(app);
Post.renderRoutes(app);


//POSSIBLE DELETION - rehashed code whcih is in subreddits.js
/*
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
*/


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Node.js app listening on port ${port}`);
});
