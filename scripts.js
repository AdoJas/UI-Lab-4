const gameBoard = document.getElementById("game-board");
const startButton = document.getElementById("start-game");
const resetButton = document.getElementById("reset-game");
const playerNameInput = document.getElementById("player-name");
const timerDisplay = document.getElementById("timer");
const movesDisplay = document.getElementById("moves");
const highScoresDisplay = document.getElementById("high-scores");

const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯"];
let cards = [...emojis, ...emojis];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer;
let seconds = 0;
let isPlaying = false;
let cardFlippingLocked = false;

function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}

function createBoard() {
  gameBoard.innerHTML = "";
  shuffleCards();
  cards.forEach((emoji, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.index = index;
    card.addEventListener("click", flipCard);
    gameBoard.appendChild(card);
  });
}

function flipCard() {
    if (!isPlaying || cardFlippingLocked || this.classList.contains("flipped") || flippedCards.length === 2) return;
  
    const selectedCard = this;
    selectedCard.classList.add("flipped");
    selectedCard.textContent = cards[selectedCard.dataset.index];
    flippedCards.push(selectedCard);
  
    if (flippedCards.length === 2) {
      moves++;
      movesDisplay.textContent = `Moves: ${moves}`;
      cardFlippingLocked = true; 
      setTimeout(checkMatch, 500);
    }
  }
  

  function checkMatch() {
    if (flippedCards.length !== 2) return;
  
    const [card1, card2] = flippedCards;
  
    if (card1.textContent === card2.textContent) {
      card1.classList.add("matched");
      card2.classList.add("matched");
      setTimeout(() => {
        card1.style.visibility = "hidden";
        card2.style.visibility = "hidden";
      }, 500);
      card1.removeEventListener("click", flipCard);
      card2.removeEventListener("click", flipCard);
      matchedPairs++;
  
      if (matchedPairs === emojis.length) {
        setTimeout(() => {
          endGame();
        }, 500);
      }
    } else {
      setTimeout(() => {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        card1.textContent = "";
        card2.textContent = "";
      }, 600);
    }
  
    setTimeout(() => {
      cardFlippingLocked = false;
    }, 600);
  
    flippedCards = [];
  }
  

function startGame() {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert("Please enter a valid name to start the game.");
    return;
  }
  isPlaying = true;
  matchedPairs = 0;
  moves = 0;
  seconds = 0;
  createBoard();
  startTimer();
  startButton.disabled = true;
  playerNameInput.readOnly = true;
  movesDisplay.textContent = "Moves: 0";
  timerDisplay.textContent = "Time: 0s";
}

function resetGame() {
  isPlaying = false;
  clearInterval(timer);
  startButton.disabled = false;
  timerDisplay.textContent = "Time: 0s";
  movesDisplay.textContent = "Moves: 0";
  playerNameInput.readOnly = false;
  createBoard();
}

function startTimer() {
  timer = setInterval(() => {
    seconds++;
    timerDisplay.textContent = `Time: ${seconds}s`;
  }, 1000);
}

function endGame() {
  isPlaying = false;
  clearInterval(timer);
  const score = calculateScore();
  alert(
    `Congratulations! You completed the game in ${seconds} seconds with ${moves} moves. Your score is ${score}.`
  );
  saveScore(score);
  displayHighScores();
}

function calculateScore() {
    const timePenalty = seconds * 0.8; 
    const movePenalty = moves * 1.5; 
    const efficiencyBonus = Math.max(0, 100 - moves); 
    const timeEfficiencyBonus = Math.max(0, 50 - Math.floor(seconds / 2)); 
    const baseScore = 5000;
  
    const score = baseScore - timePenalty - movePenalty + efficiencyBonus + timeEfficiencyBonus;
    return Math.max(0, Math.round(score)); 
  }

function saveScore(score) {
  const playerName = playerNameInput.value;
  let highScores = JSON.parse(sessionStorage.getItem("highScores")) || [];
  highScores.push({ name: playerName, score: score });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 5);
  sessionStorage.setItem("highScores", JSON.stringify(highScores));
}

function displayHighScores() {
  const highScores = JSON.parse(sessionStorage.getItem("highScores")) || [];
  if (highScores.length === 0) {
    highScoresDisplay.innerHTML = "<h2>No High Scores Yet</h2>";
    return;
  }
  highScoresDisplay.innerHTML = "<h2>High Scores</h2>";
  highScores.forEach((score, index) => {
    highScoresDisplay.innerHTML += `<p>${index + 1}. ${score.name}: ${
      score.score
    }</p>`;
  });
}

function updateScoreboard(scores) {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = scores
      .map(score => {
          const truncatedName = score.name.length > 10 ? score.name.slice(0, 10) + '...' : score.name;
          return `<div>${truncatedName}: ${score.points}</div>`;
      })
      .join('');
}

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

window.addEventListener('resize', () => {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
      const size = window.innerWidth < 768 ? '80px' : '100px'; 
      card.style.width = size;
      card.style.height = size;
  });
});
createBoard();
displayHighScores();
