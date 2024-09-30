const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static(path.join(__dirname, 'public_html')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'mainPage.html'));
  });

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
  });