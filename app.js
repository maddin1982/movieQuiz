const port = 3000;
let cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const basicAuth = require('express-basic-auth');
const ws = require('ws');
const WebSocketServer = ws.Server;
const SerialPort = require('serialport');

const wss = new WebSocketServer({port: 40510});

let wsClients = [];

wss.on('connection', function (ws) {
  ws.send('testnachricht');
  wsClients.push(ws);
});


// low db
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

/*
 * SERIAL PORT
*/

const serialport = new SerialPort("COM6", {baudRate: 9600}, false);

serialport.open((err) => {
  if (err) {
    console.log(err);
    return;
  }
  serialport.on('data', data => {
    let value = parseInt(data.toString());
    //console.log('Data from Arduino:', data, '->', data.toString(), '->', value);
    wsClients.forEach(wsClient => {
        wsClient.send(value);
      }
    )
  })
});


// Open errors will be emitted as an error event
serialport.on('error', function(err) {
  console.log('Error: ', err.message)
});


/*
 * AUTHENTICATION
 */
const myArgs = process.argv.slice(2);
if (!myArgs || myArgs[0] !== "noAuth") {
  app.use(basicAuth({
    users: {'kazoosh': 'phase4quiz'},
    challenge: true,
    realm: 'Imb4T3st4pp'
  }));
} else {
  console.log('run without auth')
}
/*
 * CORS
 */
app.use(cors());

/*
 * SERVER AND ROUTES
 */
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

app.post('/update', function(req, res) {
  const idToUpdate = req.body.updateId;
  //loop all possible file names

  const movieGroupSelect = db.get('movies').find((item) => {return item.id == idToUpdate});

  let movieGroup = movieGroupSelect.value();
  for(let i=0;i<3;i++) {

    // get movie name from upload form
    let fileName = req.body['file'+(i+1)+'_name'];


    if(fileName && fileName !== '') {
      // rename file
      const fileNameWithLowdashs = fileName.split(' ').join('_');
      const from = __dirname + '/images/' + idToUpdate + '_' +movieGroup.movies[i] + '.jpg';
      const to = __dirname + '/images/' + idToUpdate + '_' +fileNameWithLowdashs + '.jpg';

      const newUploadedFileForThisMovie =  req.files ? req.files['file' + (i+1)] : null;

      if(newUploadedFileForThisMovie) {
        // delete old movie image
        if (fs.existsSync(from)) {
          fs.unlinkSync(from);
        }
        // upload new
        newUploadedFileForThisMovie.mv(to, function(err) {
          if (err)
            return res.status(500).send(err);
        });
      } else{
        // just rename movies
        if (fs.existsSync(from)) {
          fs.rename(from, to, function (err) {
            if (err) throw err;
            console.log('renamed' );
          });
        }
      }
      movieGroup.movies[i] = fileNameWithLowdashs;
    } else {
      // check if there was a db entry and delete it if it existed, also delete the file
      if(movieGroup.movies[i] !== undefined && movieGroup.movies[i] !== null) {
        const filetoDelete = __dirname + '/images/' + idToUpdate + '_' + movieGroup.movies[i] + '.jpg';
        if (fs.existsSync(filetoDelete)) {
          fs.unlinkSync(filetoDelete);
        }
        movieGroup.movies.splice(i,1);
      }
    }
  }

  movieGroupSelect
  .assign(movieGroup)
  .write();

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
  let randomImageGroup = getRandomMovieGroup([]);
  let imageGroupId1 = randomImageGroup.id;
  let imageGroupId2 = randomImageGroup.id;
  let imageGroupId3 = randomImageGroup.id;


  // try to set all 3 movies from first moviegroup
  let image1 = randomImageGroup.movies[0];
  let image2 = randomImageGroup.movies[1];
  let image3 = randomImageGroup.movies[2];

  if(image2){
    //randomly switch movie 1 and 2
    if(Math.random()> 0.4) {
      let temp = image1;
      image1= image2;
      image2 = temp;
    }
  } else {
      // in case second movie is not set get new random movie group
      let randomImageGroup = getRandomMovieGroup([imageGroupId1]);
      // pick random movie from the random group
      image2 = randomImageGroup.movies[Math.floor(Math.random()*randomImageGroup.movies.length)];
      imageGroupId2 = randomImageGroup.id;
  }


  if(image3){
    //randomly switch movie 2 and 3
    if(Math.random()> 0.4) {
      let temp = image2;
      image2= image3;
      image3 = temp;
    }
  } else {
    // in case third movie is not set get new random movie group
    let randomImageGroup = getRandomMovieGroup([imageGroupId1,imageGroupId2]);
    // pick random movie from the random group
    image3 = randomImageGroup.movies[Math.floor(Math.random()*randomImageGroup.movies.length)];
    imageGroupId3 = randomImageGroup.id;
  }

  // get random number between 1 and 3 to mix selected movies so that movie 1 isn't always the right one
  let rand = Math.floor(Math.random()*3) + 1;

  let movieJson =  {
    'title' : image1,
    'answer' : rand
  };

  movieJson['image' + rand] = imageGroupId1 + '_' + image1;
  movieJson['image' + ((rand)%3+ 1)] = imageGroupId2 + '_' + image2;
  movieJson['image' + ((rand+1)%3 +1)] = imageGroupId3 + '_' + image3;

  res.json(movieJson);
});


console.log('app listening on port', port);
app.listen(port);
