'use strict';


//Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodoverride = require()
require('dotenv').config();

let bookArray = [];

//Applications
const app = express();
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

//Express maddleware
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride((request, response) => {
    if (request.body && typeof request.body === 'object' && '_method' in request.body) {
        let method = request.body._method;
        delete request.body._method;
        return method;
    }
}));

//sets the view engine for the template
app.set('view engine', 'ejs');

// Routes
app.get('/', grabFromBookshelf);
app.post('/searches', searchMaker);
app.post('/search', newSearch);
app.post('/books', bookMaker);
app.get('/pages/books/:book_id', getBookFromTable);
app.get('/pages/add/:book_index', saveOneBook);

// From client
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', problem => console.error(problem));

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

function Book(info, i) {
    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = info.title ? info.title : 'no title';
    this.authors = info.authors ? info.authors : 'no author';
    this.description = info.description ? info.description : 'no description';
    this.image = info.imageLinks ? info.imageLinks.thumbnail : placeholderImage;
    this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';

    console.log(this.image = info.imageLinks ? info.imageLinks.thumbnail : placeholderImage);
}

function updateBooks(request, response) {
    let { title, author, isbn, image_url, description, bookshelf } = request

    let sql = 'UPDATE task SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7';
    let values = [title, author, isbn, image_url, description, bookshelf, request.params.books_id]

    client.query(sql value)
        .then(response.redirect(`/`))
}

function saveOneBook(request, response) {
    const bookIndex = request.params.book.index;
    let sql = 'INSERT INTO books (title, author, isbn, image_url, description, bookshelf) VALUES ('
    let values = [bookArray[book]]

    client.query(sql, values);
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
    let i = 0
        .then(apiCall => apiCall.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
        .then(books => {
            bookArray = searchResults;
            response.render('pages/searches/show', { searchResults: books })
        })
        .then(result => )
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
    let value = [request.params.book_id];

    return client.query(SQL, value)
        .then(info => {
            response.render('pages/books/show', { book: info.rows[0] })
        })
        .catch(error => response.status(500).render('pages/error'), { error: 'yea yea yea, it sucks, we know' });
}