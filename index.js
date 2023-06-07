const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Events
} = Matter;

// const width = 600
// const height = 600
// const unitLength = width / gridSize;
// const gridSize = 8;

const gridHorizontal = 15;
const gridVertical = 15;
const width = window.innerWidth
const height = window.innerHeight

const unitLengthX = width / gridHorizontal;
const unitLengthY = height / gridVertical;


const engine = Engine.create();
engine.world.gravity.y = 0;

const { world } = engine;
const render = Render.create({
    element: document.body,
    engine,
    options: {
        wireframes: false,
        width,
        height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

//walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {
        label: 'wall',
        isStatic: true
    }),
    Bodies.rectangle(width / 2, height, width, 2, {
        label: 'wall',
        isStatic: true
    }),
    Bodies.rectangle(0, height / 2, 2, height, {
        label: 'wall',
        isStatic: true
    }),
    Bodies.rectangle(width, height / 2, 2, height, {
        label: 'wall',
        isStatic: true
    })
];
World.add(world, walls);


// maze generation
//creating the shuffle function to insure the randomizing element inside the maze

const shuffle = arr => {
    let arrLen = arr.length;

    while (arrLen > 0) {
        const randIndex = Math.floor(Math.random() * arrLen);

        arrLen--;

        const temp = arr[arrLen];
        arr[arrLen] = arr[randIndex];
        arr[randIndex] = temp;
    }
    return arr
};
// end of shuffle

//Maze generation continue;
const grid = Array(gridVertical)
    .fill(null)
    .map(() => Array(gridHorizontal).fill(false));

const verticals = Array(gridVertical)
    .fill(null)
    .map(() => Array(gridHorizontal - 1).fill(false));

const horizontals = Array(gridVertical - 1)
    .fill(null)
    .map(() => Array(gridVertical).fill(false));

const startRow = Math.floor(Math.random() * gridVertical);
const startCol = Math.floor(Math.random() * gridHorizontal);

//create a recursive function that gonna go through every cell
const stepThroughCell = (row, col) => {
    //the base condition return if the cell has been visited
    if (grid[row][col]) {
        return;
    }
    //Mark the cell visited meanning change it's value to true;
    grid[row][col] = true;
    //Assembly random-ordered list of neighbors;
    const neighbors = shuffle([
        [row - 1, col, 'up'],
        [row, col + 1, 'right'],
        [row + 1, col, 'down'],
        [row, col - 1, 'left']
    ]);

    //for each neighbor...
    for (let neighbor of neighbors) { //getting to iterate into neighbors pairs
        const [nextRow, nextCol, direction] = neighbor; //each pair to distrbuted into those variables

        //check if the neigbor out of boundry
        if (nextRow < 0 || nextRow >= gridVertical ||
            nextCol < 0 || nextCol >= gridHorizontal) {
            continue;
        }
        //if we have visited that neighbor, continue to next neihbor
        if (grid[nextRow][nextCol]) continue;
        //Remove a wall from either horizantals or verticals. change it's value to true;
        if (direction === 'left') {
            verticals[row][col - 1] = true;
        } else if (direction === 'right') {
            verticals[row][col] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][col] = true
        } else if (direction === 'down') {
            horizontals[row][col] = true;
        }
        //Visit that next cell
        stepThroughCell(nextRow, nextCol)
    }
};
stepThroughCell(startRow, startCol);
//will loop through the H and V arrays to print a wall or space crossponding to the false and true values
horizontals.forEach((row, rowIndex) => {
    row.forEach((space, colIndex) => {
        if (space) return;

        const wall = Bodies.rectangle(
            colIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5, {
                label: 'Wall',
                isStatic: true,
                render: { 
                    fillStyle: '#f72585'
                }
            }
        );
        World.add(world, wall);
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((space, colIndex) => {
        if (space) return;

        const wall = Bodies.rectangle(
            colIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY, {
                label: 'Wall',
                isStatic: true,
                render: { 
                    fillStyle: '#ccff33'
                }
            }
        );
        World.add(world, wall);
    })
})

//target and destination
const target = Bodies.rectangle(
    width - unitLengthX / 3,
    height - unitLengthY / 3,
    unitLengthX * 1.4,
    unitLengthY * 1.4, {
        label: 'Target',
        isStatic: true,
        render: { 
            fillStyle: '#97DC21'
        }
    }
);
World.add(world, target);

//Shape to move to target
// const squareRadius = Math.min(unitLengthX, unitLengthY) / 2;
// const shape = Bodies.shape()

const square = Bodies.rectangle(
    unitLengthX / 2,
    unitLengthY / 2,
    unitLengthX * .5,
    unitLengthY * .5, {
        label: 'Square',
        render: { 
            fillStyle: '#f72585'
        }
    }
)
World.add(world, square)

document.addEventListener('keydown', e => {
  const { x, y } = square.velocity;
  if (e.key === 'ArrowUp'){
      Body.setVelocity(square, {x: x, y: y - 1})
  } else if (e.key === 'ArrowRight'){
      Body.setVelocity(square, {x: x + 1, y})
  } else if (e.key === 'ArrowDown'){
    Body.setVelocity(square, {x: x, y: y + 1})
  } else if (e.key === 'ArrowLeft'){
        Body.setVelocity(square, {x: x - 1, y})
    }
})


// Winning

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['Square', 'Target'];

        if (
            labels.includes(collision.bodyA.label) && 
            labels.includes(collision.bodyB.label)
            )
            {
                document.querySelector('.winner').classList.remove('hidden');
                world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if (body.label === 'Wall'){
                        Body.setStatic(body, false);
                    }
                });  
            }
    })
})