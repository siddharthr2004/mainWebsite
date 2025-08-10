const sqlite3 = require('sqlite3').verbose();

class Post {
    
    // This method handles the logic for rendering the main post
     // This method handles the logic for rendering the main post
     static mainPost(req, res) {
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

    static addComment(req, res) {
        const {subName, postId} = req.params;
        const { commentContent } = req.body;  // Extract comment content from the form submission
        //req.session.user_id;  // Get the logged-in user's ID from session
        const username = req.session.username;  // Get the logged-in user's username from session


        const db = new sqlite3.Database('subreddits.db', (err) => {
            if (err) {
                return console.error('error with connection' + err.message)
            }
        })

    // Insert the comment into the comments table
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

    }

    static viewComments(req, res) {
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
                db.all('SELECT user_id, content FROM comments WHERE post_id = ?', [postId], (err, comments) => {
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
            Post.mainPost(req, res);  // Call the method to handle rendering
        });
        app.get('/:subName/viewPost/:postId/create-comment', (req, res) => {
            const { subName, postId } = req.params;
            // Render the form for creating a comment
            res.render('createComment', { subName, postId });
        });
        app.post('/:subName/viewPost/:postId/commentCreated', (req, res) => {
            Post.addComment(req, res)
        });
        app.get('/:subName/viewPost/:postId/view-comments', (req, res) => {
            Post.viewComments(req, res);
        });
    }
}

module.exports = Post;
