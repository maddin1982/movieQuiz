/**
 * a ransom movie from the database with title and 3 images
 * @typedef {Object} Movie
 * @property {string} title - movie title
 * @property {string} image1 - image 1
 * @property {string} image2 - image 2
 * @property {string} image3 - image 3
 * @property {Number} answer - the correct image
 */

const states = {
  'START': 1,
  'TITLE': 2,
  'IMAGES': 3,
  'WINNER': 4
};
let currentState;

let points = {
  'player1' : 0,
  'player2' : 0
};
/**
 * the current Movie
 * @type {Movie}
 */
let currentMovie = null;




let setStateVisibility = () => {
  Object.keys(states).forEach((state) => {
    console.log('state')
    if(states[state] === currentState){
      $('#'+state + '_state').show()
    }
    else{
      $('#'+state + '_state').hide()
    }
  });
};

let setState = (state) => {
  currentState = state;
  setStateVisibility();

  // START
  if(state === states['START']){
    updatePoints(0,0);
  }

  // TITLE
  if(state === states['TITLE']) {
    setTimeout(() => {
      setState(states['IMAGES'])
    }, 2000);
  }
};

/**
 * update points
 * @param {Number} points_player1
 * @param {Number} points_player2
 */
let updatePoints = (points_player1, points_player2) => {
  points.player1 = points_player1;
  points.player2  = points_player2;
  document.getElementById('player1_points').innerHTML = points.player1;
  document.getElementById('player2_points').innerHTML = points.player2;
};

/**
 * update the dom with new movie
 * @param {Movie} movie - the new movie
 */
let updateMovie = (movie) => {
  console.log('new Movie', movie);
  currentMovie = movie;
  document.getElementById('movie').innerHTML = movie.title;
  document.getElementById('image1').setAttribute('src','http://localhost:3000/images/' + movie.image1 + '.jpg');
  document.getElementById('image2').setAttribute('src','http://localhost:3000/images/' + movie.image2 + '.jpg');
  document.getElementById('image3').setAttribute('src','http://localhost:3000/images/' + movie.image3 + '.jpg');
  setState(states['TITLE']);
};

let getNewMovie = () => {
  $.getJSON( "http://localhost:3000/getRandomMovie", updateMovie)
};

document.addEventListener("DOMContentLoaded", function() {
  setState(states.START);

  // stet interactions
  document.querySelector('.start-button').addEventListener('click', () => {
    getNewMovie();
  });

  document.addEventListener('keypress', (e) => {
      let keysPlayer1 = ['Digit1', 'Digit2',  'Digit3'];
      let keysPlayer2 = ['Digit4', 'Digit5', 'Digit6'];
      let key = e.code;

      if(keysPlayer1.indexOf(e.code) + 1 === currentMovie.answer) {
        updatePoints(points.player1 + 1, points.player2)
      }
      if(keysPlayer2.indexOf(e.code) + 1 === currentMovie.answer) {
        updatePoints(points.player1, points.player2 + 1)
      }
      getNewMovie();
  });


});