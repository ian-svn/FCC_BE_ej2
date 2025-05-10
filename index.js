require('dotenv').config();
var express = require('express');
var app = express();
var cors = require('cors');
var dns = require('dns');
var bodyParser = require('body-parser');

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

let urlDatabase = [];
let urlCounter = 1;

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;
  
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const existingUrl = urlDatabase.find(entry => entry.original_url === originalUrl);
  if (existingUrl) {
    return res.json({
      original_url: existingUrl.original_url,
      short_url: existingUrl.short_url
    });
  }

  const newUrl = {
    original_url: originalUrl,
    short_url: urlCounter
  };
  
  urlDatabase.push(newUrl);
  urlCounter++;

  res.json({
    original_url: newUrl.original_url,
    short_url: newUrl.short_url
  });
});

app.get('/api/shorturl/:shorturl', function (req, res) {
  const shortUrl = parseInt(req.params.shorturl);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'invalid url' });
  }
});

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

