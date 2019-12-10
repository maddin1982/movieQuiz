const port = 3000;
let cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

//todo: check cors
app.use(cors());

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


let getRandomMovieGroup = (maxId, exceptTheseIds)=> {
  let randomId =0;
  if(maxId>3){
    // todo: implement exceptTheseIds
    exceptTheseIds = exceptTheseIds || [];
    randomId = null;
    while(exceptTheseIds.indexOf(randomId)!== -1 || !randomId){
      randomId = 1 + Math.floor(Math.random() * maxId);
    }
  }

  return db.get('movies')
  .filter({id: randomId})
  .value()[0];
};


app.get('/getRandomMovie', function(req,res){
  const movieGroups_length = db.get('movies').size().value();
  let movie = getRandomMovieGroup(movieGroups_length);
  // todo: implement randomness

  let image1 = movie.movies[0];
  let image2 = movie.movies[1];
  let image3 = movie.movies[2];

  let imageGroupId1 = movie.id;
  let imageGroupId2 = movie.id;
  let imageGroupId3 = movie.id;

  if(image2 === undefined){
    let randomImageGroup = getRandomMovieGroup(movieGroups_length, [movie.id]);
    image2 = randomImageGroup.movies[0];
    imageGroupId2 = randomImageGroup.id;
  }
  if(image3 === undefined){
    let randomImageGroup = getRandomMovieGroup(movieGroups_length, [movie.id]);
    image3 = randomImageGroup.movies[0];
    imageGroupId3 = randomImageGroup.id;
  }

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