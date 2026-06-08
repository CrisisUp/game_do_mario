/**
 * Configurações globais do jogo para evitar "Números Mágicos"
 * e facilitar o balanceamento da dificuldade.
 */
const GAME_SETTINGS = {
  JUMP_DURATION: 500,
  COLLISION_PIPE_THRESHOLD: 120,
  COLLISION_MARIO_THRESHOLD: 80,
  LOOP_INTERVAL: 10,
  INITIAL_PIPE_SPEED: 1.5,
  MIN_PIPE_SPEED: 0.6,
  SPEED_INCREMENT: 0.05,
  GAME_OVER_MARIO_WIDTH: '75px',
  GAME_OVER_MARIO_MARGIN: '50px'
};

/* Seletores do DOM agrupados para melhor organização */
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

/* Estado do Jogo */
let score = 0;
let pipePassed = false;
let isGameRunning = false;
let gameLoop;

/**
 * Encapsula a lógica de obtenção de propriedades computadas
 */
const getMarioBottom = () => {
  return +window.getComputedStyle(mario).bottom.replace('px', '');
};

const updatePipeSpeed = () => {
  const newSpeed = Math.max(
    GAME_SETTINGS.MIN_PIPE_SPEED, 
    GAME_SETTINGS.INITIAL_PIPE_SPEED - (score * GAME_SETTINGS.SPEED_INCREMENT)
  );
  gameBoard.style.setProperty('--pipe-time', `${newSpeed}s`);
};

/**
 * Executa a ação de pular do personagem
 */
const jump = () => {
  if (!isGameRunning || mario.classList.contains('jump')) return;

  mario.classList.add('jump');
  
  setTimeout(() => {
    mario.classList.remove('jump');
  }, GAME_SETTINGS.JUMP_DURATION);
};

/**
 * Lógica principal de verificação de colisão e pontuação
 */
const runGameLoop = () => {
  const pipePosition = pipe.offsetLeft;
  const cloudPosition = nuvens.offsetLeft;
  const marioPosition = getMarioBottom();

  const isColliding = 
    pipePosition <= GAME_SETTINGS.COLLISION_PIPE_THRESHOLD && 
    pipePosition > 0 && 
    marioPosition < GAME_SETTINGS.COLLISION_MARIO_THRESHOLD;

  if (isColliding) {
    handleGameOver(pipePosition, marioPosition, cloudPosition);
    return;
  }

  handleScore(pipePosition);
};

/**
 * Gerencia o incremento da pontuação e dificuldade
 */
const handleScore = (pipePosition) => {
  const hasPassedPipe = pipePosition < 0 && !pipePassed;
  const isPipeResetting = pipePosition > GAME_SETTINGS.COLLISION_PIPE_THRESHOLD;

  if (hasPassedPipe) {
    score++;
    realTimeScoreElement.innerHTML = score;
    pipePassed = true;
    updatePipeSpeed();
  } else if (isPipeResetting) {
    pipePassed = false;
  }
};

/**
 * Inicia a partida
 */
const startGame = () => {
  if (isGameRunning) return;
  
  isGameRunning = true;
  startScreen.style.display = 'none';
  gameBoard.classList.add('playing');
  
  gameLoop = setInterval(runGameLoop, GAME_SETTINGS.LOOP_INTERVAL);
};

/**
 * Finaliza a partida e congela os elementos na tela
 */
const handleGameOver = (pipePosition, marioPosition, cloudPosition) => {
  isGameRunning = false;
  clearInterval(gameLoop);

  // Congela as animações e posições
  stopElementAnimation(pipe, pipePosition, 'left');
  stopElementAnimation(mario, marioPosition, 'bottom');
  stopElementAnimation(nuvens, cloudPosition, 'left');

  // Altera visual do Mario para Game Over
  mario.src = "./assets/imgs/game-over.png";
  mario.style.width = GAME_SETTINGS.GAME_OVER_MARIO_WIDTH;
  mario.style.marginLeft = GAME_SETTINGS.GAME_OVER_MARIO_MARGIN;

  // Exibe placar final
  scoreBoard.style.display = 'flex';
  finalScoreElement.innerHTML = score;
};

/**
 * Função utilitária para parar animações de elementos específicos
 */
const stopElementAnimation = (element, position, property) => {
  element.style.animation = 'none';
  element.style[property] = `${position}px`;
};

/* Event Listeners */
startButton.addEventListener('click', startGame);

document.addEventListener('keydown', () => {
  if (!isGameRunning) {
    startGame();
    return;
  }
  jump();
});

resetButton.addEventListener('click', () => {
  window.location.reload();
});
