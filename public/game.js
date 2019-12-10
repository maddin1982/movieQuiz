/**
 * a ransom movie from the database with title and 3 images
 * @typedef {Object} Movie
 * @property {string} title - movie title
 * @property {string} image1 - image 1
 * @property {string} image2 - image 2
 * @property {string} image3 - image 3
 * @property {Number} answer - the correct image
 */

const winningPoints = 3;

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

  switch (state) {
    case states.START:
      points.player1 = 0;
      points.player2  = 0;
      updatePoints();
      break;
    case states.TITLE:
      setTimeout(() => {
        setState(states['IMAGES'])
      }, 2000);
      break;
    case states.WINNER:
      document.getElementById('winner').innerHTML = points.player1 >= winningPoints ? 'player 1' : "player 2";
      break;
  }
};

/**
 * update points
 */
let updatePoints = () => {

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
  document.getElementById('movie').innerHTML = movie.title.split('_').join(' ');
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
  document.querySelectorAll('.start-button').forEach((button)=> button.addEventListener('click', () => {
    setState(states.START);
    getNewMovie();
  }));

  document.addEventListener('keypress', (e) => {
      if(currentState === states.IMAGES){
        const keysPlayer1 = ['Digit1', 'Digit2',  'Digit3'];
        const keysPlayer2 = ['Digit4', 'Digit5', 'Digit6'];

        // player one hit button
        if(keysPlayer1.indexOf(e.code) !== -1) {
          if(keysPlayer1.indexOf(e.code) + 1 === currentMovie.answer) {
            points.player1++;
          }else{
            points.player2++;
          }
        }
        else {
          // player two hit button
          if(keysPlayer2.indexOf(e.code) + 1 === currentMovie.answer) {
            points.player2++;
          }
          else{
            points.player1++;
          }
        }
        updatePoints();
        if(points.player1 >= winningPoints || points.player2 >= winningPoints){
          setState(states.WINNER)
        } else{
          getNewMovie();
        }

      }


  });


});