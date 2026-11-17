const startScreen = document.querySelector("#start-screen");
const gameScreen = document.querySelector("#game-screen");
const pauseScreen = document.querySelector("#pause-screen");
const resultScreen = document.querySelector("#result-screen");
const cells = [...document.querySelectorAll(".main-grid-cell")];
const nameInput = document.querySelector("#input-name");
const numberInputs = [...document.querySelectorAll(".number")];
const playerName = document.querySelector("#player-name");
const gameLevel = document.querySelector("#game-level");
const gameTime = document.querySelector("#game-time");
const resultTime = document.querySelector("#result-time");
const progressValue = document.querySelector("#progress-value");
const progressBar = document.querySelector("#progress-bar");

let levelIndex = 0;
let level = CONSTANT.LEVEL[levelIndex];
let timer = null;
let paused = false;
let seconds = 0;
let sudoku = null;
let playerGrid = null;
let selectedCell = -1;

const isCellFilled = (cell) => cell.classList.contains("filled");
const getGameInfo = () => {
	const savedGame = localStorage.getItem("game");
	return savedGame ? JSON.parse(savedGame) : null;
};

const setPlayerName = (name) => localStorage.setItem("player_name", name);
const getPlayerName = () => localStorage.getItem("player_name");

const showTime = (elapsedSeconds) => {
	const hours = Math.floor(elapsedSeconds / 3600);
	const minutes = Math.floor((elapsedSeconds % 3600) / 60);
	const remainder = elapsedSeconds % 60;
	return [hours, minutes, remainder]
		.map((part) => String(part).padStart(2, "0"))
		.slice(hours > 0 ? 0 : 1)
		.join(":");
};

const clearSudoku = () => {
	cells.forEach((cell) => {
		cell.textContent = "";
		cell.removeAttribute("data-value");
		cell.classList.remove("filled", "selected", "hover", "err", "cell-err");
	});
	selectedCell = -1;
};

const updateProgress = () => {
	if (!playerGrid) return;
	const fixedCells = sudoku.question.flat().filter((value) => value !== 0).length;
	const enteredCells = playerGrid.flat().filter((value, index) => {
		const row = Math.floor(index / CONSTANT.GRID_SIZE);
		const col = index % CONSTANT.GRID_SIZE;
		return sudoku.question[row][col] === 0 && value !== 0;
	}).length;
	const totalEmptyCells = CONSTANT.GRID_SIZE ** 2 - fixedCells;
	progressValue.textContent = `${enteredCells} / ${totalEmptyCells}`;
	progressBar.style.width = `${totalEmptyCells ? (enteredCells / totalEmptyCells) * 100 : 0}%`;
};

const updateCell = (index, value) => {
	const row = Math.floor(index / CONSTANT.GRID_SIZE);
	const col = index % CONSTANT.GRID_SIZE;
	const cell = cells[index];
	playerGrid[row][col] = value;
	cell.textContent = value === 0 ? "" : String(value);
	cell.dataset.value = String(value);
	cell.classList.remove("err");
};

const initSudoku = () => {
	clearSudoku();
	sudoku = sudokuGen(level);
	playerGrid = sudoku.question.map((row) => [...row]);
	seconds = 0;

	cells.forEach((cell, index) => {
		const row = Math.floor(index / CONSTANT.GRID_SIZE);
		const col = index % CONSTANT.GRID_SIZE;
		const value = sudoku.question[row][col];
		if (value !== 0) {
			cell.classList.add("filled");
			cell.textContent = String(value);
			cell.dataset.value = String(value);
		}
	});

	removeErrors();
	saveGameInfo();
	updateProgress();
};

const loadSudoku = () => {
	const game = getGameInfo();
	if (!game?.su?.question || !game.su.original) return false;

	clearSudoku();
	sudoku = game.su;
	if (!sudokuCheck(sudoku.original)) {
		const reconstructedSolution = sudoku.question.map((row) => [...row]);
		if (!sudokuCreate(reconstructedSolution) || !sudokuCheck(reconstructedSolution)) return false;
		sudoku.original = reconstructedSolution;
	}
	playerGrid = (game.su.answer || game.su.question).map((row) => [...row]);
	seconds = game.seconds || 0;
	levelIndex = game.level || 0;
	level = CONSTANT.LEVEL[levelIndex];
	gameLevel.textContent = CONSTANT.LEVEL_NAME[levelIndex];

	cells.forEach((cell, index) => {
		const row = Math.floor(index / CONSTANT.GRID_SIZE);
		const col = index % CONSTANT.GRID_SIZE;
		const value = playerGrid[row][col];
		if (sudoku.question[row][col] !== 0) cell.classList.add("filled");
		if (value !== 0) {
			cell.textContent = String(value);
			cell.dataset.value = String(value);
		}
	});

	removeErrors();
	updateProgress();
	return true;
};

