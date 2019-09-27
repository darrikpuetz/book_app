
DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  image_url TEXT,
  isbn VARCHAR(255),
  description VARCHAR (300),
  bookshelf VARCHAR(255)
);

INSERT INTO books (author, title, image_url, isbn, description, bookshelf)  VALUES('Paul Harrison',
'The Disappearing Cheese',
'http://books.google.com/books/content?id=gF_5nml6D58C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
'ISBN_13 9780237527754',
'One night a foolish man was walking past the sea. His tummy was as empty as his head. But is that a cheese he sees in the water? He decides to find out.',
'Cheese Stuff');


INSERT INTO books (author, title, image_url, isbn, description, bookshelf) VALUES ('J. R. R. Tolkien',
'Who Cut the Cheese?',
'http://books.google.com/books/content?id=G5rqlCg8AZEC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
'ISBN_13 9781442433083',
'"Large helpings of whimsy, humorous black-and-white illustrations, and the occasional fart joke provide plenty of silliness" (Booklist) in the third Doctor Proctor adventure from New York Times bestselling author Jo Nesbø. Nilly, Lisa, and Doctor Proctor are too busy inventing things to watch TV, and everyone says theyre missing out on the hot singing competition. But then Nilly and Lisa notice that their friends and family are acting really weird. And the only people acting weird…are the ones watching TV. Whats going on is WAY bigger than a singing competition. It could mean the end of the world. Or a silent but deadly could save everything! Let er rip.',
'Funny');