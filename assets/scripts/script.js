/**
 * Configurações globais do jogo.
 * Removi os thresholds fixos para usar detecção dinâmica via Bounding Box.
 */
const GAME_SETTINGS = {
  JUMP_DURATION: 500,
  LOOP_INTERVAL: 10,
  INITIAL_PIPE_SPEED: 2.5,
  MIN_PIPE_SPEED: 0.6,
  SPEED_INCREMENT: 0.025,
  GAME_OVER_MARIO_WIDTH: '75px',
  GAME_OVER_MARIO_MARGIN: '50px'
};

/* Seletores do DOM */
const mario = document.querySelector(".mario");
const pipe = document.querySelector(".pipe");
const nuvens = document.querySelector(".cloud");
const realTimeScoreElement = document.querySelector(".real-time-score");
const finalScoreElement = document.querySelector(".pontuacao");
const scoreBoard = document.querySelector(".score-board");
const startScreen = document.querySelector(".start-screen");
const gameBoard = document.querySelector(".game-board");
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset");

/* Estado do Jogo */
let score = 0;
let pipePassed = false;
let isGameRunning = false;
let gameLoop;

/**
 * Atualiza a velocidade do cano dinamicamente
 */
const updatePipeSpeed = () => {
  const newSpeed = Math.max(
    GAME_SETTINGS.MIN_PIPE_SPEED,
    GAME_SETTINGS.INITIAL_PIPE_SPEED - score * GAME_SETTINGS.SPEED_INCREMENT,
  );
  gameBoard.style.setProperty("--pipe-time", `${newSpeed}s`);
};

/**
 * Executa o pulo do Mario
 */
const jump = () => {
  if (!isGameRunning || mario.classList.contains("jump")) return;

  mario.classList.add("jump");

  setTimeout(() => {
    mario.classList.remove("jump");
  }, GAME_SETTINGS.JUMP_DURATION);
};

/**
 * Lógica de detecção de colisão aprimorada (Bounding Box)
 * Esta função verifica se as caixas visuais dos elementos se sobrepõem.
 */
const checkCollision = () => {
  const marioRect = mario.getBoundingClientRect();
  const pipeRect = pipe.getBoundingClientRect();

  // Margem de segurança para compensar transparências nas imagens
  const buffer = 15;

  return (
    marioRect.right - buffer > pipeRect.left &&
    marioRect.left + buffer < pipeRect.right &&
    marioRect.bottom - buffer > pipeRect.top &&
    marioRect.top + buffer < pipeRect.bottom
  );
};

/**
 * Lógica principal de execução do jogo
 */
const runGameLoop = () => {
  if (checkCollision()) {
    handleGameOver();
    return;
  }

  handleScore();
};

/**
 * Gerencia a pontuação verificando a posição do cano em relação ao Mario
 */
const handleScore = () => {
  const marioRect = mario.getBoundingClientRect();
  const pipeRect = pipe.getBoundingClientRect();

  // Se o cano passou completamente pela esquerda do Mario
  if (pipeRect.right < marioRect.left && !pipePassed) {
    score++;
    realTimeScoreElement.innerHTML = score;
    pipePassed = true;
    updatePipeSpeed();
  } 
  
  // Reseta o estado quando o cano reaparece à direita
  if (pipeRect.left > marioRect.right) {
    pipePassed = false;
  }
};

/**
 * Inicia a partida
 */
const startGame = () => {
  if (isGameRunning) return;

  isGameRunning = true;
  startScreen.style.display = "none";
  gameBoard.classList.add("playing");

  gameLoop = setInterval(runGameLoop, GAME_SETTINGS.LOOP_INTERVAL);
};

/**
 * Finaliza a partida
 */
const handleGameOver = () => {
  isGameRunning = false;
  clearInterval(gameLoop);

  // Captura as posições exatas no momento do impacto para congelar a tela
  const pipeRect = pipe.getBoundingClientRect();
  const marioRect = mario.getBoundingClientRect();
  const cloudRect = nuvens.getBoundingClientRect();
  const boardRect = gameBoard.getBoundingClientRect();

  // Congela elementos
  stopElementAt(pipe, pipeRect.left - boardRect.left, 'left');
  stopElementAt(mario, boardRect.bottom - marioRect.bottom, 'bottom');
  stopElementAt(nuvens, cloudRect.left - boardRect.left, 'left');

  mario.src = "./assets/imgs/game-over.png";
  mario.style.width = GAME_SETTINGS.GAME_OVER_MARIO_WIDTH;
  mario.style.marginLeft = GAME_SETTINGS.GAME_OVER_MARIO_MARGIN;

  scoreBoard.style.display = "flex";
  finalScoreElement.innerHTML = score;
};

/**
 * Congela um elemento em uma posição específica
 */
const stopElementAt = (element, position, property) => {
  element.style.animation = "none";
  element.style[property] = `${position}px`;
};

/* Event Listeners */
startButton.addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {
  // Evita scroll da página com a barra de espaço
  if(e.code === 'Space') e.preventDefault();
  
  if (!isGameRunning) {
    startGame();
  } else {
    jump();
  }
});

// Suporte para cliques/toques na tela para pular
gameBoard.addEventListener("touchstart", (e) => {
  if (!isGameRunning) {
    startGame();
  } else {
    jump();
  }
});

resetButton.addEventListener("click", () => {
  window.location.reload();
});
