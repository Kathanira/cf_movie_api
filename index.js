/*const bodyParser = require('body-parser');
const express = require('express');
    app = express();
    bodyParser = require('body-parser'),
    uuid = require('uuid');
    morgan = require('morgan');

    //fs = require('fs'), // import built in node modules fs and path 
    //path = require('path');

//const app = express();*/
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlix', { useNewUrlParser: true, useUnifiedTopology: true });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*let users = [
  {
    id: 1,
    name: "Max",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Jane",
    favoriteMovies: ["The Dark Knight"]
  },
];

let movies = [
  {
    "Title": "xxx",
    "Description": "",
    "Genre": {
      "Name": "Drama",
      "Description":"."
    },
    "Director":{
      "Name":"",
      "Bio":"",
      "Birth":1970,
    },
    "ImageURL":"",
    "Featured": false
  },
  {
    "Title": "yyy",
    "Description": "",
    "Genre": {
      "Name": "",
      "Description":""
    },
    "Director":{
      "Name":"",
      "Bio":"",
      "Birth":1970,
    },
    "ImageURL":"",
    "Featured": false
  },
  {
    "Title": "The Dark Knight",
    "Description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    "Genre": {
      "Name": "Action",
      "Description":"Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats. The genre tends to feature a mostly resourceful hero struggling against incredible odds, which include life-threatening situations, a dangerous villain, or a pursuit which usually concludes in victory for the hero."
    },
    "Director":{
      "Name":"Christopher Nolan",
      "Bio":"Over the course of 15 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made",
      "Birth":1970,
    },
    "ImageURL":"https://upload.wikimedia.org/wikipedia/commons/9/95/Christopher_Nolan_Cannes_2018.jpg",
    "Featured": false
  },
];

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
  ];*/

  app.use(morgan('common', {stream: accessLogStream}));
  app.use(express.static('public'));

  // GET requests
  app.get('/', (req, res) => {
    res.send('Welcome to my movie API!');
  });

  //CREATE
  /*app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser)
    } else{
      res.status(400).send('users need names')
    }
  });*/

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

  // UPDATE
  /*app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
      user.name = updatedUser.name;
      res.status(200).json(user);
    } else {
    res.status(400).send('no such user')
    }
  });*/

  // Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


    // CREATE
    /*app.post('/users/:id/:movieTitle', (req, res) => {
      const { id, movieTitle } = req.params;
  
      let user = users.find( user => user.id == id );
  
      if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
      } else {
      res.status(400).send('no such user')
      }
    });*/

  // Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});  

   // DELETE
    /*app.delete('/users/:id/:movieTitle', (req, res) => {
      const { id, movieTitle } = req.params;
  
      let user = users.find( user => user.id == id );
  
      if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
      } else {
      res.status(400).send('no such user')
      }
    });*/

// DELETE a movie to a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

    // DELETE 
    /*app.delete('/users/:id', (req, res) => {
      const { id } = req.params;
  
      let user = users.find( user => user.id == id );
  
      if (user) {
        users = users.filter( user => user.id != id);
        //json.json(users)
        res.status(200).send(`user ${id} has been deleted`);
      } else {
      res.status(400).send('no such user')
      }
    });*/

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


  // READ get movies
  /*app.get('/movies', (req, res) => {
    //res.json(topTenMovies);
    res.status(200).json(movies);
  });*/

// Get all movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});  

  // READ movies by title
  /*app.get('/movies/:title', (req, res) => {
    //const title = req.params.title;
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);

    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('no such movie')
    }
  });*/

// Get a movie by title
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

    // READ GENRE
    /*app.get('/movies/genre/:genreName', (req, res) => {
      //const title = req.params.title;
      const { genreName } = req.params;
      const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
  
      if (genre) {
        res.status(200).json(genre);
      } else {
        res.status(400).send('no such genre')
      }
    });*/

// Get a Movie by Genre
app.get('/movies/genre/:genreName', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
      // READ Director
     /* app.get('/movies/directors/:directorName', (req, res) => {
        //const title = req.params.title;
        const { directorName } = req.params;
        const director = movies.find(movie => movie.Director.Name === directorName).Director;
    
        if (director) {
          res.status(200).json(director);
        } else {
          res.status(400).send('no such director')
        }
      });*/

// Get a Movie by Director
app.get('/movies/directors/:directorName', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
}); 
  
  
  app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname });
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