import Graph from "./graph.js";
export default class Maze {
    static createMaze(grid) {
        for (const row of grid) {
            for (const cell of row) {
                if (cell.position.row % 2 !== 0 ||
                    cell.position.col % 2 !== 0) {
                    cell.setWall();
                }
            }
        }
        return Maze.pruneMazeWall(Maze.wilsonMazeGraph(grid), grid);
    }
    static wilsonMazeGraph(grid) {
        const mazeGrid = [];
        for (let i = 0; i < (grid.length + 1) / 2; i++) {
            const row = [];
            for (let j = 0; j < (grid[0].length + 1) / 2; j++) {
                row.push({
                    id: `(${i},${j})`,
                    isWall: false,
                    position: { row: i, col: j },
                });
            }
            mazeGrid.push(row);
        }
        let mazeNodes = mazeGrid.flat();
        const mazeGraph = new Graph(mazeGrid);
        const UST = [mazeNodes.shift()];
        while (mazeNodes.length > 0) {
            const currentNode = mazeNodes.shift();
            const path = [currentNode];
            let tempNode = currentNode;
            while (!UST.some((node) => node.id === tempNode.id)) {
                const randomIdx = (Object.keys(mazeGraph.get(tempNode.id).neighbors).length *
                    Math.random()) <<
                    0;
                const randomNeighbor = Object.values(mazeGraph.get(tempNode.id).neighbors)[randomIdx].node;
                path.push(randomNeighbor);
                tempNode = randomNeighbor;
            }
            for (let i = 0; i < path.length; i++) {
                for (let j = path.length - 1; j > i; j--) {
                    if (path[j].id === path[i].id) {
                        path.splice(i + 1, j - i);
                        break;
                    }
                }
            }
            for (let i = 0; i < path.length; i++) {
                mazeNodes = mazeNodes.filter((node) => node.id !== path[i].id);
                if (i !== path.length - 1) {
                    mazeGraph.get(path[i].id).neighbors[path[i + 1].id].cost = 0;
                    mazeGraph.get(path[i + 1].id).neighbors[path[i].id].cost = 0;
                    UST.push(path[i]);
                }
            }
        }
        return mazeGraph;
    }
    static pruneMazeWall(mazeGraph, grid) {
        for (const i of mazeGraph.keys) {
            for (const j in mazeGraph.get(i).neighbors) {
                if (mazeGraph.get(i).neighbors[j].cost === 0) {
                    const iPlusJ = {
                        row: mazeGraph.get(i).node.position.row +
                            mazeGraph.get(i).neighbors[j].node.position.row,
                        col: mazeGraph.get(i).node.position.col +
                            mazeGraph.get(i).neighbors[j].node.position.col,
                    };
                    if (iPlusJ.row < grid.length &&
                        iPlusJ.col < grid[0].length &&
                        !grid[iPlusJ.row][iPlusJ.col].isTarget &&
                        !grid[iPlusJ.row][iPlusJ.col].isSource) {
                        grid[iPlusJ.row][iPlusJ.col].setBlank();
                    }
                }
            }
        }
        return grid;
    }
}
