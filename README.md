# Good Number

A calm, responsive Sudoku game built with plain HTML, CSS, and JavaScript. It is designed to feel at home on a phone or desktop, with tactile board styling, a focused play layout, and no build step.

## Play locally

Open `index.html` in a modern browser. The game uses browser local storage to remember your name, theme, current puzzle, and elapsed time.

## Features

- Six puzzle levels, from Easy to Inhuman
- Generated Sudoku boards with progress tracking and a session timer
- Pause, resume, erase, and continue a saved puzzle
- Mouse, touch, number-pad, and keyboard input
- Related row, column, and box highlighting
- Dark mode and responsive layouts
- Completion checks that validate rows, columns, and 3×3 boxes

### Keyboard controls

- `1`–`9`: enter a number in the selected cell
- `Backspace` or `Delete`: erase the selected cell
- Arrow keys: move the selection
- `Escape`: pause the game

## Project structure

```text
index.html
static/
  design/styles.css
  js/app.js
  js/constant.js
  js/sudoku.js
  images/
```
