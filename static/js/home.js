const nameInput = document.querySelector("#input-name");
const levelButton = document.querySelector("#btn-level");
const continueButton = document.querySelector("#btn-continue");
const levels = CONSTANT.LEVEL_NAME;
const savedLevel = Number(localStorage.getItem("selected_level"));
let levelIndex = Number.isInteger(savedLevel) && savedLevel >= 0 && savedLevel < levels.length
	? savedLevel
	: 0;

const game = localStorage.getItem("game");
const savedName = localStorage.getItem("player_name");
const isDark = localStorage.getItem("darkmode") === "true";

document.body.classList.toggle("dark", isDark);
document.querySelector('meta[name="theme-color"]').content = isDark ? "#171d1a" : "#f5f4f0";
continueButton.style.display = game ? "flex" : "none";
levelButton.firstChild.textContent = `${levels[levelIndex]} `;
if (savedName) nameInput.value = savedName;
else nameInput.focus();

document.querySelector("#dark-mode-toggle").addEventListener("click", () => {
	document.body.classList.toggle("dark");
	const darkMode = document.body.classList.contains("dark");
	localStorage.setItem("darkmode", String(darkMode));
	document.querySelector('meta[name="theme-color"]').content = darkMode ? "#171d1a" : "#f5f4f0";
});

levelButton.addEventListener("click", (event) => {
	levelIndex = (levelIndex + 1) % levels.length;
	localStorage.setItem("selected_level", String(levelIndex));
	event.currentTarget.firstChild.textContent = `${levels[levelIndex]} `;
});

const requirePlayerName = () => {
	if (nameInput.value.trim()) return true;
	nameInput.classList.add("input-err");
	window.setTimeout(() => {
		nameInput.classList.remove("input-err");
		nameInput.focus();
	}, 350);
	return false;
};

document.querySelector("#btn-play").addEventListener("click", () => {
	if (!requirePlayerName()) return;
	localStorage.setItem("player_name", nameInput.value.trim());
	window.location.href = `./game.html?new=1&level=${levelIndex}`;
});

continueButton.addEventListener("click", () => {
	if (!requirePlayerName()) return;
	localStorage.setItem("player_name", nameInput.value.trim());
	window.location.href = "./game.html";
});
