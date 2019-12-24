const port = 3000;
let cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');

//todo: check cors
app.use(cors());

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);
//db.defaults({ movies: [] }).write();

db._.mixin({
  getRandom: function(array, exceptTheseIds) {
    let filteredArray = array.filter(item => exceptTheseIds.indexOf(item.id) === -1);
    return filteredArray[Math.floor(Math.random() * (filteredArray.length-1))]
  }
});

app.use(fileUpload());
app.use(express.static('public'));
app.use('/images', express.static('images'));

app.post('/upload', function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let lastIndex = db.get('lastIndex')|| 0;
  lastIndex++;
  let movies = [];

  for(let file in req.files) {
    let filmName = req.body[file + '_name'];
    filmName = filmName.split(' ').join('_');
    movies.push(filmName);

    req.files[file].mv(__dirname + '/images/' + lastIndex + '_' +filmName + '.jpg', function(err) {
      if (err)
        return res.status(500).send(err);
    });
  }

// Increment count
  db.get('movies').push({'id':lastIndex, 'movies' : movies}).write();
  db.set('lastIndex', lastIndex).write();
  res.redirect('/');
});


app.get('/movies', function(req, res) {
  res.json(db.get('movies'));
});

app.get('/movieNames', function(req, res) {
  res.json(db.get('movies').map((movieGroup)=> {return movieGroup.movies}));
});


let getRandomMovieGroup = (exceptTheseIds) => {
  return db.get('movies')
  .filter((item) => exceptTheseIds.indexOf(item.id) === -1)
  .sample()
  .value();
};

app.get('/deleteMovie', function(req, res) {
  //db.set('lastIndex', lastIndex).write();
  let deletedMovieGroup = db.get('movies')
  .remove({ id: parseInt(req.query.id) })
  .write();

  if(deletedMovieGroup && deletedMovieGroup.length>0){
    deletedMovieGroup[0].movies.forEach(movie => {
      const path = __dirname +'/images/'+ deletedMovieGroup[0].id + '_' + movie + '.jpg';
        fs.unlink(path, (err) => {
        if (err) {
          console.error(err);
          return;
        } else {
          console.log('removed file', path)
        }
      })
    })
  }

  res.redirect('/');
});

app.get('/getRandomMovie', function(req,res){
  //const movieGroups_length = db.get('movies').size().value();
  let movie = getRandomMovieGroup([]);

  // try to set all 3 movies from first moviegroup
  let image1 = movie.movies[0];
  let image2 = movie.movies[1];
  let image3 = movie.movies[2];

  let imageGroupId1 = movie.id;
  let imageGroupId2 = movie.id;
  let imageGroupId3 = movie.id;

  // in case second movie is not set
  if(image2 === undefined){
    let randomImageGroup = getRandomMovieGroup([imageGroupId1]);
    image2 = randomImageGroup.movies[Math.floor(Math.random()*randomImageGroup.movies.length)];
    imageGroupId2 = randomImageGroup.id;
  }

  // in case third movie is not set
  if(image3 === undefined){
    let randomImageGroup = getRandomMovieGroup([imageGroupId1,imageGroupId2]);
    image3 = randomImageGroup.movies[Math.floor(Math.random()*randomImageGroup.movies.length)];
    imageGroupId3 = randomImageGroup.id;
  }

  //todo: mix this up so that movie 1 isn't always the right one

  let movieJson =  {
    'title' : movie.movies[0],
    'image1' : imageGroupId1 + '_' + image1,
    'image2' : imageGroupId2 + '_' + image2,
    'image3' : imageGroupId3 + '_' + image3,
    'answer' : 1
  };
  res.json(movieJson);
});


console.log('app listening on port', port);
app.listen(port);