/**
 * a ransom movie from the database with title and 3 images
 * @typedef {Object} Movie
 * @property {string} title - movie title
 * @property {string} image1 - image 1
 * @property {string} image2 - image 2
 * @property {string} image3 - image 3
 * @property {Number} answer - the correct image
 */

const winningPoints = 5;

const states = {
  'START': 1,
  'TITLE': 2,
  'IMAGES': 3,
  'SCORE': 4,
  'WINNER': 5
};
let currentState;

let points = {
  'player1': 0,
  'player2': 0
};

let playerColors = {
  'player1': [155, 102, 102],
  'player2': [155, 0, 200]
}

let nextPointsForPlayer = ""

/**
 * the current Movie
 * @type {Movie}
 */
let currentMovie = null;

//const url = '173.212.239.184';
const url = window.location.hostname;

let setStateVisibility = () => {
  Object.keys(states).forEach((state) => {
    if (states[state] === currentState) {
      $('#' + state + '_state').show()
    }
    else {
      $('#' + state + '_state').hide()
    }
  });
};

let setState = (state) => {
  currentState = state;

  setStateVisibility();

  switch (state) {
    case states.START:
      points.player1 = 0;
      points.player2 = 0;
      updatePoints();
      break;
    case states.TITLE:
      // reset image overlay 
      for(i=1;i<=3;++i){
        document.getElementById('image' + i).style.backgroundColor = "rgba(0,0,0,0)";
        document.getElementById('image' + i).style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);"
      }

      setTimeout(() => {
        setState(states['IMAGES']);
      }, 2000);
      break;
    case states.SCORE:
      updatePoints();
      setTimeout(() => {
        getNewMovie();
        //setState(states['TITLE'])
      }, 4000);
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
  if(nextPointsForPlayer = "player1"){
    points.player1++;
  }else{
    points.player2++
  }
  setTimeout(() => {
    document.getElementById('player1_points').innerHTML = points.player1;
    document.getElementById('player2_points').innerHTML = points.player2;
    document.getElementById('score').innerHTML = points.player1 + ":" +points.player2;
  },500);
};

/**
 * highlight image
 */
let highlightImage = (imageId, color) => {
  document.getElementById('image' + imageId).style.boxShadow =
   //"0 4px 8px 0 rgba(" + color[0] + ", " + color[1] + ", " + color[2] + " 0.8), 0 6px 20px 0 rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.7);"
  "0px 0px 20px 20px rgba(" + color[0] + ", " + color[1] + ", " + color[2] +",0.8)";
   //document.getElementById('image' + imageId).style.backgroundColor = "rgb("+color[0] + ", " + color[1] + ", " + color[2]+")";
}

/**
 * fade image out
 */
let fadeOutImage = (imageId) => {
  document.getElementById('image' + imageId).style.backgroundColor = "rgb(80,80,80)";
}

/**
 * update the dom with new movie
 * @param {Movie} movie - the new movie
 */
let updateMovie = (movie) => {
  currentMovie = movie;80
  document.getElementById('movie').innerHTML = movie.title.split('_').join(' ');
  document.getElementById('image1').style.backgroundImage = 'url(http://' + url + ':3000/images/' + movie.image1 + '.jpg)';
  document.getElementById('image2').style.backgroundImage = 'url(http://' + url + ':3000/images/' + movie.image2 + '.jpg)';
  document.getElementById('image3').style.backgroundImage = 'url(http://' + url + ':3000/images/' + movie.image3 + '.jpg)';
  document.getElementById('movie2').innerHTML = movie.title.split('_').join(' ');
  setState(states['TITLE']);
};

let getNewMovie = () => {
  $.getJSON('http://' + url + ':3000/getRandomMovie', updateMovie)
};

document.addEventListener("DOMContentLoaded", function () {
  setState(states.START);

  // stet interactions
  document.querySelectorAll('.start-button').forEach((button) => button.addEventListener('click', () => {
    setState(states.START);
    getNewMovie();
  }));

  document.addEventListener('keypress', (e) => {
    if (currentState === states.IMAGES) {
      const keysPlayer1 = ['Digit1', 'Digit2', 'Digit3'];
      const keysPlayer2 = ['Digit4', 'Digit5', 'Digit6'];


      let keyPlayer1 = keysPlayer1.indexOf(e.code);
      let keyPlayer2 = keysPlayer2.indexOf(e.code);

      if (keysPlayer1.indexOf(e.code) !== -1) {
        if (keysPlayer1.indexOf(e.code) + 1 === currentMovie.answer) {
          nextPointsForPlayer = 'player1';
        } else {
          nextPointsForPlayer = 'player2';
        }
      }
      else {
        // player two hit button
        if (keysPlayer2.indexOf(e.code) + 1 === currentMovie.answer) {
          nextPointsForPlayer = 'player2';
        }
        else {
          nextPointsForPlayer = 'player1';
        }
      }

      // color selected image
      if (keyPlayer1 !== -1) {
        highlightImage(keyPlayer1 + 1, playerColors.player1);
      } else {
        highlightImage(keyPlayer2 + 1, playerColors.player2);
      }

      // fade out wrong images
      setTimeout(() => {
        for (i = 1; i < 4; ++i) {
          if (i != currentMovie.answer) {
            fadeOutImage(i);
          }
        }
      
        // set next state
        setTimeout(() => {
        // player one hit button

          if (points.player1 >= winningPoints || points.player2 >= winningPoints) {
            setState(states.WINNER);
          } else {
            setState(states.SCORE);
          }
        },1000);
      }, 1500);




    }


  });


});