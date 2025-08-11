const sqlite3 = require('sqlite3').verbose();

class Post {

    constructor(subreddit, postNumber) {
        this.subreddit = subreddit;
        this.postNumber = postNumber;
         this.db = new sqlite3.Database('subreddits.db', (err) => {
            if (err) {
                console.error('Error connecting to subreddits.db:', err.message);
            }
        });
    }
    
    // This method handles the logic for rendering the main post
     // This method handles the logic for rendering the main post
      mainPost(req, res) {
        const { subName, postId } = req.params; // Extract subName and postId from req.params
        // Connect to the database
        const db = new sqlite3.Database('subreddits.db', (err) => {
            if (err) {
                return console.error('Error connecting to subreddits.db:', err.message);
            }
        });

        // Fetch the post title from the database using the postId
        db.get('SELECT title FROM posts WHERE id = ?', [postId], (err, row) => {
            if (err) {
                return res.send('Error fetching post title.');
            }

            if (row) {
                const postTitle = row.title; // Extract the title from the database row
                // Render the EJS file with subName, postId, and postTitle
                res.render('mainPost', { subName, postId, postTitle });
            } else {
                res.send('Post not found.');
            }
        });
    }

     addComment(req, res) {
        const {subName, postId} = req.params;
        const { commentContent } = req.body;  // Extract comment content from the form submission
        //req.session.user_id;  // Get the logged-in user's ID from session
        const username = req.session.username;  // Get the logged-in user's username from session

        //instantiate the db first
        const db = new sqlite3.Database('subreddits.db', (err) => {
            if (err) {
                return console.error('error with connection' + err.message)
            }
        })

        // Insert the comment into the comments table
        this.db.get('SELECT * FROM posts WHERE id = ? AND subreddit_id = ?', [postId, subredditId], (err, row) => {
            //error message
            if (err) {
                console.log("this is the error message ", err.message)
                console.log("this is the error code ", err.code);
                return res.send('Error fetching subreddit. ' + err.message + " " + err.code);
            }
            if (row) {
                this.db.run('INSERT INTO comments (post_id, content, username) VALUES (?,?,?)', [postId, 
                    commentContent, username], (err) => {
                        if (err) {
                            console.log("Error inserting comment in due to: ", err.message());
                            return res.send("error inserting message");
                        }
                        this.db.close();
                        res.redirect(`/${subName}/viewPost/${postId}`);
                    });

            }
        });
    /*
    db.run(
        'INSERT INTO comments (post_id, content, username) VALUES (?, ?, ?)',
        [postId, commentContent, username],
        function (err) {
            if (err) {
                console.log("this is the error message for inserting a comment: ", err.message());
                return res.send('Error inserting comment into database: ' + err.message);
            }
            db.close();
            // After the comment is successfully added, redirect back to the post or wherever you want
            res.redirect(`/${subName}/viewPost/${postId}`);
        }
    );
    */

    }

     viewComments(req, res) {
        const {subName, postId} = req.params;

        const db = new sqlite3.Database('subreddits.db', (err) => {
            if (err) {
                return console.error('error connecting', err.message);
            }
        })

        db.get('SELECT title, content FROM posts WHERE id = ?', [postId], (err, post) => {
            if (err) {
                res.send('error fetching post detailes')
            }

            if (post) {
                db.all('SELECT username, content FROM comments WHERE post_id = ?', [postId], (err, comments) => {
                    if (err) {
                        return res.send('Error fetching comments')
                    }
                    res.render('viewComments', {
                        subName: subName,
                        postId: postId,
                        postTitle: post.title,
                        postContent: post.content,
                        comments: comments
                    });
                });
            } else {
                res.send('Post not found.');
            }
        });
    }

    // This method will register the routes
    static renderRoutes(app) {
        // Define the route for viewing a specific post
        app.get('/:subName/viewPost/:postId', (req, res) => {
            const subName = req.params.subName;
            const postId = req.params.postId;
            const postInstance = new Post(subName, postId);
            postInstance.mainPost(req, res);  // Call the method to handle rendering
        });
        app.get('/:subName/viewPost/:postId/create-comment', (req, res) => {
            const subName = req.params.subName;
            const postId = req.params.postId;
            const postInstance = new Post(subName, postId);
            postInstance.render('createComment', { subName, postId });
        });
        app.post('/:subName/viewPost/:postId/commentCreated', (req, res) => {
            const subName = req.params.subName;
            const postId = req.params.postId;
            const postInstance = new Post(subName, postId);
            postInstance.addComment(req, res)
        });
        app.get('/:subName/viewPost/:postId/view-comments', (req, res) => {
            const subName = req.params.subName;
            const postId = req.params.postId;
            const postInstance = new Post(subName, postId);
            postInstance.viewComments(req, res);
        });
    }
}

module.exports = Post;
