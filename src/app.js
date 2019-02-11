const express = require('express');
const path = require('path');
const compress = require('compression');
const helmet = require('helmet');
const {redirectToHTTPS} = require('express-http-to-https');
const app = express();
app.enable('trust proxy', true);

app.use(redirectToHTTPS());
app.use(compress());
app.use(helmet());

app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/../views/index.html')));

app.get('/send', (req, res) => {
  console.log(`Name: ${req.query.name}`);
  console.log(`Email: ${req.query.email}`);
  console.log(`Message: ${req.query.message}`);
  res.redirect('https://asterdroid.ml/');
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${listener.address().port}.`)
});
