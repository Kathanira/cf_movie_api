const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const uuid = require("uuid");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
//app.use(cors());
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

mongoose.connect('mongodb://localhost:27017/myFlix', { useNewUrlParser: true, useUnifiedTopology: true });

  // GET requests
  app.get('/', (req, res) => {
    res.send('Welcome to my movie API!');
  });

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
/*app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
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
app.post('/users', (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
    .then((user) => {
      if (user) {
      //If the user is found, send a response that it already exists
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});*/
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false })
[ 
  check ('Username', 'Username is required').isLength({min: 5}),
  check ('Username', 'Username contains non alphanumeric character - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check ('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  // check validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
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
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
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
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
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
  /*app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });*/
  const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});