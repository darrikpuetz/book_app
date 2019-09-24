'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

app.get('/', newSearch);

app.post('/searches', searchMaker);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));


function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title';
  this.authors = info.authors ? info.authors : 'no author';
  this.description = info.description ? info.description : 'no description';
  this.image = info.imageLinks ? info.imageLinks.thumbnail : placeholderImage;
  console.log(this.image = info.imageLinks ? info.imageLinks.thumbnail : placeholderImage);
}

function newSearch(request, response) {
  response.render('pages/index');
}

function searchMaker(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiCall => apiCall.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(books => response.render('pages/searches/show', { searchResults: books }))
    .catch(err => response.status(500).render('pages/error'), { err: 'Sorry page not found' });
}
