const port = 3000;
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ images: [] }).write();

app.use(fileUpload());
app.use(express.static('public'));

app.post('/upload', function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const image = {
    id: 1,
    name: 'new Movie',
    linkedTo: '2'
  };

  db.get('images').push(image).write();

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(__dirname + '/images/filename.jpg', function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});


console.log('app listening on port', port);
app.listen(port)