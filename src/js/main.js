const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CANVAS_BACKGROUND_COLOR = 'black';
const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 2;
const BRICK_COLUMNS = 10;
const BRICK_ROWS = 14;
const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 60;
const PADDLE_COLOR = '#fff176';
const BALL_COLOR = '#9ccc65';
const BRICK_COLOR = '#2196f3';

let ballX = 75;
let ballY = 75;
let ballSpeedX = 5;
let ballSpeedY = 7;
let brickGrid = new Array(BRICK_COLUMNS * BRICK_ROWS);
let bricksLeft = 0;
let paddleX = 400;
let canvas, canvasContext;
let mouseX = 0;
let mouseY = 0;

const updateMousePos = evt => {
  let rect = canvas.getBoundingClientRect();
  let root = document.documentElement;

  mouseX = evt.clientX - rect.left - root.scrollLeft;
  mouseY = evt.clientY - rect.top - root.scrollTop;

  paddleX = mouseX - PADDLE_WIDTH / 2;

  // cheat / hack to test ball in any position
  /*ballX = mouseX;
	ballY = mouseY;
	ballSpeedX = 4;
	ballSpeedY = -4;*/
};

const brickReset = () => {
  bricksLeft = 0;
  let i;
  for (i = 0; i < 3 * BRICK_COLUMNS; i++) {
    brickGrid[i] = false;
  }
  for (; i < BRICK_COLUMNS * BRICK_ROWS; i++) {
    brickGrid[i] = true;
    bricksLeft++;
  }
};

window.onload = function() {
  canvas = document.getElementById('game-canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvasContext = canvas.getContext('2d');

  let framesPerSecond = 30;
  setInterval(updateCanvas, 1000 / framesPerSecond);

  canvas.addEventListener('mousemove', updateMousePos);

  brickReset();
  ballReset();
};

const updateCanvas = () => {
  moveAll();
  drawAll();
};

const ballReset = () => {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
};

const ballMove = () => {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballX < 0 && ballSpeedX < 0.0) {
    ballSpeedX *= -1;
  }
  if (ballX > canvas.width && ballSpeedX > 0.0) {
    ballSpeedX *= -1;
  }
  if (ballY < 0 && ballSpeedY < 0.0) {
    ballSpeedY *= -1;
  }
  if (ballY > canvas.height) {
    ballReset();
    brickReset();
  }
};

const isBrickAtColRow = (col, row) => {
  if (col >= 0 && col < BRICK_COLUMNS && row >= 0 && row < BRICK_ROWS) {
    let brickIndexUnderCoord = rowColToArrayIndex(col, row);
    return brickGrid[brickIndexUnderCoord];
  } else {
    return false;
  }
};

const ballBrickHandling = () => {
  let ballBrickCol = Math.floor(ballX / BRICK_WIDTH);
  let ballBrickRow = Math.floor(ballY / BRICK_HEIGHT);
  let brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

  if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLUMNS && ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS) {
    if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
      brickGrid[brickIndexUnderBall] = false;
      bricksLeft--;

      let prevBallX = ballX - ballSpeedX;
      let prevBallY = ballY - ballSpeedY;
      let prevBrickCol = Math.floor(prevBallX / BRICK_WIDTH);
      let prevBrickRow = Math.floor(prevBallY / BRICK_HEIGHT);

      let bothTestsFailed = true;

      if (prevBrickCol != ballBrickCol) {
        if (!isBrickAtColRow(prevBrickCol, ballBrickRow)) {
          ballSpeedX *= -1;
          bothTestsFailed = false;
        }
      }
      if (prevBrickRow != ballBrickRow) {
        if (!isBrickAtColRow(ballBrickCol, prevBrickRow)) {
          ballSpeedY *= -1;
          bothTestsFailed = false;
        }
      }

      if (bothTestsFailed) {
        ballSpeedX *= -1;
        ballSpeedY *= -1;
      }
    }
  }
};

const ballPaddleHandling = () => {
  let paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
  let paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
  let paddleLeftEdgeX = paddleX;
  let paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;
  if (ballY > paddleTopEdgeY && ballY < paddleBottomEdgeY && ballX > paddleLeftEdgeX && ballX < paddleRightEdgeX) {
    ballSpeedY *= -1;

    let centerOfPaddleX = paddleX + PADDLE_WIDTH / 2;
    let ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
    ballSpeedX = ballDistFromPaddleCenterX * 0.35;

    if (bricksLeft === 0) {
      brickReset();
    }
  }
};

const moveAll = () => {
  ballMove();

  ballBrickHandling();

  ballPaddleHandling();
};

const rowColToArrayIndex = (col, row) => {
  return col + BRICK_COLUMNS * row;
};

const drawBricks = () => {
  for (let eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
    for (let eachCol = 0; eachCol < BRICK_COLUMNS; eachCol++) {
      let arrayIndex = rowColToArrayIndex(eachCol, eachRow);

      if (brickGrid[arrayIndex]) {
        colorRect(
          BRICK_WIDTH * eachCol,
          BRICK_HEIGHT * eachRow,
          BRICK_WIDTH - BRICK_GAP,
          BRICK_HEIGHT - BRICK_GAP,
          BRICK_COLOR
        );
      }
    }
  }
};

const drawAll = () => {
  colorRect(0, 0, canvas.width, canvas.height, CANVAS_BACKGROUND_COLOR);

  colorCircle(ballX, ballY, 10, BALL_COLOR);

  colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, PADDLE_COLOR);

  drawBricks();
};

const colorRect = (topLeftX, topLeftY, boxWidth, boxHeight, fillColor) => {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
};

const colorCircle = (centerX, centerY, radius, fillColor) => {
  canvasContext.fillStyle = fillColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  canvasContext.fill();
};

const colorText = (showWords, textX, textY, fillColor) => {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillText(showWords, textX, textY);
};
