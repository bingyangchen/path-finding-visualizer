class Cell {
    constructor(rowNum, colNum, sideLengthPercent) {
        this.prevState = {
            isWall: false,
            explored: false,
            isShortestPath: false,
        };
        this._isWall = false;
        this._isSource = false;
        this._isTarget = false;
        this._explored = false;
        this._isShortestPath = false;
        this.div = document.createElement("div");
        this.div.id = `(${rowNum},${colNum})`;
        this.div.className = "cell";
        this.div.style.width = `${sideLengthPercent}%`;
    }
    get id() {
        return this.div.id;
    }
    get isWall() {
        return this._isWall;
    }
    get isSource() {
        return this._isSource;
    }
    get isTarget() {
        return this._isTarget;
    }
    get explored() {
        return this._explored;
    }
    get isShortestPath() {
        return this._isShortestPath;
    }
    get position() {
        const pos = this.div.id.replace(/\(+|\)+/g, "").split(",");
        return { row: parseInt(pos[0]), col: parseInt(pos[1]) };
    }
    setBlank() {
        this.storeState();
        this._isWall = false;
        this._isSource = false;
        this._isTarget = false;
        this._explored = false;
        this._isShortestPath = false;
        this.div.classList.remove(...Cell.cellClasses, "with-hint");
        this.div.removeAttribute("data-hint-text");
    }
    setSource() {
        this.storeState();
        this._isWall = false;
        this._isSource = true;
        this._isTarget = false;
        this._explored = false;
        this._isShortestPath = false;
        this.div.classList.remove(...Cell.cellClasses);
        this.div.classList.add("source", "with-hint");
        this.div.setAttribute("data-hint-text", "Source");
        return this;
    }
    setTarget() {
        this.storeState();
        this._isWall = false;
        this._isSource = false;
        this._isTarget = true;
        this._explored = false;
        this._isShortestPath = false;
        this.div.classList.remove(...Cell.cellClasses);
        this.div.classList.add("target", "with-hint");
        this.div.setAttribute("data-hint-text", "Target");
        return this;
    }
    setExplored(force = false) {
        if (!force && this._isWall)
            return;
        this.storeState();
        this._explored = true;
        if (!force && (this.isSource || this.isTarget))
            return;
        this._isWall = false;
        this._isSource = false;
        this._isTarget = false;
        this._isShortestPath = false;
        this.div.classList.remove(...Cell.cellClasses, "with-hint");
        this.div.classList.add("explored");
        this.div.removeAttribute("data-hint-text");
    }
    setShortestPath(force = false) {
        if (!force &&
            (this.isSource || this.isTarget || this.isWall || !this.explored)) {
            return;
        }
        this.storeState();
        this._isWall = false;
        this._isSource = false;
        this._isTarget = false;
        this._explored = true;
        this._isShortestPath = true;
        this.div.classList.remove(...Cell.cellClasses, "with-hint");
        this.div.classList.add("explored", "path");
        this.div.removeAttribute("data-hint-text");
    }
    setWall(force = false) {
        if (!force && (this.isSource || this.isTarget))
            return;
        this.storeState();
        if (!this._isWall) {
            this._isWall = true;
            this._isSource = false;
            this._isTarget = false;
            this._explored = false;
            this._isShortestPath = false;
            this.div.classList.remove(...Cell.cellClasses, "with-hint");
            this.div.classList.add("wall");
        }
        else
            this.setBlank();
        this.div.removeAttribute("data-hint-text");
    }
    storeState() {
        this.prevState = {
            isWall: this._isWall,
            explored: this._explored,
            isShortestPath: this._isShortestPath,
        };
    }
    backToPrevState() {
        if (this.prevState.isWall)
            this.setWall(true);
        else if (this.prevState.isShortestPath)
            this.setShortestPath(true);
        else if (this.prevState.explored)
            this.setExplored(true);
        else
            this.setBlank();
    }
}
Cell.cellClasses = [
    "wall",
    "target",
    "explored",
    "source",
    "path",
];
export default Cell;
