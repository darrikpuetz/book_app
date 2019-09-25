'use strict';

const express = require('express');
const app = express();
const pg = require('pg');
const superagent = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', problem => console.error(problem));

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

app.get('/', grabFromBookshelf);

app.post('/searches', searchMaker);
app.post('/search', newSearch);
app.post('/books', bookMaker);
app.get('/books/:book_id', getBookFromTable);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));


function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title';
  this.authors = info.authors ? info.authors : 'no author';
  this.description = info.description ? info.description : 'no description';
  this.image = info.imageLinks ? info.imageLinks.thumbnail : placeholderImage;
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';

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

function grabFromBookshelf(request, response) {
  let SQL = 'SELECT * from books;';
  return client.query(SQL)
    .then(results => {
      if (results.rows.rowCount === 0) {
        response.render('pages/search');
      } else {
        response.render('pages/index', { books: results.rows })
      }
    })
    .catch(error => response.status(500).render('pages/error'), { error: 'Stoooooooopid' });
}

function bookMaker(request, response) {
  let lowerCaseShelf = request.body.bookshelf.toLowerCase();
  let { title, author, isbn, image_url, description } = request.body;
  let SQL = 'INSERT INTO books(title, author, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6);';
  let values = [title, author, isbn, image_url, description, lowerCaseShelf];
  return client.query(SQL, values)
    .then(() => {
      SQL = 'SELECT * FROM books WHERE isbn=$1;';
      values = [request.body.isbn];
      return client.query(SQL, values)
        .then(result => response.redirect(`/books/${result.rows[0].id}`))
        .catch(error => response.status(500).render('pages/error'), { err: 'yea yea yea, it sucks, we know ' });
    })
    .catch(error => response.status(500).render('pages/error'), { err: 'yea yea yea, it sucks, we know' });
}

function getBookFromTable(request, response) {
  let SQL = `SELECT * from books WHERE id=${request.params.book_id};`;
  return client.query(SQL)
    .then(info => {
      response.render('pages/books/show', { book: result.rows[0] })
    })
    .catch(error => response.status(500).render('pages/error'), { error: 'yea yea yea, it sucks, we know' });
}
