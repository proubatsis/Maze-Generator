// Example Usage: Create and generate a maze then draw it to a canvas.
// maze = new Maze(32, 32);
// maze.reset();
// maze.generate({x: 0, y:0});
// maze.draw("mazeCanvas", 16, "#0f0");

/** @const {int} */
WALL_TOP = 1 << 3;

/** @const {int} */
WALL_RIGHT = 1 << 2;

/** @const {int} */
WALL_BOTTOM = 1 << 1;

/** @const {int} */
WALL_LEFT = 1 << 0;

/**
* @typedef Coordinate
* @type {object}
* @property {int} x - x coordinate
* @property {int} y - y coordinate
*/

/**
* A cell is the maze.
* @constructor
* @param {int} x - x coordinate of the top left corner of the cell.
* @param {int} y - y coordinate of the top left corner of the cell.
* @param {int} walls - first 4 bits represent a wall.
*/
function MazeCell(x, y, walls)
{
    /**
    * x-coordinate of the cell
    * @member {int}
    */
    this.x = x;
    
    /**
    * x-coordinate of the cell
    * @member {int}
    */
    this.y = y;
    
    /**
    * The walls of a cell represented as bits in the number
    * @member {int}
    */
    this.walls = walls;
    
    /**
    * x and y coordinates of each adjacent cell
    * @member {Coordinate[]}
    */
    this.adjacentCells = [];
    
    /**
    Has the cell been visited by the maze generator?
    * @member {boolean}
    */
    this.visited = false;
}

/**
* Return the adjacent cell coordinates that have not been visited.
* @param {Maze} maze - Maze to check the adjacent cells in
* @returns {Coordinate[]} Adjacent unvisited cell coordinates
*/
MazeCell.prototype.getUnvisitedAdjacents = function(maze)
{
    var unvisited = [];
    
    for(var i = 0; i < this.adjacentCells.length; i++)
    {
        coord = this.adjacentCells[i];
        cell = maze.cells[coord.y][coord.x];
        if(!cell.visited) unvisited.push({x: cell.x, y: cell.y});
    }
    
    return unvisited;
};

/**
* Break the walls between cells.
* Indicate the wall of cellA that should be broken,
* it will also break down the adjacent wall in cellB.
*
* Precondition that cellB is adjacent to cellA appropriate based
* on the wall that is being broken, eg. if cellA's bottom wall
* is being broken then cellB should be below cellA and cellB's top
* wall will be broken.
*
* @param {MazeCell} cellA - The cell which should have its wall broken.
* @param {MazeCell} cellB - The cell who has a wall broken based on cellA's broken wall.
* @param {int} wall - Only one bit should be set to represent the wall (eg. Top wall 0x8)
*/
function breakCellWalls(cellA, cellB, wall)
{
    cellA.walls = cellA.walls & (~wall);
    
    // Break opposite wall on cellB
    if(wall == WALL_TOP || wall == WALL_RIGHT)
    {
        wall = wall >> 2;
    }else
    {
        wall = wall << 2;
    }
    
    cellB.walls = cellB.walls & (~wall);
}

/**
* Create a maze with dimensions width x height.
* @constructor
* @param {int} width - Width of the maze.
* @param {int} height - Height of the maze.
*/
function Maze(width, height)
{
    /**
    * Width of the maze in cells.
    * @member {int}
    */
    this.width = width;
    
    /**
    * Height of the maze in cells.
    * @member {int}
    */
    this.height = height;
}

/** Reset the maze with all cells having four walls */
Maze.prototype.reset = function()
{
    this.cells = [];
    
    for(var y = 0; y < this.height; y++)
    {
        var row = []; // Row of cells
        
        for(var x = 0; x < this.width; x++)
        {
            cell = new MazeCell(x, y, WALL_TOP | WALL_RIGHT | WALL_BOTTOM | WALL_LEFT);
            
            if(x - 1 >= 0)
            {
                // Left
                cell.adjacentCells.push({x: x - 1, y: y});
            }
            if(x + 1 < this.width)
            {
                // Right
                cell.adjacentCells.push({x: x + 1, y: y});
            }
            if(y - 1 >= 0)
            {
                // Top
                cell.adjacentCells.push({x: x, y: y - 1});
            }
            if(y + 1 < this.height)
            {
                // Bottom
                cell.adjacentCells.push({x: x, y: y + 1});
            }
            
            row.push(cell);
        }
        
        this.cells.push(row);
    }
};

/**
* Generate the maze starting from the cell at the given coordinates.
*
* @param {Coordinate} coord - Coordinate to start the maze generation from.
*/
Maze.prototype.generate = function(coord)
{
    var current = this.cells[coord.y][coord.x];
    current.visited = true;
    var adjacents = current.getUnvisitedAdjacents(this);
    
    while(adjacents.length > 0)
    {
        // Next node is adjacent and chosen randomly
        next = adjacents[Math.floor(Math.random() * adjacents.length)];
        nextNode = this.cells[next.y][next.x];
        
        // Break the appropriate walls
        if(next.x > coord.x)
        {
            breakCellWalls(current, nextNode, WALL_RIGHT);
        }else if(next.x < coord.x)
        {
            breakCellWalls(current, nextNode, WALL_LEFT);
        }
        
        if(next.y > coord.y)
        {
            breakCellWalls(current, nextNode, WALL_BOTTOM);
        }else if(next.y < coord.y)
        {
            breakCellWalls(current, nextNode, WALL_TOP);
        }
        
        this.generate(next);
        adjacents = current.getUnvisitedAdjacents(this);
    }
};

/**
* Draw the maze on an HTML canvas.
*
* @param {string} canvasId - id of the canvas.
* @param {int} wallSize - length/width of square cell wall.
* @param {string} color - Hex representation of a color (Starts with #)
*/
Maze.prototype.draw = function(canvasId, wallSize, color)
{
    var THICKNESS = 4;
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");
    
    context.fillStyle = color;
    
    for(var y = 0; y < this.height; y++)
    {
        for(var x = 0; x < this.width; x++)
        {
            walls = this.cells[y][x].walls;
            
            if((walls & WALL_TOP) == WALL_TOP)
            {
                context.fillRect(x * wallSize, y * wallSize, wallSize, THICKNESS);
            }
            if((walls & WALL_RIGHT) == WALL_RIGHT)
            {
                context.fillRect((x + 1) * wallSize, y * wallSize, THICKNESS, wallSize);
            }
            if((walls & WALL_BOTTOM) == WALL_BOTTOM)
            {
                context.fillRect(x * wallSize, (y + 1) * wallSize, wallSize, THICKNESS);
            }
            if((walls & WALL_LEFT) == WALL_LEFT)
            {
                context.fillRect(x * wallSize, y * wallSize, THICKNESS, wallSize);
            }
            
        }
    }
};