const clearHighlights = () => cells.forEach((cell) => cell.classList.remove("hover"));

const highlightRelatedCells = (index) => {
	const row = Math.floor(index / CONSTANT.GRID_SIZE);
	const col = index % CONSTANT.GRID_SIZE;
	const boxRow = row - (row % CONSTANT.BOX_SIZE);
	const boxCol = col - (col % CONSTANT.BOX_SIZE);

	cells.forEach((cell, cellIndex) => {
		const cellRow = Math.floor(cellIndex / CONSTANT.GRID_SIZE);
		const cellCol = cellIndex % CONSTANT.GRID_SIZE;
		if (
			cellRow === row ||
			cellCol === col ||
			(Math.floor(cellRow / CONSTANT.BOX_SIZE) === boxRow / CONSTANT.BOX_SIZE &&
				Math.floor(cellCol / CONSTANT.BOX_SIZE) === boxCol / CONSTANT.BOX_SIZE)
		) {
			cell.classList.add("hover");
		}
	});
};

const selectCell = (index) => {
	if (index < 0 || index >= cells.length) return;
	selectedCell = index;
	cells.forEach((cell) => cell.classList.remove("selected"));
	cells[index].classList.add("selected");
	clearHighlights();
	highlightRelatedCells(index);
};

const removeErrors = () => cells.forEach((cell) => cell.classList.remove("err"));

const markConflicts = (value) => {
	if (selectedCell < 0 || value === 0) return;
	const selectedRow = Math.floor(selectedCell / CONSTANT.GRID_SIZE);
	const selectedCol = selectedCell % CONSTANT.GRID_SIZE;
	const boxRow = selectedRow - (selectedRow % CONSTANT.BOX_SIZE);
	const boxCol = selectedCol - (selectedCol % CONSTANT.BOX_SIZE);

	cells.forEach((cell, index) => {
		const row = Math.floor(index / CONSTANT.GRID_SIZE);
		const col = index % CONSTANT.GRID_SIZE;
		const inSameUnit =
			row === selectedRow ||
			col === selectedCol ||
			(Math.floor(row / CONSTANT.BOX_SIZE) === boxRow / CONSTANT.BOX_SIZE &&
				Math.floor(col / CONSTANT.BOX_SIZE) === boxCol / CONSTANT.BOX_SIZE);
		if (index !== selectedCell && inSameUnit && playerGrid[row][col] === value) {
			cell.classList.add("err");
		}
	});
};

const saveGameInfo = () => {
	if (!sudoku || !playerGrid) return;
	localStorage.setItem(
		"game",
		JSON.stringify({
			level: levelIndex,
			seconds,
			su: {
				original: sudoku.original,
				question: sudoku.question,
				answer: playerGrid,
			},
		}),
	);
};

const removeGameInfo = () => {
	localStorage.removeItem("game");
	document.querySelector("#btn-continue").style.display = "none";
};

const isGameWon = () => sudokuCheck(playerGrid);

const showResult = () => {
	clearInterval(timer);
	timer = null;
	resultScreen.classList.add("active");
	resultTime.textContent = showTime(seconds);
};

const enterNumber = (value) => {
	if (selectedCell < 0 || isCellFilled(cells[selectedCell]) || paused) return;
	updateCell(selectedCell, value);
	removeErrors();
	const row = Math.floor(selectedCell / CONSTANT.GRID_SIZE);
	const col = selectedCell % CONSTANT.GRID_SIZE;
	if (sudoku.original[row][col] !== value) {
		cells[selectedCell].classList.add("err");
		markConflicts(value);
	}

	cells[selectedCell].classList.remove("zoom-in");
	void cells[selectedCell].offsetWidth;
	cells[selectedCell].classList.add("zoom-in");
	window.setTimeout(() => cells[selectedCell]?.classList.remove("zoom-in"), 220);

	saveGameInfo();
	updateProgress();
	if (isGameWon()) {
		removeGameInfo();
		showResult();
	}
};

const eraseSelectedCell = () => {
	if (selectedCell < 0 || isCellFilled(cells[selectedCell]) || paused) return;
	updateCell(selectedCell, 0);
	removeErrors();
	saveGameInfo();
	updateProgress();
};

