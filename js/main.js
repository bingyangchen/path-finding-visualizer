var _a;
import Cell from "./cell.js";
import Graph from "./graph.js";
import Maze from "./maze.js";
class Main {
    static main() {
        Main.initBoard();
        // Add all event listener
        document.addEventListener("mouseup", Main.onMouseUp);
        Main.NEW_BUTTON_SMALL.onclick = () => {
            Main.cellSize = "small";
            Main.initBoard();
        };
        Main.NEW_BUTTON_MEDIUM.onclick = () => {
            Main.cellSize = "medium";
            Main.initBoard();
        };
        Main.NEW_BUTTON_BIG.onclick = () => {
            Main.cellSize = "big";
            Main.initBoard();
        };
        Main.MAZE_BUTTON.onclick = Main.onClickCreateMaze;
        Main.RUN_BUTTON.onclick = Main.onClickRun;
    }
    static initBoard() {
        Main.PANEL.innerHTML = "";
        if (Main.grid)
            Main.grid.length = 0;
        Main.grid = [];
        const d = Main.cellSize === "small"
            ? 5
            : Main.cellSize === "medium"
                ? 10
                : 15;
        Main.numOfRows = Math.floor((Main.PANEL.clientHeight - 30) / d);
        Main.numOfColumns = Math.floor((Main.PANEL.clientWidth - 30) / d);
        let cellSideLength = 100 / Main.numOfColumns;
        for (let i = 0; i < Main.numOfRows; i++) {
            let rowDiv = document.createElement("div");
            rowDiv.className = "row";
            Main.grid[i] = [];
            for (let j = 0; j < Main.numOfColumns; j++) {
                const cell = new Cell(i, j, cellSideLength);
                rowDiv.appendChild(cell.div);
                Main.grid[i][j] = cell;
                cell.div.onmouseenter = Main.onMouseEnter(cell);
                cell.div.onmousedown = Main.onMouseDownOnCell(cell);
            }
            Main.PANEL.appendChild(rowDiv);
        }
        // Initialize source and target
        Main.source = Main.grid[0][0].setSource();
        Main.target =
            Main.grid[Main.grid.length - 1][Main.grid[0].length - 1].setTarget();
    }
    static onClickCreateMaze() {
        Main.initBoard();
        Main.grid = Maze.createMaze(Main.grid);
    }
    // Recursive Approach
    static dijkstra(unsolvedCells = Main.prepareForDijkstra()) {
        return new Promise((resolve) => {
            let minUnsolvedDistance = Infinity;
            for (let cell of unsolvedCells) {
                if (cell.id in Main.distanceFromSourceTo) {
                    minUnsolvedDistance = Math.min(minUnsolvedDistance, Main.distanceFromSourceTo[cell.id]);
                }
            }
            if (minUnsolvedDistance < Infinity) {
                let cellsToSolve = unsolvedCells.filter((c) => Main.distanceFromSourceTo[c.id] === minUnsolvedDistance);
                if (cellsToSolve.length > 0) {
                    unsolvedCells = unsolvedCells.filter((c) => Main.distanceFromSourceTo[c.id] !==
                        minUnsolvedDistance);
                    for (let w of cellsToSolve) {
                        w.setExplored();
                        if (w.isTarget) {
                            resolve();
                            return;
                        }
                        else {
                            for (let v of Object.values(Main.graph.graph[w.id].neighbors).map((e) => e.node)) {
                                const oldDistance = v.id in Main.distanceFromSourceTo
                                    ? Main.distanceFromSourceTo[v.id]
                                    : Infinity;
                                const newDistance = Math.min(oldDistance, minUnsolvedDistance +
                                    Main.graph.getCost(w, v));
                                if (newDistance !== Infinity) {
                                    if (newDistance < oldDistance) {
                                        Main.distanceFromSourceTo[v.id] =
                                            newDistance;
                                        Main.pathFromSourceTo[v.id] = [
                                            ...(Main.pathFromSourceTo[w.id] ||
                                                []),
                                            v,
                                        ];
                                    }
                                }
                            }
                        }
                    }
                    if (unsolvedCells.length > 0) {
                        setTimeout(() => resolve(Main.dijkstra(unsolvedCells)));
                        return;
                    }
                }
            }
            // Target is not found after exploring all reachable area.
            resolve();
            return;
        });
    }
    static prepareForDijkstra() {
        let unsolvedCells = [...Main.grid.flat()].filter((cell) => cell.id !== Main.source.id);
        Main.pathFromSourceTo = { [Main.source.id]: [Main.source] };
        Main.distanceFromSourceTo = { [Main.source.id]: 0 };
        unsolvedCells.forEach((cell) => {
            const distance = Main.graph.getCost(cell, this.source);
            if (distance !== Infinity) {
                Main.distanceFromSourceTo[cell.id] = distance;
                Main.pathFromSourceTo[cell.id] = [Main.source, cell];
            }
        });
        return unsolvedCells;
    }
    static showPath(path, instant = false, idx = 0) {
        if (instant) {
            for (let cell of path) {
                if (!cell.isSource && !cell.isTarget)
                    cell.setShortestPath();
            }
        }
        else {
            // Recursive
            // Return promise to make the UI stay freezed before showing the whole path.
            return new Promise((resolve) => {
                if (idx < path.length) {
                    let cell = path[idx];
                    if (!cell.isSource && !cell.isTarget) {
                        cell.setShortestPath();
                    }
                    setTimeout(() => resolve(Main.showPath(path, instant, idx + 1)), 5);
                }
                else
                    resolve();
            });
        }
    }
    static clearPath() {
        for (let row of Main.grid) {
            for (let cell of row) {
                if (cell.isShortestPath) {
                    if (cell.isExplored)
                        cell.setExplored();
                }
            }
        }
    }
}
_a = Main;
Main.PANEL = document.getElementById("panel");
Main.NEW_BUTTON_SMALL = document.getElementById("new-btn-small");
Main.NEW_BUTTON_MEDIUM = document.getElementById("new-btn-medium");
Main.NEW_BUTTON_BIG = document.getElementById("new-btn-big");
Main.RUN_BUTTON = document.getElementById("run-btn");
Main.MAZE_BUTTON = document.getElementById("maze-btn");
Main.cellSize = "big";
Main.isMousePressed = false;
Main.isMovingSource = false;
Main.isMovingTarget = false;
Main.onMouseUp = () => {
    Main.isMousePressed = false;
    if (Main.isMovingTarget)
        Main.isMovingTarget = false;
    if (Main.isMovingSource)
        Main.isMovingSource = false;
};
Main.onMouseEnter = (cell) => {
    return () => {
        if (Main.isMousePressed) {
            if (!Main.isMovingTarget && !Main.isMovingSource) {
                cell.setWall();
            }
            else {
                if (Main.isMovingSource && !cell.isTarget) {
                    Main.source.backToStoredState();
                    cell.storeState();
                    Main.source = cell.setSource();
                }
                else if (Main.isMovingTarget && !cell.isSource) {
                    Main.target.backToStoredState();
                    cell.storeState();
                    Main.target = cell.setTarget();
                    Main.clearPath();
                    if (Main.pathFromSourceTo &&
                        Main.target.id in Main.pathFromSourceTo) {
                        Main.showPath(Main.pathFromSourceTo[Main.target.id], true);
                    }
                }
            }
        }
    };
};
Main.onMouseDownOnCell = (cell) => {
    return () => {
        Main.isMousePressed = true;
        cell.setWall();
        if (cell.isSource)
            Main.isMovingSource = true;
        else if (cell.isTarget)
            Main.isMovingTarget = true;
    };
};
Main.onClickRun = async () => {
    // Clear explore history
    for (let row of Main.grid) {
        for (let cell of row) {
            if (cell.isExplored)
                cell.setUnexplored();
        }
    }
    // Remove all event listener
    document.removeEventListener("mouseup", Main.onMouseUp);
    Main.NEW_BUTTON_SMALL.disabled = true;
    Main.NEW_BUTTON_MEDIUM.disabled = true;
    Main.NEW_BUTTON_BIG.disabled = true;
    Main.RUN_BUTTON.disabled = true;
    Main.MAZE_BUTTON.disabled = true;
    for (let row of Main.grid) {
        for (let cell of row) {
            cell.div.onmouseenter = null;
            cell.div.onmousedown = null;
        }
    }
    Main.graph = new Graph(Main.grid);
    //Iterative Approach
    // let dijkstraResult = dijkstra2([6, 1], [2, 2]);
    //Recursive Approach
    await Main.dijkstra();
    if (Main.target.id in Main.pathFromSourceTo) {
        await Main.showPath(Main.pathFromSourceTo[Main.target.id]);
    }
    // Reset all event listener
    document.addEventListener("mouseup", Main.onMouseUp);
    Main.NEW_BUTTON_SMALL.disabled = false;
    Main.NEW_BUTTON_MEDIUM.disabled = false;
    Main.NEW_BUTTON_BIG.disabled = false;
    Main.RUN_BUTTON.disabled = false;
    Main.MAZE_BUTTON.disabled = false;
    for (let row of Main.grid) {
        for (let cell of row) {
            cell.div.onmouseenter = Main.onMouseEnter(cell);
            cell.div.onmousedown = Main.onMouseDownOnCell(cell);
        }
    }
};
Main.main();
// Iterative Approach
// function dijkstra2(src, dest = null) {
//     let distanceFromSourceTo = {};
//     let pathFromSourceTo = {};
//     pathFromSourceTo[src] = [src];
//     let unsolved = JSON.parse(JSON.stringify(allCells));
//     unsolved = unsolved.filter((item) => item !== src);
//     unsolved.forEach(function (each) {
//         if (graph.graph[each][src] !== 0) {
//             distanceFromSourceTo[each] = graph.graph[each][src];
//             pathFromSourceTo[each] = [src, each];
//         } else {
//             distanceFromSourceTo[each] = Infinity;
//         }
//     });
//     distanceFromSourceTo[src] = 0;
//     // let end = new Date().getTime() + 6000;
//     // let frame = 1000 / 300; //30ps
//     // (function loop() {
//     //     let now = new Date().getTime();
//     //     let countend = now + frame;
//     while (unsolved.length !== 0) {
//         // && new Date().getTime() < countend
//         let minD = Infinity;
//         let w = null;
//         unsolved.forEach(function (each) {
//             if (distanceFromSourceTo[each] < minD) {
//                 w = each;
//                 minD = distanceFromSourceTo[w];
//             }
//         });
//         if (w !== null) {
//             unsolved = unsolved.filter((item) => item !== w);
//             grid[w[0]][w[1]].isExplored = true;
//             document.getElementById(`(${w[0]},${w[1]})`).style.backgroundColor =
//                 exploredColor;
//         } else {
//             break;
//         }
//         for (let v in graph.graph[w]) {
//             if (graph.graph[w][v] !== 0 && unsolved.some((x) => x === v)) {
//                 let prev = distanceFromSourceTo[v];
//                 distanceFromSourceTo[v] = Math.min(
//                     prev,
//                     minD + graph.getCost(w, v)
//                 );
//                 if (distanceFromSourceTo[v] !== prev) {
//                     let newPath = JSON.parse(
//                         JSON.stringify(pathFromSourceTo[w])
//                     );
//                     newPath.push([v[0], v[1]]);
//                     pathFromSourceTo[v] = newPath;
//                 }
//             }
//         }
//     }
//     //     if (now < end) {
//     //         window.requestAnimationFrame(loop);
//     //     }
//     // })();
//     if (dest !== null) {
//         try {
//             return {
//                 shortestD: distanceFromSourceTo[dest],
//                 shortestPathFromSourceTo: pathFromSourceTo[dest],
//             };
//         } catch (e) {
//             console.log("Unreachable Destination");
//             return {
//                 shortestD: Infinity,
//                 shortestPathFromSourceTo: [src],
//             };
//         }
//     }
//     return {
//         shortestD: distanceFromSourceTo,
//         shortestPathFromSourceTo: pathFromSourceTo,
//     };
// }
