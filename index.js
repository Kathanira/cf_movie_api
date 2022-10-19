const express = require('express');
    morgan = require('morgan');

    fs = require('fs'), // import built in node modules fs and path 
    path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let topTenMovies = [
    {
      title: 'The Shawshank Redemption',
      author: 'Frank Darabont'
    },
    {
      title: 'The Godfather',
      author: 'Francis Ford Coppola'
    },
    {
      title: 'The Dark Knight',
      author: 'Christopher Nolan'
    },
    {
        title: 'The Godfather: Part II',
        author: 'Francis Ford Coppola'
    },
    {
        title: '12 Angry Men',
        author: 'Sidney Lumet'
    },
    {
        title: 'Schindler\'s List',
        author: 'Steven Spielberg'
    },
    {
        title: 'The Lord of the Rings: The Return of the King',
        author: 'Peter Jackson'
    },
    {
        title: 'Pulp Fiction',
        author: 'Quentin Tarantino'
    },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        author: 'Peter Jackson'
    },
    {
        title: 'The Good, the Bad and the Ugly',
        author: 'Sergio Leone'
    }
  ];

  app.use(morgan('common', {stream: accessLogStream}));
  app.use(express.static('public'));
  
  // GET requests
  app.get('/', (req, res) => {
    res.send('Welcome to my movie API!');
  });
  
  app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
  });
  
  app.get('/movies', (req, res) => {
    res.json(topTenMovies);
  });
  
  // Error 
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There was an error. Please try again later.');
  });

  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });