import Graph from "./graph.js";
import MinHeap from "./heap.js";
export class PathFindingAlgorithm {
    constructor(source, target, grid, delayMs = 0) {
        this.source = source;
        this.target = target;
        this.graph = new Graph(grid);
        this.cameFrom = {};
        this.costFromSourceTo = { [source.id]: 0 };
        this.pathFromSourceTo = { [source.id]: [source] };
        this.delayMs = delayMs;
    }
    showPath(target, instant = false, currentIndex = 0) {
        this.target = target;
        if (!(this.target.id in this.pathFromSourceTo)) {
            this.computeAndStorePath(this.target);
        }
        if (!(this.target.id in this.pathFromSourceTo))
            return;
        const path = this.pathFromSourceTo[this.target.id];
        if (instant)
            path.forEach((cell) => cell.setShortestPath());
        else {
            return new Promise((resolve) => {
                if (currentIndex < path.length) {
                    path[currentIndex].setShortestPath();
                    setTimeout(() => {
                        resolve(this.showPath(this.target, instant, currentIndex + 1));
                    }, this.delayMs);
                }
                else
                    resolve();
            });
        }
    }
    computeAndStorePath(toCell) {
        const path = [];
        let current = this.target;
        while (current.id in this.cameFrom) {
            path.push(current);
            current = this.cameFrom[current.id];
        }
        if (current)
            path.push(current);
        path.reverse();
        if (path.length > 0)
            this.pathFromSourceTo[toCell.id] = path;
    }
}
export class Dijkstra extends PathFindingAlgorithm {
    constructor(source, target, grid, delayMs = 0) {
        super(source, target, grid, delayMs);
        this.unsolvedHeap = new MinHeap([[source, 0]], (e) => e[1]);
        this.visited = new Set();
    }
    execute() {
        return new Promise((resolve) => {
            if (this.unsolvedHeap.size > 0) {
                const [current, costFromSourceToCurrent] = this.unsolvedHeap.pop();
                current.setExplored();
                this.visited.add(current);
                if (current.isTarget)
                    return resolve();
                for (const { node: neighbor, cost: costFromCurrentToNeighbor, } of Object.values(this.graph.get(current.id).neighbors)) {
                    const newCostFromSourceToNeighbor = costFromSourceToCurrent + costFromCurrentToNeighbor;
                    if (!this.visited.has(neighbor) &&
                        newCostFromSourceToNeighbor <
                            (this.costFromSourceTo[neighbor.id] ?? Infinity)) {
                        this.costFromSourceTo[neighbor.id] =
                            newCostFromSourceToNeighbor;
                        this.cameFrom[neighbor.id] = current;
                        this.unsolvedHeap.push([
                            neighbor,
                            newCostFromSourceToNeighbor,
                        ]);
                    }
                }
            }
            if (this.unsolvedHeap.size > 0) {
                return setTimeout(() => resolve(this.execute()), this.delayMs);
            }
            return resolve();
        });
    }
}
Dijkstra.algorithmName = "Dijkstra";
Dijkstra.explanation = "Dijkstra algorithm works by initializing the starting node's distance to zero and all other nodes to infinity. Then, it repeatedly selects the unvisited node with the smallest known distance, updates the distances of its neighbors, and marks it as visited. This process continues until all nodes are visited or the shortest path to the target node is found.";
export class AStar extends PathFindingAlgorithm {
    constructor(source, target, grid, delayMs = 0) {
        super(source, target, grid, delayMs);
        this.huristicCostToTarget = {};
        this.huristicCostToTarget[source.id] =
            this.getHuristicCostToTarget(source);
        this.f = structuredClone(this.huristicCostToTarget);
        this.unsolvedHeap = new MinHeap([[source, 0]], (e) => e[1]);
        this.visited = new Set();
    }
    execute() {
        return new Promise((resolve) => {
            if (this.unsolvedHeap.size > 0) {
                const current = this.unsolvedHeap.pop()[0];
                current.setExplored();
                this.visited.add(current);
                if (current.isTarget)
                    return resolve();
                for (const { node: neighbor, cost: costFromCurrentToNeighbor, } of Object.values(this.graph.get(current.id).neighbors)) {
                    const newCostFromSourceToNeighbor = this.costFromSourceTo[current.id] +
                        costFromCurrentToNeighbor;
                    if (!this.visited.has(neighbor) &&
                        newCostFromSourceToNeighbor <
                            (this.costFromSourceTo[neighbor.id] ?? Infinity)) {
                        this.costFromSourceTo[neighbor.id] =
                            newCostFromSourceToNeighbor;
                        this.f[neighbor.id] =
                            this.costFromSourceTo[neighbor.id] +
                                this.getHuristicCostToTarget(neighbor);
                        this.cameFrom[neighbor.id] = current;
                        this.unsolvedHeap.push([neighbor, this.f[neighbor.id]]);
                    }
                }
            }
            if (this.unsolvedHeap.size > 0) {
                return setTimeout(() => resolve(this.execute()), this.delayMs);
            }
            return resolve();
        });
    }
    getHuristicCostToTarget(fromCell) {
        if (!(fromCell.id in this.huristicCostToTarget)) {
            const { row: row1, col: col1 } = fromCell.position;
            const { row: row2, col: col2 } = this.target.position;
            this.huristicCostToTarget[fromCell.id] =
                ((row1 - row2) ** 2 + (col1 - col2) ** 2) ** 0.5;
        }
        return this.huristicCostToTarget[fromCell.id];
    }
}
AStar.algorithmName = "A*";
AStar.explanation = "A* uses a cost function f(n)=g(n)+h(n), where g(n) is the cost to reach node n from the start, and h(n) is the estimated cost from n to the goal. The algorithm prioritizes nodes with the lowest f(n) value, expanding them until the goal is reached.";
export class BellmanFord extends PathFindingAlgorithm {
    execute(n = 0) {
        return new Promise((resolve) => {
            if (n >= this.graph.size)
                return resolve();
            for (const key of this.graph.keys) {
                for (const { node: neighbor, cost: costFromCurrentToNeighbor, } of Object.values(this.graph.get(key).neighbors)) {
                    const newCostFromSourceToNeighbor = this.costFromSourceTo[key] + costFromCurrentToNeighbor;
                    if (newCostFromSourceToNeighbor <
                        (this.costFromSourceTo[neighbor.id] ?? Infinity)) {
                        this.costFromSourceTo[neighbor.id] =
                            newCostFromSourceToNeighbor;
                        this.cameFrom[neighbor.id] = this.graph.get(key).node;
                    }
                }
            }
            this.graph.get(this.graph.keys[n]).node.setExplored();
            return setTimeout(() => resolve(this.execute(n + 1)), this.delayMs);
        });
    }
}
BellmanFord.algorithmName = "Bellman-Ford";
BellmanFord.explanation = "The Bellman-Ford algorithm finds the shortest paths from a source vertex to all other vertices by relaxing all edges up to (V-1) times. It then checks for negative weight cycles by attempting one more relaxation. If any distances are updated, a negative cycle exists.";
