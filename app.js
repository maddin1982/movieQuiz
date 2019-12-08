const port = 3000;
let cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

//todo: check cors
app.use(cors())

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);
//db.defaults({ movies: [] }).write();

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

let getRandomMovie = (maxId, exceptTheseIds)=> {

  // todo: implement exceptTheseIds
  const randomId = 1 + Math.floor(Math.random() * maxId);

  let movie =  db.get('movies')
  .filter({id: randomId})
  .value()[0];

  // todo: implement randomness
  return {
    'title' : movie.movies[0],
    'image1' : movie.id + '_' + movie.movies[0],
    'image2' : movie.id + '_' + movie.movies[0],
    'image3' : movie.id + '_' + movie.movies[0],
    'answer' : 1
  }
};


app.get('/getRandomMovie', function(req,res){
  const movies_length = db.get('movies').size().value();
  let movie = getRandomMovie(movies_length);
  res.json(movie);
});


console.log('app listening on port', port);
app.listen(port);