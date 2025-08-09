const sqlite3 = require('sqlite3').verbose();
const Post = require('./Post');


class subreddit {

    //constructor to hold the value of the subreddit which exists
    constructor(subName) {
        this.subName = subName;
        //used to instantiate and connect to the subreddits.db file 
        this.db = new sqlite3.Database('subreddits.db', (err) => {
            if (err) {
                console.error('Error connecting to subreddits.db:', err.message);
            }
        });
    }

     // Combined method to check subreddit existence and render main page of the sub 
     rendersubredditPage(req, res) {
        this.db.get(`SELECT * FROM subreddits WHERE name = ?`, [this.subName], (err, row) => {
            if (err) {
                return res.send('Error querying the database.');
            }
            
            if (row) {
                // Subreddit found, render the EJS template
                res.render('mainSub', { subName: this.subName });
            } else {
                // Subreddit not found
                res.send(`Subreddit r/${this.subName} not found!`);
            }
        });
    }

    //renders the createPost ejs file 
    renderCreatePostPage(req, res) {
        res.render('createPost', { subName: this.subName });
    }

    //handles case when post is created
    handleCreatePost(req, res) {
        //post title and content are taken from the req.body; these values are deinfed within the
        //createPost.ejs file 
        const { postTitle, postContent } = req.body;
        //this gets the id from the subreddit where the name is the subName (which is a global b/c
        //of the 'this' keyword in javascript). 
        this.db.get('SELECT id FROM subreddits WHERE name = ?', [this.subName], (err, row) => {
            //error message
            if (err) {
                console.log("this is the error message ", err.message)
                console.log("this is the error code ", err.code);
                return res.send('Error fetching subreddit. ', err.message, " ", err.code);
            }
            //if you find the row, then extract the id and store it in const subredditId
            if (row) {
                const subredditId = row.id;

                //then run the database and insert the subreddit it, title and content which you
                //got from reqBody and row.id into the table which is created for the posts
                //of the subreddit
                this.db.run(
                    'INSERT INTO posts (subreddit_id, title, content) VALUES (?, ?, ?)',
                    [subredditId, postTitle, postContent],
                    (err) => {
                        if (err) {
                            console.log(err.message);
                            console.log(err.code);
                            return res.send('Error inserting post into database.',);
                        }
                        //after inserting you are automatically redirected back to the subName branch
                        res.redirect(`/${this.subName}`);
                    }
                );
            } else {
                res.send(`Subreddit ${this.subName} not found.`);
            }
        });

    }

    //This takes all the posts which were created from a subreddit, puts them into an
    //array and then sends them into an ejs file 
    renderAllPostsPage(req, res) {
        // Fetch the subreddit ID based on the subName
        this.db.get('SELECT id FROM subreddits WHERE name = ?', [this.subName], (err, row) => {
            if (err) {
                return res.send('Error fetching subreddit.');
            }
            //this finds the subreddit id and where it exists and saves it to a constant
            if (row) {
                const subredditId = row.id;

                // this then gets all the posts from the posts table where the post has the 
                //subreddit id as what you want
                this.db.all('SELECT * FROM posts WHERE subreddit_id = ?', [subredditId], (err, posts) => {
                    if (err) {
                        return res.send('Error fetching posts.');
                    }

                    // this then takes the posts which are apart of this table and sends them
                    //in array format to the ejs file which exists 
                    res.render('ViewPosts', { subName: this.subName, posts });
                });
            } else {
                res.send(`Subreddit ${this.subName} not found.`);
            }
        });
    }

    

    //control flow area. Brought here from the app.js file where you will then be routed to 
    //whichever value your browser is at, "central location" for browsing
    static registerRoutes(app) {
        app.get('/:subName', (req, res) => {
            const subName = req.params.subName;
            const subredditInstance = new subreddit(subName);
            subredditInstance.rendersubredditPage(req, res);
        });

        //takes the createPost value send by the "creatPost" button in mainSub.ejf and sends
        //you to the renderCreatePostPage method here
        app.get('/:subName/create-post', (req, res) => {
            const subName = req.params.subName;
            const subredditInstance = new subreddit(subName);
            subredditInstance.renderCreatePostPage(req, res);
        });
        //this is to get the posted value from the actual post which is created and store both
        //the post and the actual post content onto a database by calling the handleCreatePost
        //method
        app.post('/:subName/submittedPost', (req, res) => {
            const subName = req.params.subName;
            const subredditInstance = new subreddit(subName);
            subredditInstance.handleCreatePost(req, res);
        });
        // This route is to view all the posts in a specific subreddit
        app.get('/:subName/view-posts', (req, res) => {
            const subName = req.params.subName; // Extract the subName from the URL
            const subredditInstance = new subreddit(subName); // Use the correct variable subName
            subredditInstance.renderAllPostsPage(req, res); // Call the method to render the posts page
        });

        // Catch-all route for viewing individual post in the subreddit
        Post.renderRoutes(app);  // Register post-related routes once here
    }

    


}

module.exports = subreddit;









