const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const nuvens = document.querySelector('.cloud');
const realTimeScoreElement = document.querySelector('.real-time-score');
const finalScoreElement = document.querySelector('.pontuacao');
const scoreBoard = document.querySelector('.score-board');
const startScreen = document.querySelector('.start-screen');
const gameBoard = document.querySelector('.game-board');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset');

let score = 0;
let pipePassed = false;
let isGameRunning = false;
let gameLoop;

const jump = () => {
  if (!isGameRunning || mario.classList.contains('jump')) return;

  mario.classList.add('jump');
  
  setTimeout(() => {
    mario.classList.remove('jump');
  }, 500);
};

const loop = () => {
  const posicaoPipe = pipe.offsetLeft;
  const posicaoNuvens = nuvens.offsetLeft;
  const posicaoMario = +window.getComputedStyle(mario).bottom.replace('px', '');

  // Colisão
  if (posicaoPipe <= 120 && posicaoPipe > 0 && posicaoMario < 80) {
    gameOver(posicaoPipe, posicaoMario, posicaoNuvens);
  }

  // Pontuação
  if (posicaoPipe < 0 && !pipePassed) {
    score++;
    realTimeScoreElement.innerHTML = score;
    pipePassed = true;

    // Aumentar velocidade (dificuldade progressiva)
    const newSpeed = Math.max(0.6, 1.5 - (score * 0.05));
    gameBoard.style.setProperty('--pipe-time', `${newSpeed}s`);
  } else if (posicaoPipe > 120) {
    pipePassed = false;
  }
};

const startGame = () => {
  if (isGameRunning) return;
  
  isGameRunning = true;
  startScreen.style.display = 'none';
  gameBoard.classList.add('playing');
  
  gameLoop = setInterval(loop, 10);
};

const gameOver = (posicaoPipe, posicaoMario, posicaoNuvens) => {
  isGameRunning = false;
  clearInterval(gameLoop);

  pipe.style.animation = 'none';
  pipe.style.left = `${posicaoPipe}px`;

  mario.style.animation = 'none';
  mario.style.bottom = `${posicaoMario}px`;
  mario.src = "./assets/imgs/game-over.png";
  mario.style.width = '75px';
  mario.style.marginLeft = '50px';

  nuvens.style.animation = 'none';
  nuvens.style.left = `${posicaoNuvens}px`;

  scoreBoard.style.display = 'flex';
  finalScoreElement.innerHTML = score;
};

// Event Listeners
startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
  if (!isGameRunning) {
    startGame();
  } else {
    jump();
  }
});

resetButton.addEventListener('click', () => {
  window.location.reload();
});