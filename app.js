const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();


app.use(express.static(path.join(__dirname, 'public_html')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'mainPage.html'));
  });


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Node.js app listening on port ${port}`);
});