const newGrid = (size) => {
    let arr = new Array(size);

    for (let i = 0; i < size; i++) {
        arr[i] = new Array(size);  
    }

    for (let i = 0; i < Math.pow(size, 2); i++) {
        arr[Math.floor(i/size)][i%size] = CONSTANT.UNASSIGNED;
    }

    return arr;
}

const isColSafe = (grid, col, value) => {
    for (let row = 0; row < CONSTANT.GRID_SIZE; row++) {
        if (grid[row][col] === value) return false;
    }
    return true;
}

const isRowSafe = (grid, row, value) => {
    for (let col = 0; col < CONSTANT.GRID_SIZE; col++) {
        if (grid[row][col] === value) return false;
    }
    return true;
}

const isBoxSafe = (grid, box_row, box_col, value) => {
    for (let row = 0; row < CONSTANT.BOX_SIZE; row++) {
        for (let col = 0; col < CONSTANT.BOX_SIZE; col++) {
            if (grid[row + box_row][col + box_col] === value) return false;
        }
    }
    return true;
}

const isSafe = (grid, row, col, value) => {
    return isColSafe(grid, col, value) && isRowSafe(grid, row, value) && isBoxSafe(grid, row - row%3, col - col%3, value) && value !== CONSTANT.UNASSIGNED;
}


const findUnassignedPos = (grid, pos) => {
    for (let row = 0; row < CONSTANT.GRID_SIZE; row++) {
        for (let col = 0; col < CONSTANT.GRID_SIZE; col++) {
            if (grid[row][col] === CONSTANT.UNASSIGNED) {
                pos.row = row;
                pos.col = col;
                return true;
            }
        }
    }
    return false;
}

const shuffleArray = (arr) => {
    let curr_index = arr.length;

    while (curr_index !== 0) {
        let rand_index = Math.floor(Math.random() * curr_index);
        curr_index -= 1;

        let temp = arr[curr_index];
        arr[curr_index] = arr[rand_index];
        arr[rand_index] = temp;
    }

    return arr;
}

const isFullGrid = (grid) => {
    return grid.every((row, i) => {
        return row.every((value, j) => {
            return value !== CONSTANT.UNASSIGNED;
        });
    });
}

const sudokuCreate = (grid) => {
    const unassignedPos = {
        row: -1,
        col: -1
    };

    if (!findUnassignedPos(grid, unassignedPos)) return true;

    const numberList = shuffleArray([...CONSTANT.NUMBERS]);
    const { row, col } = unassignedPos;

    for (const num of numberList) {
        if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (sudokuCreate(grid)) return true;
            grid[row][col] = CONSTANT.UNASSIGNED;
        }
    }

    return false;
}

const sudokuCheck = (grid) => {
    if (!isFullGrid(grid)) return false;

    const target = new Set(CONSTANT.NUMBERS);
    const hasEveryNumber = (values) =>
        values.length === CONSTANT.GRID_SIZE &&
        new Set(values).size === CONSTANT.GRID_SIZE &&
        values.every((value) => target.has(value));

    for (let index = 0; index < CONSTANT.GRID_SIZE; index++) {
        const row = grid[index];
        const column = grid.map((currentRow) => currentRow[index]);

        if (!hasEveryNumber(row) || !hasEveryNumber(column)) return false;
    }

    for (let boxRow = 0; boxRow < CONSTANT.GRID_SIZE; boxRow += CONSTANT.BOX_SIZE) {
        for (let boxCol = 0; boxCol < CONSTANT.GRID_SIZE; boxCol += CONSTANT.BOX_SIZE) {
            const box = [];
            for (let row = 0; row < CONSTANT.BOX_SIZE; row++) {
                for (let col = 0; col < CONSTANT.BOX_SIZE; col++) {
                    box.push(grid[boxRow + row][boxCol + col]);
                }
            }
            if (!hasEveryNumber(box)) return false;
        }
    }

    return true;
}

const rand = () => Math.floor(Math.random() * CONSTANT.GRID_SIZE);

const removeCells = (grid, level) => {
    const res = grid.map((row) => [...row]);
    let attempts = level;
    while (attempts > 0) {
        let row = rand();
        let col = rand();
        while (res[row][col] === 0) {
            row = rand();
            col = rand();
        }
        res[row][col] = CONSTANT.UNASSIGNED;
        attempts--;
    }
    return res;
}

const sudokuGen = (level) => {
    let sudoku = newGrid(CONSTANT.GRID_SIZE);
    let check = sudokuCreate(sudoku);
    if (check) {
        let question = removeCells(sudoku, level);
        return {
            original: sudoku,
            question: question
        }
    }
    return undefined;
}