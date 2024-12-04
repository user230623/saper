const levelChoose = document.getElementById('menu');
const boardHTML = document.getElementById('board');
const boardSize = {
    'latwy': 5,
    'sredni': 10,
    'trudny': 20
};
const amountOfBombs = {
    'latwy': 3,
    'sredni': 10,
    'trudny': 50
};
const board = [];
let boardSizeChoosed;
let bombAmountChoosed;
let id;
let bombs = [];
let gameOver = false;
let remainingBombs;
let bombCounterElement;

const getId = (ele) => {
    id = ele.id;
    boardSizeChoosed = boardSize[id];
    bombAmountChoosed = amountOfBombs[id];
    remainingBombs = bombAmountChoosed;
    generateBoard(boardSizeChoosed);
    updateBombCounter();
    levelChoose.remove();
};

const getIdField = (ele) => {
    const fieldId = ele.id;

    if (bombs.includes(fieldId)) {
        endGame();
    } else {
        revealCell(ele);
    }
};

const generateBoard = (size) => {
    const table = document.createElement('table');
    bombs = generateBombs(size);

    bombCounterElement = document.createElement('div');
    bombCounterElement.className = 'bomb-counter';
    boardHTML.appendChild(bombCounterElement);

    for (let i = 0; i < size; i++) {
        const row = document.createElement('tr');
        board[i] = [];

        for (let j = 0; j < size; j++) {
            const cell = document.createElement('td');
            cell.className = 'cell';

            const cellId = `${i}-${j}`;
            cell.id = cellId;

            cell.dataset.row = i;
            cell.dataset.col = j;

            const bombCount = countAdjacentBombs(i, j, size);
            cell.dataset.bombCount = bombCount;

            cell.addEventListener('click', () => {
                if (!gameOver) {
                    getIdField(cell);
                }
            });

            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (!gameOver) {
                    toggleFlag(cell);
                }
            });

            row.appendChild(cell);
            board[i][j] = cell;
        }

        table.appendChild(row);
    }

    const back = document.createElement('button');
    back.addEventListener('click', () => {
        location.reload();
    });
    back.innerText = "Powrót do menu";

    boardHTML.appendChild(table);
    boardHTML.appendChild(back);
};

const generateBombs = (size) => {
    const bombs = [];
    let bombCount = bombAmountChoosed;

    while (bombCount > 0) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        const cellId = `${row}-${col}`;

        if (!bombs.includes(cellId)) {
            bombs.push(cellId);
            bombCount--;
        }
    }

    return bombs;
};

const countAdjacentBombs = (row, col, size) => {
    let bombCount = 0;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;

        if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
            const neighborId = `${newRow}-${newCol}`;
            if (bombs.includes(neighborId)) {
                bombCount++;
            }
        }
    });

    return bombCount;
};

const revealCell = (cell) => {
    if (cell.classList.contains('flagged')) return;

    const bombCount = parseInt(cell.dataset.bombCount, 10);

    if (bombCount > 0) {
        cell.innerHTML = bombCount;
        cell.classList.add('revealed');
    } else {
        revealAdjacentCells(cell);
    }

    checkWin(); // Sprawdź wygraną po każdej odsłoniętej komórce
};

const revealAdjacentCells = (cell) => {
    const size = boardSizeChoosed;
    const queue = [cell];

    while (queue.length > 0) {
        const currentCell = queue.shift();
        const [row, col] = currentCell.id.split('-').map(Number);

        if (currentCell.classList.contains('revealed')) {
            continue;
        }

        currentCell.classList.add('revealed');
        const bombCount = parseInt(currentCell.dataset.bombCount, 10);

        if (bombCount > 0) {
            currentCell.innerHTML = bombCount;
            continue;
        }

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],          [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;

            if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
                const neighborCell = document.getElementById(`${newRow}-${newCol}`);
                if (neighborCell && !neighborCell.classList.contains('revealed')) {
                    queue.push(neighborCell);
                }
            }
        });
    }

    checkWin(); // Sprawdź wygraną po odsłonięciu sąsiadów
};

const toggleFlag = (cell) => {
    if (cell.classList.contains('revealed')) return;

    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        cell.innerHTML = '';
        remainingBombs++;
    } else if (remainingBombs > 0) {
        cell.classList.add('flagged');
        cell.innerHTML = '🚩';
        remainingBombs--;
    }

    updateBombCounter();
};

const updateBombCounter = () => {
    bombCounterElement.innerText = `Pozostałe bomby: ${remainingBombs}`;
};

const endGame = () => {
    gameOver = true;
    alert("Gra zakończona! Trafiłeś na bombę!");

    revealBombs();

    const playAgainButton = document.createElement('button');
    playAgainButton.innerText = "Zagraj ponownie";
    playAgainButton.addEventListener('click', () => {
        boardHTML.innerHTML = '';
        board.length = 0;
        bombs = [];
        gameOver = false;

        remainingBombs = bombAmountChoosed;
        bombCounterElement = null;

        generateBoard(boardSizeChoosed);
        updateBombCounter();
    });
    boardHTML.appendChild(playAgainButton);
};

const revealBombs = () => {
    bombs.forEach(bombId => {
        const bombCell = document.getElementById(bombId);
        bombCell.classList.add('bomb', 'revealed');
    });
};

const checkWin = () => {
    const totalCells = boardSizeChoosed * boardSizeChoosed;
    const revealedCells = document.querySelectorAll('.cell.revealed').length;
    const bombCells = bombs.length;

    if (revealedCells + bombCells === totalCells) {
        gameOver = true;
        alert("Gratulacje! Wygrałeś!");
        revealBombs();

        const playAgainButton = document.createElement('button');
        playAgainButton.innerText = "Zagraj ponownie";
        playAgainButton.addEventListener('click', () => {
            boardHTML.innerHTML = '';
            board.length = 0;
            bombs = [];
            gameOver = false;

            remainingBombs = bombAmountChoosed;
            bombCounterElement = null;

            generateBoard(boardSizeChoosed);
            updateBombCounter();
        });
        boardHTML.appendChild(playAgainButton);
    }
};
