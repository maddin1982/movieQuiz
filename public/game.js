/**
 * a ransom movie from the database with title and 3 images
 * @typedef {Object} Movie
 * @property {string} title - movie title
 * @property {string} image1 - image 1
 * @property {string} image2 - image 2
 * @property {string} image3 - image 3
 * @property {Number} answer - the correct image
 */

const ws = new WebSocket(`ws://${location.hostname.split(':')[0]}:40510`);

ws.onmessage = function(event) {
  if(event.data) {
    console.log('ws data', event.data);
    pressButton(parseInt(event.data));
  }
};

const winningPoints = 5;

const states = {
  'START': 1,
  'INTRO': 2,
  'TITLE': 3,
  'IMAGES': 4,
  'SCORE': 5,
  'WINNER': 6
};
let currentState;

let points = {
  'player1': 0,
  'player2': 0
};

let nextPointsForPlayer = "";

/**
 * the current Movie
 * @type {Movie}
 */
let currentMovie = null;


let allowUserToPressAnswerButton = false;

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
      nextPointsForPlayer = "";
      updatePoints();
      break;
    case states.INTRO:
        //setTimeout(() => {
        //  setState(states.TITLE);
        //}, 4000);
        break;
    case states.IMAGES:
      allowUserToPressAnswerButton = true;
      break;
    case states.TITLE:
      // reset image overlay 
      for(i=1;i<=3;++i){
        document.getElementById('image' + i).classList.remove("imageFadeout")
        document.getElementById('image' + i).classList.remove("imageHighlightP1");
        document.getElementById('image' + i).classList.remove("imageHighlightP2");
      }

      proceedCountdown(3);

      break;
    case states.SCORE:
      updatePoints();
      setTimeout(() => {
        getNewMovie();
        //setState(states['TITLE'])
      }, 3000);
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
  if(nextPointsForPlayer == "player1"){
    points.player1++;
  }else if (nextPointsForPlayer == "player2"){
    points.player2++
  }
  setTimeout(() => {
    //document.getElementById('player1_points').innerHTML = points.player1;
    //document.getElementById('player2_points').innerHTML = points.player2;
    document.getElementById('score').innerHTML = points.player1 + ":" +points.player2;
  },500);
};

/**
 * highlight image
 */
let highlightImage = (imageId, className) => {
  document.getElementById('image' + imageId).classList.add(className);
}

/**
 * fade image out
 */
let fadeOutImage = (imageId) => {
  document.getElementById('image' + imageId).classList.add("imageFadeout");
}

let proceedCountdown = (countdown) => {
  document.getElementById('countdown').innerHTML = countdown;
  let timer = setInterval(() =>{
    countdown--;
    document.getElementById('countdown').innerHTML = countdown;
    
    
    if(countdown == 0){
      clearInterval(timer);
      setState(states['IMAGES']);
    }
  },1000);
}

/**
 * update the dom with new movie
 * @param {Movie} movie - the new movie
 */
let updateMovie = (movie) => {
  currentMovie = movie;
  document.getElementById('movie').innerHTML = movie.title.split('_').join(' ');
  document.getElementById('image1').style.backgroundImage = 'url(http://' + url + ':3000/images/' + movie.image1 + '.jpg)';
  document.getElementById('image2').style.backgroundImage = 'url(http://' + url + ':3000/images/' + movie.image2 + '.jpg)';
  document.getElementById('image3').style.backgroundImage = 'url(http://' + url + ':3000/images/' + movie.image3 + '.jpg)';
  //document.getElementById('movie2').innerHTML = movie.title.split('_').join(' ');
  setState(states['TITLE']);
};

let getNewMovie = () => {
  $.getJSON('http://' + url + ':3000/getRandomMovie', updateMovie)
};

/**
 *
 * @param {int} buttonId - ... between 1 and 6 , 1-3 for player one, 4-6 for player 2
 */
let pressButton = (buttonId) => {
  console.log(buttonId)
  if(currentState === states.START) {
    if(buttonId === 0) {
      // start the game
      getNewMovie();
    }
  }

  if (currentState === states.IMAGES && allowUserToPressAnswerButton && buttonId > 0 && buttonId < 7) {
    let player;
    if (buttonId < 4) {
      // player 1
      player = 1;
      if (buttonId === currentMovie.answer) {
        nextPointsForPlayer = 'player1';
      } else {
        nextPointsForPlayer = 'player2';
      }
    } else {
      // player 2
      player = 2;
      buttonId -= 3;
      if (buttonId === currentMovie.answer) {
        nextPointsForPlayer = 'player2';
      } else {
        nextPointsForPlayer = 'player1';
      }
    }

    allowUserToPressAnswerButton = false;

    // color selected image
    highlightImage(buttonId, "imageHighlightP" + player);

    fadeOutImages();
  }
};

fadeOutImages = () => {
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
};



document.addEventListener("DOMContentLoaded", function() {
  setState(states.START);

  // stet interactions
  document.querySelectorAll('.start-button').forEach((button) => button.addEventListener('click', () => {
    setState(states.START);
    getNewMovie();
  }));

  document.addEventListener('keypress', (e) => {
     const playerKeys = ['Digit0', 'Digit1', 'Digit2', 'Digit3','Digit4', 'Digit5', 'Digit6'];
     pressButton(playerKeys.indexOf(e.code));
  });


});