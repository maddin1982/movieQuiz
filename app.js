const port = 3000;
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);
//db.defaults({ movies: [] }).write();

app.use(fileUpload());
app.use(express.static('public'));

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


console.log('app listening on port', port);
app.listen(port);