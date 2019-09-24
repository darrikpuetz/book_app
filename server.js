'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const app = express();
const pg = require('pg');
require('dotenv').config();
app.use(cors());
app.use('public', express.static('public'));
app.set('view engine', 'ejs');
app.get('/', newSearch);
app.get('*', (request, response) => response.status(404).send('This route does not even exist'));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));




function searchMaker(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log(request.body);
  console.log(request.body.search);
  if (request.body.search[1] === 'title') { url += `Title: ${request.body.search[0]}` }
  if (request.body.search[1] === 'author') { url += `Author: ${request.body.search[0]}` }
  superagent.get(url)
    .then(apiCall => apiCall.body.items.map(searchResult => new Book(searchResult.volumeInfo)))
    .then(books => response.render('pages/searches/show', { searchResults: results }))
    .catch(error => response.status(500).render('pages/error'), { error: 'page not found' });
}

app.post('/searches', searchMaker);

function Book(info) {
  const stockImage = 'http://admin.johnsons.net/janda/files/flipbook-coverpage/nocoverimg.jpg'
  this.title = info.title ? info.title : 'no title';
  this.author = info.authors ? info.description : 'no description';
  this.image = info.imageLinks ? info.imageLinks.smallThumbnail : stockImage;
}

function newSearch(request, response) {
  response.render('pages/index');
}