const startGame = () => {
	startScreen.classList.remove("active");
	gameScreen.classList.add("active");
	pauseScreen.classList.remove("active");
	resultScreen.classList.remove("active");
	window.scrollTo({ top: 0, behavior: "smooth" });
	paused = false;
	playerName.textContent = nameInput.value.trim();
	setPlayerName(nameInput.value.trim());
	gameLevel.textContent = CONSTANT.LEVEL_NAME[levelIndex];
	gameTime.textContent = showTime(seconds);
	saveGameInfo();
	clearInterval(timer);
	timer = setInterval(() => {
		if (!paused) {
			seconds += 1;
			gameTime.textContent = showTime(seconds);
			saveGameInfo();
		}
	}, 1000);
};

const returnStartScreen = () => {
	clearInterval(timer);
	timer = null;
	paused = false;
	window.scrollTo({ top: 0, behavior: "smooth" });
	document.querySelector("#btn-continue").style.display = getGameInfo() ? "flex" : "none";
	startScreen.classList.add("active");
	gameScreen.classList.remove("active");
	pauseScreen.classList.remove("active");
	resultScreen.classList.remove("active");
};

const requirePlayerName = () => {
	if (nameInput.value.trim()) return true;
	nameInput.classList.add("input-err");
	window.setTimeout(() => {
		nameInput.classList.remove("input-err");
		nameInput.focus();
	}, 350);
	return false;
};

document.querySelector("#dark-mode-toggle").addEventListener("click", () => {
	document.body.classList.toggle("dark");
	const isDark = document.body.classList.contains("dark");
	localStorage.setItem("darkmode", String(isDark));
	document.querySelector('meta[name="theme-color"]').content = isDark ? "#171d1a" : "#f5f4f0";
});

document.querySelector("#btn-level").addEventListener("click", (event) => {
	levelIndex = (levelIndex + 1) % CONSTANT.LEVEL.length;
	level = CONSTANT.LEVEL[levelIndex];
	event.currentTarget.firstChild.textContent = `${CONSTANT.LEVEL_NAME[levelIndex]} `;
});

document.querySelector("#btn-play").addEventListener("click", () => {
	if (!requirePlayerName()) return;
	initSudoku();
	startGame();
});

document.querySelector("#btn-continue").addEventListener("click", () => {
	if (!requirePlayerName()) return;
	if (loadSudoku()) startGame();
});

document.querySelector("#btn-pause").addEventListener("click", () => {
	pauseScreen.classList.add("active");
	paused = true;
});

document.querySelector("#btn-resume").addEventListener("click", () => {
	pauseScreen.classList.remove("active");
	paused = false;
});

document.querySelector("#btn-new-game").addEventListener("click", returnStartScreen);
document.querySelector("#btn-new-game-2").addEventListener("click", returnStartScreen);
document.querySelector("#btn-home").addEventListener("click", returnStartScreen);
document.querySelector("#btn-delete").addEventListener("click", eraseSelectedCell);

numberInputs.forEach((button) => {
	button.addEventListener("click", () => enterNumber(Number(button.textContent)));
});

cells.forEach((cell, index) => {
	cell.addEventListener("click", () => selectCell(index));
	cell.addEventListener("keydown", (event) => {
		if (event.key >= "1" && event.key <= "9") {
			event.preventDefault();
			event.stopPropagation();
			selectCell(index);
			enterNumber(Number(event.key));
		}
	});
});

document.addEventListener("keydown", (event) => {
	if (!gameScreen.classList.contains("active")) return;
	if (event.target === nameInput || event.target.matches("button")) return;
	if (event.key >= "1" && event.key <= "9") {
		event.preventDefault();
		enterNumber(Number(event.key));
	} else if (event.key === "Backspace" || event.key === "Delete") {
		eraseSelectedCell();
	} else if (event.key === "Escape") {
		pauseScreen.classList.add("active");
		paused = true;
	} else if (selectedCell >= 0 && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
		event.preventDefault();
		const offsets = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 };
		let nextCell = selectedCell + offsets[event.key];
		if (event.key === "ArrowLeft" && selectedCell % 9 === 0) nextCell = selectedCell;
		if (event.key === "ArrowRight" && selectedCell % 9 === 8) nextCell = selectedCell;
		selectCell(Math.max(0, Math.min(80, nextCell)));
		cells[selectedCell].focus();
	}
});

const init = () => {
	const isDark = localStorage.getItem("darkmode") === "true";
	document.body.classList.toggle("dark", isDark);
	document.querySelector('meta[name="theme-color"]').content = isDark ? "#171d1a" : "#f5f4f0";
	const game = getGameInfo();
	document.querySelector("#btn-continue").style.display = game ? "flex" : "none";
	if (getPlayerName()) nameInput.value = getPlayerName();
	else nameInput.focus();
};

init();
